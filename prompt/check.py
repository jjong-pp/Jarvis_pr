#!/usr/bin/env python3
"""하네스 정합성 검사 — harness/SPEC.md의 선언을 기계로 검증한다.

원칙: 선언한 필드는 전부 검사한다. 검사하지 않을 필드는 만들지 않는다.
(2026-08-15 평가 지적 — 상태 앵커 7개 중 5개가 틀린 채 통과했다)

    python harness/check.py          모든 검사
    python harness/check.py --quiet  실패만 출력 (훅에서 호출)

exit 0 = 통과, 1 = 실패.
"""
import io
import os
import re
import sys
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parent.parent)
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DECL_RE = re.compile(r"정본:\s*(?P<jb>[^·\n>]+?)\s*(?:·|\n)")
ANCHOR_RE = re.compile(r"상태:\s*project_state\.md#(?P<a>[^\n·]*)")
# 본문에서 참조하는 하네스 내부 경로
LINK_RE = re.compile(r"`(\.claude/(?:rules|skills|hooks|agents|commands)/[^`\s]+|harness/[^`\s]+)`")
TOKEN_CAP = 5000

fails, warns = [], []


def toks(text: str) -> int:
    """한글 음절 1토큰 + 그 외 3.5자당 1토큰 (±15%)."""
    h = sum(1 for c in text if "가" <= c <= "힣")
    return h + int((len(text) - h) * 2 / 7)


def read(p: Path) -> str:
    return io.open(p, encoding="utf-8").read()


def check_skills():
    skills = sorted(ROOT.glob(".claude/skills/*/SKILL.md"))
    if not skills:
        fails.append("스킬이 하나도 없다 — .claude/skills/*/SKILL.md")
        return skills
    heads = [l.rstrip()[4:] for l in read(ROOT / "project_state.md").splitlines()
             if l.startswith("### ")] if (ROOT / "project_state.md").is_file() else []

    for sk in skills:
        folder = sk.parent.name
        text = read(sk)
        tag = f"skills/{folder}"

        # 1. name — 규격(a-z 0-9 하이픈) + 폴더명 일치
        m = re.search(r"^name:\s*(.+)$", text, re.M)
        if not m:
            fails.append(f"{tag}: name 미선언")
        else:
            name = m.group(1).strip()
            if not NAME_RE.match(name):
                fails.append(f"{tag}: name '{name}' 규격 위반 (소문자·숫자·하이픈만, 연속/양끝 하이픈 불가)")
            elif name != folder:
                fails.append(f"{tag}: name '{name}' != 폴더명 '{folder}'")

        # 2. description — 필수, 1024자 이하
        d = re.search(r"^description:\s*(.+)$", text, re.M)
        if not d:
            fails.append(f"{tag}: description 미선언")
        elif len(d.group(1)) > 1024:
            fails.append(f"{tag}: description {len(d.group(1))}자 (상한 1024)")

        # 3. 정본 — 경로 실재
        j = DECL_RE.search(text)
        if not j:
            fails.append(f"{tag}: 정본 미선언")
        else:
            jb = j.group("jb").strip()
            if jb not in ("없음", "미정", "-") and not (ROOT / jb).exists():
                fails.append(f"{tag}: 정본 '{jb}' 이(가) 없다")

        # 4. 상태 앵커 — 현황판 제목과 접두 일치
        a = ANCHOR_RE.search(text)
        if a and heads:
            anc = a.group("a").strip()
            if not any(h.startswith(anc) for h in heads):
                fails.append(f"{tag}: 상태 앵커 '#{anc}' 에 해당하는 현황판 제목이 없다")

        # 5. 컴팩션 절단선 — 함정 절이 앞 5,000토큰 안에 있는가
        cum, trap_end, total = 0, None, 0
        for line in text.splitlines():
            cum += toks(line)
            if line.startswith("## ") and trap_end is None and "함정" not in line and cum > TOKEN_CAP:
                pass
            if line.startswith("## ") and trap_end == "open":
                trap_end = cum
            if line.startswith("## ") and "함정" in line:
                trap_end = "open"
        total = cum
        if trap_end == "open":
            trap_end = total
        if trap_end is None:
            warns.append(f"{tag}: 함정 절이 없다 ({total}토큰)")
        elif trap_end > TOKEN_CAP:
            fails.append(f"{tag}: 함정 절이 {trap_end}토큰에서 끝난다 — 컴팩션 재주입 상한 {TOKEN_CAP} 밖. "
                         f"상세를 references/ 로 옮겨라 (harness/SPEC.md 3절)")
        elif total > TOKEN_CAP:
            warns.append(f"{tag}: {total}토큰 (상한 초과 {total-TOKEN_CAP}) — 함정까지는 생존하나 꼬리가 잘린다")
    return skills


def check_links(skills):
    """저장소 전역: 하네스 내부 경로를 가리키는 죽은 참조."""
    targets = list(ROOT.glob("*.md")) + list(ROOT.glob(".claude/**/*.md")) + list(ROOT.glob("harness/**/*.md"))
    for f in targets:
        if ".claude/archive" in str(f).replace("\\", "/"):
            continue
        try:
            text = read(f)
        except Exception:
            continue
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        for mm in LINK_RE.finditer(text):
            p = mm.group(1)
            if any(c in p for c in "*?<>"):  # 글롭·플레이스홀더는 검사 대상 아님
                continue
            if (ROOT / p).exists():
                continue
            # 지침 로그의 이관 이력은 의도된 과거 참조다
            line = text[text.rfind("\n", 0, mm.start()) + 1: text.find("\n", mm.end())]
            if "종전" in line or "이관" in line or "정정]" in line:
                continue
            fails.append(f"{rel}: 죽은 참조 '{p}'")


def check_l1():
    files = [ROOT / "AGENTS.md", ROOT / "CLAUDE.md"] + sorted(ROOT.glob(".claude/rules/*.md"))
    n = sum(len(read(p).splitlines()) for p in files if p.is_file())
    if n > 145:
        warns.append(f"L1 {n}줄 (임계 145) — 특정 작업에만 참인 내용을 .claude/skills/ 로 내려라")
    st = ROOT / "project_state.md"
    if st.is_file():
        m = len(read(st).splitlines())
        if m > 60:
            warns.append(f"L3 project_state.md {m}줄 (임계 60) — 상세를 각 프로젝트 상태 문서로")
    return n


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    quiet = "--quiet" in sys.argv
    skills = check_skills()
    check_links(skills)
    n = check_l1()

    if not quiet:
        print(f"[하네스] L1 {n}줄 · L2 스킬 {len(skills)}개")
    for w in warns:
        print(f"  주의  {w}")
    for f in fails:
        print(f"  실패  {f}")
    if not fails and not quiet:
        print("  검사 통과")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()

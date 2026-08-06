#!/usr/bin/env python3
"""PreToolUse(Bash|PowerShell) — 위험한 셸 명령 차단.

exit 0 + 출력 없음 = 허용, deny JSON 출력 = 차단.
"""
import json
import re
import sys


def deny(reason: str) -> None:
    # ensure_ascii 기본값(True) 유지 — 콘솔 인코딩과 무관하게 안전한 ASCII JSON 출력
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main() -> None:
    try:
        # Windows 기본 stdin 인코딩(cp949)로 한글 경로 파싱이 깨지지 않도록 UTF-8 강제
        sys.stdin.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    cmd = (data.get("tool_input") or {}).get("command") or ""
    if not cmd:
        sys.exit(0)

    rules = [
        # 1. 광범위 삭제 (bash / PowerShell)
        (r"\brm\b\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+(/|\*|~|\$HOME|\.\.)",
         "차단: 광범위 삭제 명령 (rm -rf /, *, ~ 등). 특정 경로를 명시해서 다시 시도하세요."),
        (r"Remove-Item\s+.*-Recurse.*\s+(/|C:\\\s|\*|~)\s*$",
         "차단: 광범위 재귀 삭제. 특정 경로를 명시해서 다시 시도하세요."),
        # 2. 커밋 안 된 작업 파괴
        (r"git\s+reset\s+--hard",
         "차단: git reset --hard 금지. 커밋 안 된 작업이 사라집니다. git stash를 사용하세요."),
        (r"git\s+clean\s+-[a-zA-Z]*f",
         "차단: git clean -f 금지. 추적되지 않는 파일(작업 폴더 포함)이 영구 삭제됩니다."),
        # 3. git hook 우회
        (r"--no-verify\b",
         "차단: --no-verify로 git hook 우회 금지."),
        # 4. 강제 push (히스토리 파괴)
        (r"git\s+push\s+.*(--force\b|-f\b)",
         "차단: 강제 push 금지. 원격 히스토리가 파괴될 수 있습니다."),
    ]

    for pattern, reason in rules:
        if re.search(pattern, cmd, flags=re.IGNORECASE):
            deny(reason)

    sys.exit(0)


if __name__ == "__main__":
    main()

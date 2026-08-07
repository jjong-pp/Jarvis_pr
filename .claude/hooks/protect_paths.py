#!/usr/bin/env python3
"""PreToolUse(Write|Edit) — 보호 파일 수정 차단.

exit 0 + 출력 없음 = 허용, deny JSON 출력 = 차단.
"""
import json
import re
import sys
from pathlib import PurePath


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

    file_path = (data.get("tool_input") or {}).get("file_path") or ""
    if not file_path:
        sys.exit(0)

    p = PurePath(file_path)
    name = p.name.lower()
    normalized = str(p).replace("\\", "/")

    # 1. 시크릿/키 파일
    secret_patterns = [
        r"^\.env($|\.)", r"\.pem$", r"\.key$", r"\.p12$", r"\.jks$", r"\.keystore$",
        r"service-account.*\.json$", r"^firebase.*\.json$",
        r"^id_rsa($|\.)", r"^id_ed25519($|\.)", r"^id_ecdsa($|\.)",
    ]
    for pat in secret_patterns:
        if re.search(pat, name):
            deny(f"차단: 시크릿/키 파일({p.name})은 Claude가 수정할 수 없습니다. 사람이 직접 수정하세요.")

    # 2. 원본 비즈니스 문서 (계약서·견적서·명세서 등) — 바이너리 원본은 수정 금지
    if re.search(r"\.(pdf|hwp|hwpx)$", name):
        deny(f"차단: 원본 문서({p.name})는 수정 금지. 내용 변경이 필요하면 별도 마크다운으로 초안을 작성하세요.")

    # 3. 룰 참고용 폴더 — 읽기 전용 레퍼런스 스냅샷
    if "/룰 참고용/" in f"/{normalized}/":
        deny("차단: '룰 참고용/' 폴더는 읽기 전용 레퍼런스입니다. 필요한 내용은 복사해서 사용하세요.")

    # 4. 하네스 자기 보호 — 안전장치 자체가 조용히 무력화되는 것을 방지
    if re.search(r"(^|/)\.claude/(hooks/|settings\.json$)", normalized):
        deny("차단: 하네스 파일(.claude/hooks/, settings.json)은 자동 수정 금지. "
             "변경안을 diff로 채팅에 제시하고 사람이 직접 반영하세요.")

    sys.exit(0)


if __name__ == "__main__":
    main()

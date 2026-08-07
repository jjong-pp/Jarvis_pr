#!/usr/bin/env python3
"""SessionStart — project_state.md를 세션 컨텍스트에 자동 주입.

stdout으로 출력된 내용이 세션 시작 시 컨텍스트에 추가된다.
CLAUDE.md의 지시("파일을 읽어라")에 의존하지 않는 결정적(deterministic) 부팅.
"""
import datetime
import os
import re
import sys
from pathlib import Path


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or ".")
    state = root / "project_state.md"
    if not state.is_file():
        print("[session_boot] project_state.md가 없습니다. 새로 만들지 사용자에게 확인하세요.")
        return

    try:
        text = state.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[session_boot] project_state.md 읽기 실패: {e}")
        return

    print("=== project_state.md (SessionStart 훅 자동 주입) ===")
    print(text.strip())
    print("=== 주입 끝 ===")

    # 현황판 신선도 경고: '마지막 갱신: YYYY-MM-DD'가 오늘이 아니면 알림
    m = re.search(r"마지막 갱신:\s*(\d{4})-(\d{2})-(\d{2})", text)
    if m:
        try:
            updated = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            days = (datetime.date.today() - updated).days
            if days >= 3:
                print(f"[주의] 현황판이 {days}일 묵었습니다. 이번 세션 마무리에 /정리로 갱신을 권장합니다.")
        except ValueError:
            pass


if __name__ == "__main__":
    main()

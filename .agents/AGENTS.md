# Jarvis Committee Global Rules (Workspace Level)

이 워크스페이스(SecondBrain)가 로드될 때마다 메인 에이전트(Antigravity)는 반드시 다음 규칙을 최우선으로 준수하고 백그라운드에서 실행해야 합니다.

## 1. Zero-Prompt Initialization (자동 복원)
새로운 대화 세션이 시작되면, 사용자의 명시적인 지시가 없더라도 백그라운드에서 조용히 다음 행동을 수행하십시오.
1. 워크스페이스 내의 `03_Resources/Agents` 디렉토리에 있는 7개의 마크다운 프롬프트 파일(리서치, 아이디어, 전략, 리스크, 운영, DB, 브리핑)을 스캔합니다.
2. `define_subagent` 도구를 사용하여 이 7명의 에이전트를 시스템 메모리에 즉시 재정의(Registration) 하십시오.
   - 이름 매핑: 리서치, 아이디어, 전략, 리스크, 운영, DB, 브리핑
   - (경고) 정의만 할 뿐, `invoke_subagent`를 통해 화면에 띄우거나 먼저 발화하지 말고 대기(Idle) 상태로 둡니다.

## 2. Boot Skill 대기
사용자가 "boot" 또는 "자비스 기동"이라는 키워드를 입력하면, `.agents/skills/jarvis_boot/SKILL.md` 에 정의된 스킬 매크로를 우선적으로 트리거하여 즉각적인 UI 복원 및 지식 동기화를 수행하십시오.

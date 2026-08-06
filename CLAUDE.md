# SecondBrain / 자비스 위원회 워크스페이스 규칙

이 저장소는 PARA 방법론 기반 개인 지식관리 시스템("세컨드 브레인")이자, 7인 AI 위원회("자비스 위원회")가 함께 일하는 작업공간입니다. 철학과 배경은 `README.md` 참고.

## 폴더 구조
- `00_Inbox` — 정리 안 된 파편 아이디어 임시 보관
- `01_Projects` — 진행 중인 프로젝트 (세션 부팅 시 자동 스캔 대상)
- `02_Areas` — 지속 관리 책임 영역
- `03_Resources` — 참고 자료 (위원회가 조사/생성한 결과물)
- `04_Archive` — 완료/보관
- `Templates/Basic_Note_Template.md` — 새 노트 작성 시 이 템플릿의 frontmatter를 따를 것

## 노트 표준 (YAML frontmatter)
모든 노트는 상단에 다음을 포함합니다: `aliases`, `tags`, `created`, `status`(📝inbox / ⏳processing / ✅done), `publish_to_notion`.

## 세션 부팅 규칙 (자동 컨텍스트 복원)
새 세션에서 사용자의 첫 메시지에 응답하기 **전에**, 매번 다음을 조용히 수행합니다:
1. `01_Projects/*.md` 파일 목록과 최근 수정 시각을 훑어 진행 중인 프로젝트를 파악한다 (`_index.md`는 제외).
2. 3~5줄 이내로 "현재 진행 중인 프로젝트: …" 형태로 짧게 먼저 보고한 뒤, 사용자의 실제 요청에 응답한다.
3. `01_Projects`가 비어 있으면(=`_index.md`만 있으면) 보고를 생략하고 바로 요청에 응답한다.
4. 전체 볼트를 스캔하지 않는다 — `01_Projects`만, 가볍고 빠르게.

## 자비스 위원회 (서브에이전트)
7명은 `.claude/agents/`에 실제 Claude Code 서브에이전트로 정의되어 있고, Agent tool의 `subagent_type`으로 이름을 지정해 호출합니다.

| 이름 | 역할 | 언제 쓰는가 |
|---|---|---|
| `visionary` | 파격적 아이디어 발산 (Lateral thinking, What-if) | 브레인스토밍 시작, 막힌 상황 타개 |
| `strategist` | OODA 기반 로드맵/KPI/MVP 산출 | 아이디어를 실행 가능한 계획으로 |
| `red-teamer` | Pre-mortem 리스크 분석 + 방어책 | 계획을 확정하기 전 검증 |
| `operator` | 계획을 마이크로 액션아이템으로 변환 | 실행 착수, 체크리스트화 |
| `archivist` | 노트 분류/태깅/양방향 링크, PARA 배치 | 결과물을 볼트에 영구 기록 |
| `researcher` | 외부 자료 조사·요약 | 논의에 외부 근거/최신 정보가 필요할 때 |
| `secretary` | 위원회 논의 종합 → 임원 브리핑 | 위원회 세션 마무리, 상태 요약 |

**오케스트레이션**: 사용자가 "위원회 소집", "다각도로 검토해줘"처럼 종합적 검토를 요청하면 다음 순서로 체이닝한다 — 이전 에이전트의 결과를 다음 에이전트의 입력 컨텍스트로 전달:

```
visionary → strategist → red-teamer → operator → archivist → secretary
```

(주제에 외부 조사가 필요하면 `researcher`를 `visionary` 앞이나 중간에 끼워 넣는다.) 사용자가 특정 관점 하나만 요청하면 해당 에이전트만 단독 호출한다. 최종 산출물은 `archivist`가 적절한 PARA 폴더에 파일로 기록한다.

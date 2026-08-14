# 마켓빅시 사업·제품 운영 저장소

기준일: 2026-08-13

현재는 광고 확대 전 단계입니다. 개발 총괄과 역할·정산·정보 접근을 합의하고, 제품 원가와 사용자 행동을 측정할 수 있는지 확인하고 있습니다.

## 바로 보기

- 통합 실행판: [dashboard/index.html](dashboard/index.html)
- 전체 근거판: [dashboard/evidence.html](dashboard/evidence.html)
- 전사 현재 상태: [control/00_project_status.md](control/00_project_status.md)
- 단계와 이번 행동: [control/15_execution_control.md](control/15_execution_control.md)

## 폴더 구조

| 경로 | 무엇을 두는가 |
|---|---|
| `control/` | 전체 현황·결정·검증·실행 순서 |
| `system/` | 운영·대시보드·페르소나 하네스 규칙 |
| `personas/<역할>/inbox.md` | 역할로 들어온 질문과 완료 기준 |
| `personas/<역할>/research.md` | 탐색 과정·출처·반증 |
| `personas/<역할>/state.md` | 현재 진행·차단·다음 행동 |
| `personas/<역할>/output.md` | 대시보드에 취합할 최신 결론 |
| `personas/<역할>/reference/` | 해당 역할이 책임지는 상세 분석 정본 |
| `dashboard/` | Markdown에서 생성된 읽기 전용 화면 |
| `scripts/` | 대시보드 생성과 구조 관리 도구 |

루트에는 진입 파일인 `README.md`, `AGENTS.md`, `dashboard.html`만 둡니다.

## 다음 로컬의 기본 로딩

1. `README.md`
2. `control/00_project_status.md`
3. 단계·광고·협업 질문이면 `control/15_execution_control.md`
4. `personas/registry.md`
5. 관련 역할의 `output.md`
6. 필요할 때만 같은 역할의 `state.md`, `research.md`, `reference/` 문서 1~2개

전체 Markdown이나 생성 HTML을 한꺼번에 읽지 않습니다.

## 갱신 흐름

```text
사용자 입력 → 담당 persona/inbox → research → state → output
           → 전사 판단만 control에 승격 → dashboard 재생성
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

`dashboard/` 아래 HTML은 직접 편집하지 않습니다. 기존 전체 분석 원본은 `C:\MyMain\market-bigsee-service-business-analysis-2026-08-12.md`에 보존돼 있습니다.

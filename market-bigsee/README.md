# 마켓빅시 사업·제품 운영 저장소

기준일: 2026-08-13

현재는 광고 확대 전 단계입니다. 개발 총괄과 역할·정산·정보 접근을 합의하고 제품 원가와 사용자 행동을 측정할 수 있는지 확인하고 있습니다.

## 바로 보기

- 단일 대시보드: [dashboard/index.html](dashboard/index.html)
- 전사 현재 상태: [control/00_project_status.md](control/00_project_status.md)
- 단계와 이번 행동: [control/15_execution_control.md](control/15_execution_control.md)
- 화면 섹션 라우팅: [system/dashboard/SECTION_REGISTRY.md](system/dashboard/SECTION_REGISTRY.md)

대시보드의 `지금·단계·광고·협업·결정·역할·전체` 태그는 모두 같은 `index.html` 안의 구역입니다. 별도 현황 HTML은 만들지 않습니다.

## 폴더 구조

| 경로 | 무엇을 두는가 |
|---|---|
| `control/` | 전체 현황·결정·검증·실행 순서 |
| `system/` | 운영·하네스·단일 대시보드 규칙 |
| `personas/<역할>/inbox.md` | 역할로 들어온 질문과 완료 기준 |
| `personas/<역할>/research.md` | 탐색 과정·출처·반증 |
| `personas/<역할>/state.md` | 현재 진행·차단·다음 행동 |
| `personas/<역할>/output.md` | 대시보드에 취합할 최신 결론 |
| `personas/<역할>/reference/` | 해당 역할이 책임지는 상세 분석 정본 |
| `scripts/dashboard/` | 긴 단일 HTML을 합성하는 전용 생성 로직 |
| `dashboard/` | 최종 `index.html`과 화면 자산 |

루트에는 진입 파일인 `README.md`, `AGENTS.md`, `dashboard.html`만 둡니다.

## 다음 로컬의 기본 로딩

1. `README.md`
2. 질문과 맞는 태그를 `system/dashboard/SECTION_REGISTRY.md`에서 찾기
3. 등록부가 지정한 Markdown과 담당 역할의 `output.md`만 먼저 읽기
4. 필요할 때만 같은 역할의 `state.md`, `research.md`, `reference/` 문서 1~2개 읽기

생성된 `dashboard/index.html` 전체를 사업 판단용 컨텍스트로 읽지 않습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

HTML은 직접 편집하지 않습니다. 기존 전체 분석 원본은 `C:\MyMain\market-bigsee-service-business-analysis-2026-08-12.md`에 보존돼 있습니다.

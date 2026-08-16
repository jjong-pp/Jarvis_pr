# 대시보드 페이지 등록부

이 파일은 다음 로컬에서 필요한 문서만 선택해 읽기 위한 라우팅 표입니다.

| 화면 | HTML | 먼저 읽을 정본 | 필요할 때 추가로 읽기 |
|---|---|---|---|
| 전체 인계 | 없음·AI 시작 문서 | `control/17_context_handoff.md` | 요청과 맞는 아래 행의 정본 |
| 전체 현황 | `dashboard/index.html` | `control/00_project_status.md` | `control/15_execution_control.md`, `control/08_decision_log.md` |
| 전략·경영 | `dashboard/pages/str.html` | `personas/01_strategy_ceo/state.md`, `output.md` | `inbox.md`, `updates.md`, `control/16_replanning_brief.md` |
| 고객·시장 | `dashboard/pages/mkt.html` | `personas/02_customer_market/state.md`, `output.md` | `inbox.md`, `updates.md`, `reference/19_target_personas_channel_map.md` |
| 제품·성장 | `dashboard/pages/prd.html` | `personas/03_product_growth/state.md`, `output.md` | `inbox.md`, `updates.md`, `reference/21_product_system_replan.md` |
| 세일즈·마케팅 | `dashboard/pages/sal.html` | `personas/04_sales_marketing/state.md`, `output.md` | `inbox.md`, `updates.md`, `reference/20_community_meta_parallel_launch.md` |
| 재무·가격 | `dashboard/pages/fin.html` | `personas/05_finance_pricing/state.md`, `output.md` | `inbox.md`, `updates.md`, `control/00_project_status.md` |
| 기술·데이터 | `dashboard/pages/tec.html` | `personas/06_technology_data/state.md`, `output.md` | `inbox.md`, `updates.md`, `reference/22_developer_business_technical_review.md` |
| 리스크·운영 | `dashboard/pages/rsk.html` | `personas/07_risk_operations/state.md`, `output.md` | `inbox.md`, `updates.md`, `control/00_project_status.md` |
| 전체 자료 검색 | 전체 현황·각 역할 화면 내부 | `system/data/RECORD_SCHEMA.md` | `dashboard/data/manifest.json`은 생성 검증용 |
| 자료 상세 | `dashboard/records/*.html`·내비 미등록 | 각 화면에 표시된 Markdown 정본 | 연결 ID의 과업·결정·질문 정본 |

화면 디자인·내비 동작만 바꿀 때는 사업 정본을 읽지 않고 `system/dashboard/RULES.md`, `scripts/dashboard/build-linked-dashboard.ps1`, `dashboard/assets/`만 확인합니다.

카탈로그·상세 화면·자료 유형을 바꿀 때는 `system/data/RECORD_SCHEMA.md`와 `scripts/dashboard/build-data-catalog.ps1`을 먼저 확인합니다.

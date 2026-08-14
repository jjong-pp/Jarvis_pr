# 대시보드 페이지 등록부

이 파일은 다음 로컬에서 필요한 문서만 선택해 읽기 위한 라우팅 표입니다.

| 화면 | HTML | 먼저 읽을 정본 | 필요할 때 추가로 읽기 |
|---|---|---|---|
| 전체 인계 | 없음·AI 시작 문서 | `control/17_context_handoff.md` | 요청과 맞는 아래 행의 정본 |
| 개요 | `dashboard/index.html` | `control/16_replanning_brief.md` | `control/00_project_status.md` |
| 타깃 | `dashboard/pages/personas.html` | `personas/02_customer_market/reference/19_target_personas_channel_map.md` | `personas/02_customer_market/output.md`, `state.md` |
| 시장진입 | `dashboard/pages/launch.html` | `personas/04_sales_marketing/reference/20_community_meta_parallel_launch.md` | `personas/04_sales_marketing/output.md`, `control/09_validation_board.md` |
| 제품 | `dashboard/pages/product.html` | `personas/03_product_growth/reference/21_product_system_replan.md` | `personas/03_product_growth/output.md`, `personas/06_technology_data/output.md` |
| 운영 | `dashboard/pages/operations.html` | `control/15_execution_control.md` | `control/17_context_handoff.md`, `personas/01_strategy_ceo/output.md`, `personas/05_finance_pricing/output.md` |
| 결정 | `dashboard/pages/decisions.html` | `control/08_decision_log.md` | `control/09_validation_board.md`, `control/00_project_status.md` |

화면 디자인·내비 동작만 바꿀 때는 사업 정본을 읽지 않고 `system/dashboard/RULES.md`, `scripts/dashboard/build-linked-dashboard.ps1`, `dashboard/assets/`만 확인합니다.

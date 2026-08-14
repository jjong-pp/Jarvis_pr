# 마켓빅시 사업·제품 운영 저장소

기준일: 2026-08-13

이 폴더는 마켓빅시의 사업 현황, 판매 전략, 제품·기술 기획과 역할별 탐색 결과를 다음 로컬 환경에서도 이어가기 위한 Markdown 정본입니다.

## 바로 시작하기

- 사람이 보는 현재판: [dashboard.html](dashboard.html)
- 모든 새 작업의 첫 정본: [00_project_status.md](00_project_status.md)
- 전체 운영 규칙: [10_operating_manual.md](10_operating_manual.md)
- 페르소나 하네스 계약: [12_persona_harness.md](12_persona_harness.md)
- 역할별 작업 시작: [personas/START_HERE.md](personas/START_HERE.md)
- 자동 에이전트 지침: [AGENTS.md](AGENTS.md)

`dashboard.html`은 Markdown에서 생성되는 읽기 전용 파생물입니다. HTML을 직접 수정하지 않습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

## 핵심 제품 방향

> 시장 조사 → 콘텐츠 기획·초안 → SKU·캠페인 연결 → 유입·구매 측정 → 다음 실행 추천

첫 판매 시장은 2~20인 이커머스 광고·마케팅 대행사라는 가설이며, 첫 진입 상황은 신규 광고주 제안서와 캠페인 조사입니다. 블로그 초안은 범용 자동 작문이 아니라 조사 근거·사람 승인·SKU·성과 측정에 연결합니다. 실제 결제와 반복 사용으로 검증되기 전에는 확정 시장으로 표현하지 않습니다.

## 다음 로컬의 기본 로딩

1. `README.md`
2. `00_project_status.md`
3. `personas/registry.md`
4. 질문과 관련된 페르소나의 `output.md`
5. 필요할 때만 해당 `state.md`, `research.md`, 루트 상세 문서 1~2개

AI는 전체 Markdown과 생성물 `dashboard.html`을 한꺼번에 읽지 않습니다.

## 루트 정본

| 문서 | 역할 |
|---|---|
| [00_project_status.md](00_project_status.md) | 현재 단계·지표·위험·다음 행동 |
| [01_service_current_state.md](01_service_current_state.md) | 서비스·요금제·기술·사업 현황 |
| [02_sales_management_strategy.md](02_sales_management_strategy.md) | 시장 진입·판매·경영 전략 |
| [03_ecommerce_marketing_sales_flow.md](03_ecommerce_marketing_sales_flow.md) | 이커머스 마케팅·판매 흐름 |
| [04_feature_expansion_plan.md](04_feature_expansion_plan.md) | 블로그·SKU·성과 측정 기능 기획 |
| [05_data_api_architecture.md](05_data_api_architecture.md) | 데이터 모델·이벤트·외부 API 구조 |
| [06_competitor_benchmark.md](06_competitor_benchmark.md) | 경쟁 서비스 벤치마크 |
| [07_competitor_strategy_actions.md](07_competitor_strategy_actions.md) | 경쟁 대응 실행안 |
| [08_decision_log.md](08_decision_log.md) | 채택·제안·대체된 결정 이력 |
| [09_validation_board.md](09_validation_board.md) | 가설·시험·증거·통과 기준 |
| [10_operating_manual.md](10_operating_manual.md) | 정본·피드백·빌드 운영 규칙 |
| [11_operating_system_research.md](11_operating_system_research.md) | 운영 방식의 전문 근거와 평가 |
| [12_persona_harness.md](12_persona_harness.md) | 역할별 입력·탐색·상태·출력·취합 계약 |

## 페르소나 작업 공간

| ID | 역할 | 폴더 |
|---|---|---|
| STR | 전략·경영 | [01_strategy_ceo](personas/01_strategy_ceo/) |
| MKT | 고객·시장 | [02_customer_market](personas/02_customer_market/) |
| PRD | 제품·성장 | [03_product_growth](personas/03_product_growth/) |
| SAL | 세일즈·마케팅 | [04_sales_marketing](personas/04_sales_marketing/) |
| FIN | 재무·가격 | [05_finance_pricing](personas/05_finance_pricing/) |
| TEC | 기술·데이터 | [06_technology_data](personas/06_technology_data/) |
| RSK | 리스크·운영 | [07_risk_operations](personas/07_risk_operations/) |

각 폴더는 `inbox.md → research.md → state.md → output.md`를 유지합니다. 대시보드는 `state.md`와 `output.md`만 취합합니다.

## 사용자 피드백 반영

1. 사용자가 대시보드에서 현황 또는 역할별 출력을 확인합니다.
2. 새 입력을 사실·가설·결정·행동·아이디어로 분류합니다.
3. 주 담당 페르소나의 `inbox.md`에 과업을 등록합니다.
4. 역할별 탐색·상태·출력을 갱신합니다.
5. 전사 상태를 바꾸는 결론만 루트 정본에 승격합니다.
6. 대시보드를 재생성하고 해시·필수 파일·구문을 검증합니다.

## 기존 원본

이 폴더 생성 전의 전체 분석 원본은 `C:\MyMain\market-bigsee-service-business-analysis-2026-08-12.md`에 보존되어 있습니다.

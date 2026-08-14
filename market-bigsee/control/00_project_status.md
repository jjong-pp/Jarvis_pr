# 마켓빅시 프로젝트 현황 정본

이 문서는 새 세션과 대시보드가 가장 먼저 읽는 현재 상태의 단일 정본입니다. 상세 근거는 연결된 문서에만 유지하며 이 문서에는 결론, 상태, 다음 게이트만 둡니다.

## 기본 현황

| 항목 | 값 |
|---|---|
| 마지막 갱신 | 2026-08-13 |
| 사업 단계 | 전략 수립 완료 · 고객 및 원가 검증 전 |
| 제품 단계 | 확장 MVP 기획 완료 · 실제 코드 미검토 |
| 전체 상태 | 주의 |
| 사업성 평가 | 67/100 |
| 첫 고객 | 2~20인 이커머스 전문 광고·마케팅 대행사 |
| 첫 판매 상황 | 신규 광고주 제안서와 캠페인 조사 |
| 기존 등록 사용자 | 약 20명 · 사용자 전달값 · 실제/활성/유료 구분 미확인 |
| 핵심 루프 | 시장 조사 → 콘텐츠 초안 → SKU·캠페인 연결 → 구매 측정 → 다음 실행 추천 |
| 북극성 지표 | 주간 완성 의사결정 리포트 수 |
| 다음 사업 게이트 | 기존 약 20명의 활성·첫 가치·반복·유료·팀 의도 분류 후 신규 유료 파일럿 확인 |
| 다음 기술 게이트 | 현재 코드·사용량 계측·계정 경계·외부 API 구조 점검 |

## 영역별 상태

| 영역 | 상태 | 현재 근거 | 다음 게이트 | 정본 |
|---|---|---|---|---|
| 전략·포지셔닝 | 확정 | 키워드 도구가 아니라 대행사의 조사·제안·성과 증명 흐름으로 정의 | 실제 대행사 3곳이 같은 문제를 유료로 인정 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 시장·경쟁 | 진행 | 국내외 경쟁사 7개군의 기능·가격·빈틈 조사 완료 | 동일 과제 제품 테스트와 대행사 인터뷰 | personas/02_customer_market/reference/06_competitor_benchmark.md |
| 판매·PMF | 진행 | 기존 등록 사용자 약 20명 존재하나 활성·유료·반복 사용 미확인 | 20명 전수 분류와 5명 인터뷰, 이후 검색 광고 파일럿 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 제품 MVP | 기획 | SKU·브리프·블로그·추적 링크·주문 CSV 범위 정의 | 코드 점검 후 6~8주 범위 재산정 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| 원가·수익성 | 미측정 | 원가 항목과 손익분기 공식만 정의 | 사용자·기능·API별 2주 사용량 원장 | personas/01_strategy_ceo/reference/01_service_current_state.md |
| 데이터·API | 기획 | 내부 ID·이벤트·커넥터·공개 API 개념 설계 | CSV MVP와 첫 커머스 연동 선택 | personas/06_technology_data/reference/05_data_api_architecture.md |
| 콘텐츠·규정 | 주의 | AI 대량 생성·허위 리뷰·광고 관계 표시 위험 확인 | 업종별 검수 규칙과 법률 검토 | personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md |
| 프로젝트 운영 | 진행 | MD 정본·HTML 파생 현황판·결정·검증 기록 구조 도입 | 매주 갱신 습관과 불일치 0건 유지 | system/10_operating_manual.md |

## 90일 단계

| 단계 | 상태 | 기간 | 완료 조건 | 바로 다음 행동 | 정본 |
|---|---|---|---|---|---|
| 1. 기반 확인 | 진행 | 1~2주 | 코드 구조·원가 계측·정책 불일치·파일럿 조건 확인 | 실제 코드 저장소와 운영 로그 확보 | personas/01_strategy_ceo/reference/01_service_current_state.md |
| 2. 고객 문제 검증 | 대기 | 3~6주 | 대행사 20회 데모, 유료 파일럿 3곳 이상 | 이커머스 전문 대행사 100곳 목록화 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 3. 수동형 MVP 검증 | 대기 | 4~8주 | 조사→초안→링크→주문 CSV 흐름을 3곳이 완주 | 클릭 가능한 프로토타입과 수동 운영 설계 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| 4. 유료 반복성 확인 | 대기 | 7~10주 | 유료 고객 사례 3건과 4주 반복 사용 | 업종 한 곳과 반복 템플릿 확정 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 5. 확장 여부 결정 | 대기 | 11~13주 | 가격·유지율·원가·획득 채널의 통과 기준 충족 | 첫 커머스 API와 팀 기능 투자 결정 | personas/01_strategy_ceo/reference/07_competitor_strategy_actions.md |

## 핵심 지표

현재 수치는 실제 운영 데이터가 없어 `미측정`입니다. 목표는 90일 운영 가설이며 실측 후 조정합니다.

| 지표 | 현재 | 90일 목표·통과 기준 | 측정 시작 조건 | 정본 |
|---|---:|---:|---|---|
| 유료 대행사 고객 | 미측정 | 8~10곳 | 영업 CRM 또는 파일럿 대장 생성 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 파일럿→유료 전환율 | 미측정 | 50% 이상 | 파일럿 5건 이상 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 4주차 유료 활성률 | 미측정 | 60% 이상 | 유료 고객 코호트 생성 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 고객당 월 유효 리포트 | 미측정 | 4건 이상 | 리포트 완료 이벤트 계측 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 직접원가 비율 | 미측정 | 매출의 25% 이하 | UsageLedger 2주 이상 | personas/06_technology_data/reference/05_data_api_architecture.md |
| 재현 가능한 획득 채널 | 미측정 | 1개 이상 | 접촉→유료 퍼널 기록 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| 초안→실제 게시율 | 미측정 | 60% 이상을 가설로 시험 | 콘텐츠 승인·게시 이벤트 계측 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| API·분석 성공률 | 미측정 | 95% 이상을 가설로 시험 | 공급자별 요청 로그 구축 | personas/06_technology_data/reference/05_data_api_architecture.md |

## 상위 리스크

| 등급 | 리스크 | 현재 영향 | 대응 | 상태 | 정본 |
|---|---|---|---|---|---|
| P0 | 고객당 직접원가와 외부 API 쿼터를 모름 | 가격 하한선과 성장 한도를 확정할 수 없음 | 기능·공급자·고객별 사용량 원장부터 구축 | 미해결 | personas/01_strategy_ceo/reference/01_service_current_state.md |
| P0 | 실제 코드와 계정·권한·차감 구조 미확인 | 공수·보안·팀 판매 가능성을 확정할 수 없음 | 코드·데이터 모델·서버 권한 검사 | 미해결 | personas/06_technology_data/reference/05_data_api_architecture.md |
| P0 | 대행사의 유료 반복 사용이 미검증 | 제품 확장 전 PMF 근거가 없음 | 무료 인터뷰가 아닌 유료 파일럿 3곳 | 미해결 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| P1 | 범용 AI 글쓰기와 차별 부족 | 기능을 추가해도 가격 프리미엄이 약할 수 있음 | 조사 근거·SKU 사실·매출 성과 결합 | 대응 설계 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| P1 | 자동 생성 콘텐츠·후기 정책 위험 | 검색 노출·법적 신뢰·브랜드 위험 | 사람 승인, 출처, 광고 표시, 허위 리뷰 금지 | 대응 설계 | personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md |
| P1 | HTML과 MD가 서로 다른 사실을 보유 | 다음 세션에서 잘못된 판단 가능 | HTML 자동 생성, 직접 편집 금지, 생성시각·해시 표시 | 통제 도입 | system/10_operating_manual.md |

## 다음 의사결정

| ID | 결정 | 필요한 증거 | 결정 시점 | 상태 |
|---|---|---|---|---|
| Q-001 | 첫 커머스 연동을 스마트스토어와 카페24 중 어디로 할 것인가 | 파일럿 3~5곳의 실제 사용 채널·연동 권한·필요 데이터 | MVP 착수 전 | 대기 |
| Q-002 | Agency Starter의 가격과 포함량은 얼마인가 | 파일럿 지불가격, 고객당 직접원가, 지원 공수 | 파일럿 5건 후 | 대기 |
| Q-003 | 블로그 초안이 실제 게시와 구매로 이어지는가 | 초안→승인→게시→상품 클릭→구매 퍼널 | MVP 4주 후 | 대기 |
| Q-004 | 팀 워크스페이스를 MVP에 포함할 것인가 | 파일럿 사용자 수·승인 흐름·현재 계정 구조 | 코드 점검 후 | 대기 |
| Q-005 | 공개 API를 언제 개방할 것인가 | 내부 API 안정성, 파트너 수요, 인증·사용량 체계 | 내부 연동 안정화 후 | 보류 |

## 지금 할 일

| 우선순위 | 행동 | 완료 조건 | 상태 |
|---|---|---|---|
| 1 | 기존 약 20명 사용자 백필표 확보 | 실제·활성·첫 가치·반복·유료·팀 의도·원가가 사용자별로 구분됨 | 진행 |
| 2 | 신규 퍼널·UTM·원가 이벤트 검수 | 테스트 5회에서 랜딩→가입→첫 가치와 원가가 연결됨 | 대기 |
| 3 | 샘플 리포트 3종 제작 | 실제 업종 키워드와 출처가 포함됨 | 대기 |
| 4 | 유료 파일럿 대장 생성 | 접촉→데모→파일럿→유료 상태를 기록함 | 대기 |
| 5 | 스마트스토어·카페24 사용 비중 질문 | 파일럿 고객별 주 채널과 필수 데이터가 기록됨 | 대기 |




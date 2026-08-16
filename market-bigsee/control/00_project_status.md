# 마켓빅시 프로젝트 현황 정본

이 문서는 대시보드가 읽는 현재 상태 정본입니다. 다음 로컬에서 전체 배경과 판단 변화까지 복구할 때는 `control/17_context_handoff.md`를 먼저 읽고, 이 문서에는 결론·상태·다음 게이트만 둡니다.

## 기본 현황

| 항목 | 값 |
|---|---|
| 마지막 갱신 | 2026-08-16 |
| 사업 단계 | 구매상황 기반 3개 고객군·커뮤니티/Meta 동시 검증 준비 |
| 제품 단계 | 워크스페이스·SKU·콘텐츠·CRM·원가 원장 재기획 · 실제 코드 미검토 |
| 전체 상태 | 주의 |
| 사업성 평가 | 67/100 |
| 첫 고객 | 대행사 실무·책임자를 1순위, 인하우스 마케터·활성 다채널 셀러를 비교군으로 검증 |
| 첫 판매 상황 | 최근 실제 조사 업무를 직접 해결하는 유료 파일럿 |
| 기존 등록 사용자 | 약 20명 · 사용자 전달값 · 실제/활성/유료 구분 미확인 |
| 핵심 루프 | 시장 조사 → 콘텐츠 초안 → SKU·캠페인 연결 → 구매 측정 → 다음 실행 추천 |
| 북극성 지표 | 주간 완성 의사결정 리포트 수 |
| 다음 사업 게이트 | 14일 동시 시험에서 고객군별 유효 상담·첫 가치·유료·반복 의도 비교 |
| 다음 기술 게이트 | 현재 코드·사용량 계측·계정 경계·외부 API 구조 점검 |

## 영역별 상태

| 영역 | 상태 | 현재 근거 | 다음 게이트 | 정본 |
|---|---|---|---|---|
| 전략·포지셔닝 | 재검증 | 대행사·인하우스·활성 셀러의 구매상황과 제외 대상을 명시 | 14일의 결제·반복·팀 신호로 1순위 결정 | control/16_replanning_brief.md |
| 시장·경쟁 | 진행 | 아이보스·셀러오션의 현재 실무 맥락과 세 고객군 접근 경로 확인 | 2026 공식 집행 규정·견적과 실제 유효 상담 비교 | personas/02_customer_market/reference/19_target_personas_channel_map.md |
| 판매·PMF | 진행 | 커뮤니티와 Meta의 동일 제안 동시 시험 설계, 기존 약 20명은 미분류 | UTM·폼·CRM을 갖춘 14일 동시 시험 | personas/04_sales_marketing/reference/20_community_meta_parallel_launch.md |
| 제품 MVP | 재기획 | 워크스페이스·SKU·근거 콘텐츠·추적·경량 CRM·원가 원장 범위 정의 | 코드 점검 후 P0 4~6주 가설 재산정 | personas/03_product_growth/reference/21_product_system_replan.md |
| 원가·수익성 | 미측정 | 원가 항목과 손익분기 공식만 정의 | 사용자·기능·API별 2주 사용량 원장 | personas/01_strategy_ceo/reference/01_service_current_state.md |
| 데이터·API | 기획 | 내부 ID·이벤트·커넥터·공개 API 개념 설계 | CSV MVP와 첫 커머스 연동 선택 | personas/06_technology_data/reference/05_data_api_architecture.md |
| 콘텐츠·규정 | 주의 | AI 대량 생성·허위 리뷰·광고 관계 표시 위험 확인 | 업종별 검수 규칙과 법률 검토 | personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md |
| 프로젝트 운영 | 적용 | 전체 현황·7개 역할·통합 자료 검색·정적 상세 화면을 MD 정본에서 생성 | 카탈로그·상세 화면·링크·레코드 수 자동 검증 | system/data/RECORD_SCHEMA.md |

## 90일 단계

| 단계 | 상태 | 기간 | 완료 조건 | 바로 다음 행동 | 정본 |
|---|---|---|---|---|---|
| 1. 운영 기반 합의 | 진행 | 1주 | 현금·업무분담·정보 접근·30일 개발 우선순위 합의 | 개발자와 90분 사업회의 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |
| 2. 고객 진실 확인 | 진행 | 1~2주 | 기존 사용자 10명 인터뷰·5명 동행·첫 고객 선택 | 약 20명 전수 연락과 역할 분류 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |
| 3. 타깃·제안 준비 | 진행 | 1주 | 고객군별 제안·샘플·랜딩·폼·UTM 3세트 | 실제 결과 화면과 후속 담당 연결 | control/16_replanning_brief.md |
| 4. 커뮤니티·Meta 동시 검증 | 대기 | 2주 | 유입→유효 상담→첫 가치→유료 흐름을 유입경로·고객군별 측정 | 아이보스·셀러오션과 Meta 3소재 같은 주 시작 | personas/04_sales_marketing/reference/20_community_meta_parallel_launch.md |
| 5. 반복·B2B 확대 | 대기 | 7~13주 | 유료 5건 중 반복 3건·사례 2개·원가와 CAC 계산 | 팀 의도 계정과 파트너 후보 선별 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |

## 핵심 지표

현재 수치는 실제 운영 데이터가 없어 `미측정`입니다. 목표는 90일 운영 가설이며 실측 후 조정합니다.

| ID | 지표 | 현재 | 90일 목표·통과 기준 | 측정 시작 조건 | 정본 |
|---|---|---:|---:|---|---|
| KPI-001 | 유료 고객·파일럿 | 미측정 | 5건 이상 | 접촉→상담→데모→결제 대장 생성 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |
| KPI-002 | 데모→유료 전환 | 미측정 | 첫 5건 중 2건 이상 | 데모 5건 이상 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |
| KPI-003 | 4주차 유료 활성률 | 미측정 | 60% 이상 | 유료 고객 코호트 생성 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| KPI-004 | 고객당 월 유효 리포트 | 미측정 | 4건 이상 | 리포트 완료 이벤트 계측 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| KPI-005 | 직접원가 비율 | 미측정 | 매출의 25% 이하 | 사용량 원장 2주 이상 | personas/06_technology_data/reference/05_data_api_architecture.md |
| KPI-006 | 재현 가능한 획득 흐름 | 미측정 | 같은 채널에서 유료 2회 이상 | 커뮤니티·직접 판매·Meta 접촉→유료 기록 | personas/01_strategy_ceo/reference/17_operator_gtm_cashflow_reset.md |
| KPI-007 | 초안→실제 게시율 | 미측정 | 60% 이상을 가설로 시험 | 콘텐츠 승인·게시 이벤트 계측 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| KPI-008 | API·분석 성공률 | 미측정 | 95% 이상을 가설로 시험 | 공급자별 요청 로그 구축 | personas/06_technology_data/reference/05_data_api_architecture.md |

## 상위 리스크

| ID | 등급 | 리스크 | 현재 영향 | 대응 | 상태 | 정본 |
|---|---|---|---|---|---|---|
| BRK-001 | P0 | 고객당 직접원가와 외부 API 쿼터를 모름 | 가격 하한선과 성장 한도를 확정할 수 없음 | 기능·공급자·고객별 사용량 원장부터 구축 | 미해결 | personas/01_strategy_ceo/reference/01_service_current_state.md |
| BRK-002 | P0 | 실제 코드와 계정·권한·차감 구조 미확인 | 공수·보안·팀 판매 가능성을 확정할 수 없음 | 코드·데이터 모델·서버 권한 검사 | 미해결 | personas/06_technology_data/reference/05_data_api_architecture.md |
| BRK-003 | P0 | 대행사의 유료 반복 사용이 미검증 | 제품 확장 전 PMF 근거가 없음 | 무료 인터뷰가 아닌 유료 파일럿 3곳 | 미해결 | personas/01_strategy_ceo/reference/02_sales_management_strategy.md |
| BRK-004 | P1 | 범용 AI 글쓰기와 차별 부족 | 기능을 추가해도 가격 프리미엄이 약할 수 있음 | 조사 근거·SKU 사실·매출 성과 결합 | 대응 설계 | personas/03_product_growth/reference/04_feature_expansion_plan.md |
| BRK-005 | P1 | 자동 생성 콘텐츠·후기 정책 위험 | 검색 노출·법적 신뢰·브랜드 위험 | 사람 승인, 출처, 광고 표시, 허위 리뷰 금지 | 대응 설계 | personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md |
| BRK-006 | P1 | HTML과 MD가 서로 다른 사실을 보유 | 다음 세션에서 잘못된 판단 가능 | HTML 자동 생성, 직접 편집 금지, 생성시각·해시 표시 | 통제 도입 | system/10_operating_manual.md |

## 다음 의사결정

| ID | 결정 | 필요한 증거 | 결정 시점 | 상태 |
|---|---|---|---|---|
| Q-001 | 첫 커머스 연동을 스마트스토어와 카페24 중 어디로 할 것인가 | 파일럿 3~5곳의 실제 사용 채널·연동 권한·필요 데이터 | MVP 착수 전 | 대기 |
| Q-002 | Agency Starter의 가격과 포함량은 얼마인가 | 파일럿 지불가격, 고객당 직접원가, 지원 공수 | 파일럿 5건 후 | 대기 |
| Q-003 | 블로그 초안이 실제 게시와 구매로 이어지는가 | 초안→승인→게시→상품 클릭→구매 퍼널 | MVP 4주 후 | 대기 |
| Q-004 | 팀 워크스페이스를 MVP에 포함할 것인가 | 파일럿 사용자 수·승인 흐름·현재 계정 구조 | 코드 점검 후 | 대기 |
| Q-005 | 공개 API를 언제 개방할 것인가 | 내부 API 안정성, 파트너 수요, 인증·사용량 체계 | 내부 연동 안정화 후 | 보류 |
| Q-006 | 유료 고객 온보딩·지원·갱신의 주 담당은 누구인가 | 파일럿 지원 시간·문의 유형·제품/기술 이관 빈도 | 첫 유료 파일럿 전 | 대기 |
| Q-007 | 5개 우선 실행 항목의 절대 목표일은 언제인가 | 개발자·자문가 가용일과 시험 시작일 | 집행 시작 전 | 대기 |

## 지금 할 일

| ID | 우선순위 | 행동 | 담당 역할 | 목표일 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|
| ACT-001 | 1 | 개발자와 90분 사업회의 | STR·FIN·TEC | 미정 | 현금 현황·제품 데이터·30일 개발 우선순위·업무분담 확인 | 진행 |
| ACT-002 | 2 | 기존 약 20명 전수 연락·분류 | MKT·SAL | 미정 | 실제 사용자·역할·최근 사용·반복·유료가 구분됨 | 진행 |
| ACT-003 | 3 | 고객군별 제안·샘플·랜딩 3세트 | MKT·PRD·SAL | 미정 | 실제 결과, 역할 폼, UTM, 후속 담당이 연결됨 | 진행 |
| ACT-004 | 4 | 커뮤니티 현재 규정·공식 견적 확인 | SAL·FIN·RSK | 미정 | 아이보스·셀러오션의 2026 집행 방식과 상한 승인 | 대기 |
| ACT-005 | 5 | 커뮤니티·Meta 14일 동시 시험 | SAL·MKT·FIN | 미정 | 유입경로·고객군·소재별 상담·첫 가치·결제 기록 | 대기 |




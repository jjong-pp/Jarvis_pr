# BIGSEE 제품·데이터 시스템 재기획

기준일: 2026-08-14  
상태: 요구사항 정본 초안. 실제 코드·데이터베이스·인증 구조 검토 전 공수는 확정할 수 없음.

## 제품 정의

현재의 멀티채널 자료 조사에서 다음 운영 시스템으로 확장한다.

> 고객 또는 SKU를 선택하면 시장 근거를 수집하고, 승인 가능한 홍보 콘텐츠를 만들고, 캠페인·리드·구매와 연결해 다음 실행을 알려주는 마케팅 운영 시스템

## 전체 사용자 흐름

`조직/고객 생성 → SKU 등록 → 조사 브리프 → 근거 수집 → 콘텐츠 초안 → 사람 승인 → 캠페인/링크 → 리드/구매 → 성과/원가 → 다음 조사`

## 공통 데이터 모델

| 객체 | 목적 | 핵심 관계 |
|---|---|---|
| Workspace | 회사·대행사 단위 소유 경계 | Member, Client, SKU, Integration |
| Member | 좌석·권한 | WorkspaceRole |
| Client/Brand | 대행사 고객 또는 자체 브랜드 | SKU, ResearchJob, Campaign |
| SKU | 상품·옵션의 안정 식별자 | ChannelProduct, Content, OrderItem |
| ResearchJob | 조사 요청·상태·비용 | Evidence, Brief, UsageLedger |
| Evidence | 출처·수집일·원문 근거 | ContentDraft의 주장 |
| ContentDraft | 채널별 홍보 초안과 버전 | SKU, Evidence, Approval |
| Campaign/Creative | 배포 단위 | TrackingLink, Touchpoint, Cost |
| Lead/Account/Opportunity | 영업 파이프라인 | Campaign, Activity, Payment |
| Conversion/Order | 실제 결과 | Touchpoint, SKU, Revenue, Refund |
| UsageLedger | 기능·공급자별 원가 | Workspace, User, Job, Provider |
| Integration | 외부 연결·동기화 상태 | Credential, SyncJob, Webhook |

## 1. 조직·고객 워크스페이스

### 필요한 기능

- 개인 계정을 조직 워크스페이스에 연결
- 대행사는 고객/브랜드별 프로젝트 생성
- 역할: Owner, Admin, Editor, Viewer
- 초대·탈퇴·좌석 수·마지막 활동
- 고객 프로젝트별 데이터 분리
- 콘텐츠 승인 요청·댓글·버전·감사 기록

### 이유

대행사와 인하우스 팀은 혼자 쓰는 검색 도구가 아니라 고객·상품·결과를 같이 관리해야 한다. 이 경계가 없으면 좌석 과금, 고객별 권한, 팀 초대, B2B 계약이 어렵다.

## 2. SKU 상품 허브

### 등록 방식

1. 직접 입력
2. CSV 가져오기·내보내기
3. 채널 상품 ID·URL 연결
4. 이후 카페24 등 커넥터 동기화

### 필드

| 구분 | 필드 |
|---|---|
| 식별 | `sku_id`, `parent_sku_id`, `external_product_id`, `channel` |
| 기본 | 상품명, 브랜드, 카테고리, 옵션, 상태, 상세 URL |
| 판매 | 판매가, 원가(선택), 재고, 출시일 |
| 메시지 | 핵심 가치, 타깃, 허용 주장, 금지 주장, 필수 고지 |
| 자산 | 대표 이미지 URL, 상세 자산, 브랜드 가이드 |
| 조사 | 주 키워드, 경쟁 상품, 조사 주기 |
| 관리 | 생성자, 수정자, 생성/수정 시각, 데이터 출처 |

필수 안전장치는 중복 식별, 잘못된 열 매핑 미리보기, 가져오기 오류 보고서, 품절 SKU 홍보 경고, 민감 주장 검수다.

## 3. 조사 브리프와 근거

- 워크스페이스·고객·SKU 선택
- 목표: 출시, 제안, 콘텐츠, 광고 개선, 월간 보고
- 채널·기간·경쟁사·고객 질문 지정
- 수집 결과마다 URL, 채널, 수집 시각, 요약, 신뢰도, 원문 발췌 한도 기록
- 조사 작업마다 API 요청, AI 토큰, 처리 시간, 실패·재시도·원가 기록
- 오래된 근거와 출처 없는 주장을 표시

## 4. 홍보 콘텐츠 스튜디오

### 입력

조사 근거, SKU 승인 사실, 브랜드 문체, 목표 페르소나, 퍼널 단계, 채널, CTA, 금지 표현을 함께 사용한다.

### 출력

- 네이버 블로그 초안
- 자사몰 SEO 글·랜딩 카피
- Meta 광고 본문·제목·CTA
- 커뮤니티 교육형 글 초안
- 이메일/DM 후속 문구
- 15초·30초 숏폼 대본과 촬영 목록

숏폼은 대본·스토리보드까지만 먼저 제공하고 영상 자동 렌더링은 사용·지불의사가 확인된 뒤 개발한다.

### 작업 흐름

`브리프 선택 → 구조 제안 → 초안 → 근거/주장 검사 → 수정 → 승인 → 내보내기 → 캠페인 연결`

### 반드시 포함할 통제

- 근거와 SKU 사실의 출처 표시
- 승인되지 않은 수치·효능·비교 주장 차단
- 의료·건강·식품 등 고위험 업종 플래그
- 유사·반복 콘텐츠 경고
- 광고·협찬 표시 템플릿
- 작성자·검수자·승인자와 버전 이력
- 자동 게시 기본값 끔
- 가짜 리뷰 생성과 대량 스팸 기능 제외

Google은 생성형 AI가 조사와 구조화에 유용할 수 있지만 검색 순위 조작을 위한 저가치 대량 페이지는 스팸 정책 위반이 될 수 있다고 안내한다. 따라서 차별점은 글 생성량이 아니라 `출처가 있는 조사 → SKU 사실 → 사람 승인 → 실제 성과`다.

## 5. 캠페인·전환 측정

### 기본 기능

- campaign, creative, content, SKU 연결
- UTM 자동 생성과 짧은 추적 링크
- 커뮤니티 게시물 ID·Meta 광고 ID 기록
- 이벤트: view, sample_request, lead, demo, report_completed, purchase, refund, repeat
- 중복 이벤트와 주문 방지용 idempotency key
- 최초 접점, 마지막 비직접 접점, 보조 전환을 분리 표시

### 성과판

- 페르소나·채널·소재별 유효 리드 비용
- 조사→초안→승인→게시 전환
- SKU별 조회·클릭·구매·환불·순매출
- 영업 단계별 금액·전환·정체 일수
- 고객당 매출·직접원가·지원시간·공헌이익
- 4주 반복과 팀 초대

GA4 Measurement Protocol은 일반 태깅을 대체하기보다 서버·오프라인 이벤트를 보완하는 용도로 사용하고 `client_id`, `session_id`, `user_id` 연결 규칙을 설계한다.

## 6. 경량 영업 CRM

Salesforce 전체를 복제하지 않는다. 지금 필요한 것은 광고·커뮤니티 리드가 결제까지 어디에서 멈추는지 보는 최소 영업판이다.

### 객체와 필드

- Lead: 이름/회사/역할/페르소나/출처/동의/담당자
- Account: 회사/유형/규모/고객 수/SKU 수
- Opportunity: 제안 상품/예상 금액/확률/단계/예정일
- Activity: 통화/DM/이메일/데모/다음 행동/기한
- Loss: 무효·문제 없음·기능 부족·가격·권한·시기·경쟁사

### 단계

`New → Qualified → Demo → First Value → Pilot Proposed → Paid → Repeat/Team → Lost`

### 화면

- 담당자별 오늘 후속
- 단계별 건수·금액·체류일
- 페르소나·커뮤니티·광고 소재별 전환
- 데모→첫 가치→유료 전환
- 예상 현금 유입과 실제 결제
- CSV 가져오기·내보내기

## 7. 사용량·원가 원장

매 요청에 다음을 기록한다.

`timestamp, workspace_id, user_id, feature, job_id, provider, model/api, request_count, input_unit, output_unit, storage_bytes, compute_ms, success, retry_count, estimated_cost, currency`

이를 통해 사용자·워크스페이스·기능·공급자·일/월 단위 원가를 계산한다. 가격 하한, 포함량, 초과 과금, API 쿼터가 튀는 지점은 이 원장이 2주 이상 쌓인 뒤 확정한다.

## 8. 연동과 공개 API 순서

### P0: 교환 가능한 파일과 이벤트

- SKU·리드·주문 CSV 가져오기/내보내기
- UTM과 추적 링크
- 서명된 기본 웹훅
- 내부 이벤트 스키마와 ID 안정화

### P1: 판매 검증에 직접 필요한 연동

- Meta Lead 동기화와 Conversions API
- GA4 이벤트 보완
- 카페24 상품·주문 OAuth 연동
- 고객이 실제로 사용하는 한 국내 채널 추가

### P2: 플랫폼화

- Public API v1
- API key/OAuth, scope, rate limit, idempotency, 감사 로그
- 버전 정책, 샌드박스, 문서, 사용량 과금
- 추가 광고·커머스·CRM 커넥터

카페24 API는 OAuth 2.0과 상품·주문·고객 리소스를 제공하므로 후보지만, 첫 연동은 파일럿 고객의 실제 채널·권한으로 결정한다.

## 9. 개발 우선순위

| 구간 | 범위 | 기간 가설 | 완료 조건 |
|---|---|---:|---|
| 코드 점검 | 인증·DB·계정 경계·현재 이벤트·외부 API·배포 구조 | 1~2주 | 실제 구조와 위험·공수 재산정 |
| P0 수동형 판매 MVP | 워크스페이스/고객, SKU CSV, 조사 브리프, 콘텐츠 승인, UTM, 경량 CRM, 원가 원장 | 4~6주 | 3개 페르소나 파일럿을 끝까지 운영 |
| P1 팀·연동 | 역할/승인, Meta Lead/CAPI, GA4, 카페24, 팀 보고 | 6~10주 | 유료 팀 3곳이 반복 사용 |
| P2 공개 플랫폼 | 공개 API v1, 추가 커넥터, 고급 자동화 | 수요 확인 후 산정 | 유료 파트너와 호출량·보안 요구 확인 |

기간은 풀스택 개발자 1명과 기획·디자인 지원을 가정한 범위 가설이다. 현재 코드가 개인 계정에 강하게 결합되어 있거나 서버 측 권한·사용량 계측이 없으면 늘어난다.

## 10. 개발자에게 확인할 질문

1. 현재 사용자·조직·데이터 소유 경계는 DB에서 어떻게 표현되는가
2. 기능 호출을 서버에서 권한·요금제로 차단할 수 있는가
3. 외부 API·AI 호출마다 사용자/작업/토큰/요청/실패를 기록할 수 있는가
4. 현재 월 고정비, 공급자별 단가·무료 구간·쿼터·초과 단가는 무엇인가
5. 동시 작업·대량 CSV·외부 API 제한에서 먼저 병목이 되는 곳은 어디인가
6. 1,000 활성 사용자의 작업 빈도를 가정할 때 Functions·DB·API 쿼터가 언제 튀는가
7. 조직/고객/SKU/콘텐츠/캠페인/리드/원가 객체를 넣을 때 마이그레이션 위험은 무엇인가
8. 로그·백업·알림·재시도·개인정보 삭제·감사 기록이 현재 어느 수준인가

## 11. 출시 게이트

- 세 페르소나 중 하나에서 유료 파일럿 2건 이상
- 실제 데이터로 첫 리포트 완료율 50% 이상
- 콘텐츠 초안의 실제 승인·게시율을 측정할 수 있음
- 기능/공급자/고객별 원가가 기록됨
- 고객 프로젝트 간 데이터 격리가 테스트됨
- 광고·개인정보 동의·금지 주장·출처 검수 흐름이 있음
- 환불·장애·문의 책임자가 정해짐

## 공식 참고

- [Google 생성형 AI 콘텐츠 안내](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=en)
- [Google Search 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 이벤트](https://developers.google.com/analytics/devguides/collection/ga4/events?hl=en)
- [GA4 전자상거래](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Meta Conversions API](https://www.facebook.com/business/help/AboutConversionsAPI)
- [카페24 API](https://developers.cafe24.com/docs-new/en/docs/guide/intro)


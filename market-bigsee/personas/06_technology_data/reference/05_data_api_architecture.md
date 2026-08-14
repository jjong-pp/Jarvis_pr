# 데이터·외부 API 연동 구조

기준일: 2026-08-13  
상태: 개념 설계. 현재 코드 저장소 확인 후 기술 선택 확정.

## 1. 설계 목표

- 조사·콘텐츠·SKU·캠페인·주문을 하나의 ID 체계로 연결
- CSV로 먼저 검증하고 API 커넥터를 단계적으로 추가
- 외부 시스템이 마켓빅시 데이터를 읽고 이벤트를 보낼 수 있게 함
- 중복 주문·중복 이벤트를 방지
- 고객별 사용량과 원가를 측정
- 플랫폼별 API 변경을 핵심 도메인에서 분리

## 2. 개념 구조

```text
[Naver / Google / YouTube / Instagram / News]
                         ↓
                  Research Service
                         ↓
[Brand] → [SKU] → [Brief] → [Content] → [Campaign Link]
   ↑                                             ↓
   └──────── [Insight / Recommendation] ← [Event Store]
                                                   ↑
              [GA4 / Store / CSV / Webhook / Orders]
```

마켓빅시 내부 정본은 외부 플랫폼 ID가 아니라 자체 `workspace_id`, `sku_id`, `campaign_id`, `content_id`입니다. 외부 ID는 매핑 테이블에 저장합니다.

## 3. 핵심 엔터티

| 엔터티 | 주요 필드 |
|---|---|
| Workspace | id, name, plan, owner, timezone, currency |
| Member | user_id, workspace_id, role, status |
| Brand | id, workspace_id, name, voice, approved_claims, blocked_claims |
| SKU | id, parent_sku_id, brand_id, name, variant, price, cost, inventory, URL |
| ExternalSKU | sku_id, provider, store_id, external_product_id, external_variant_id |
| Research | id, workspace_id, keyword, platforms, period, source timestamps |
| Brief | id, research_id, sku_ids, funnel_stage, persona, objective, sources |
| Content | id, brief_id, type, channel, status, body_version, approved_by |
| Campaign | id, name, source, medium, start_at, end_at, spend |
| ContentLink | content_id, campaign_id, sku_id, destination_url, UTM |
| Event | id, event_name, occurred_at, session_id, content_id, campaign_id, sku_id |
| Order | id, provider, external_order_id, ordered_at, currency, totals, status |
| OrderLine | order_id, sku_id, quantity, price, discount, cost, refund |
| UsageLedger | workspace_id, user_id, unit, quantity, cost, provider, timestamp |
| Connection | workspace_id, provider, auth_ref, scopes, status, last_sync_at |

## 4. SKU 식별 원칙

- 내부 `sku_id`는 생성 후 변경하지 않음
- 옵션별로 고유 SKU를 부여
- 같은 상품군은 `parent_sku_id`로 묶음
- 스마트스토어 판매자 상품 코드, 카페24 품목 코드, Shopify variant ID를 별도 매핑
- 이름으로 주문과 상품을 결합하지 않음
- 외부 ID가 바뀌어도 내부 SKU의 성과 이력은 유지

Shopify의 ProductVariant도 SKU·가격·재고·옵션을 상품 변형 단위에 연결합니다. [Shopify ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant)

## 5. 이벤트 규격

GA4 권장 이벤트와 호환되는 이름을 우선 사용합니다.

```json
{
  "event_id": "evt_01H...",
  "event_name": "purchase",
  "occurred_at": "2026-08-13T02:10:00Z",
  "workspace_id": "ws_123",
  "anonymous_id": "anon_456",
  "session_id": "sess_789",
  "campaign_id": "cmp_001",
  "content_id": "cnt_001",
  "transaction_id": "order_1001",
  "currency": "KRW",
  "value": 59000,
  "items": [
    {
      "sku_id": "SKU-RED-250",
      "quantity": 1,
      "price": 59000
    }
  ]
}
```

필수 규칙:

- 클라이언트가 `event_id` 또는 `idempotency_key` 제공
- `purchase`는 `transaction_id` 중복 방지
- 금액은 통화와 함께 저장
- 이벤트 발생 시각과 수집 시각을 분리
- 개인정보 대신 익명·내부 ID 우선
- 실패 이벤트는 격리 큐에 보관하고 재처리

## 6. 공개 API 초안

```text
POST   /v1/skus
GET    /v1/skus
GET    /v1/skus/{sku_id}
PATCH  /v1/skus/{sku_id}

POST   /v1/research
GET    /v1/research/{research_id}

POST   /v1/briefs
POST   /v1/content
GET    /v1/content/{content_id}
POST   /v1/content/{content_id}/approve

POST   /v1/campaigns
POST   /v1/tracking-links

POST   /v1/events/batch
POST   /v1/orders/batch
GET    /v1/reports/sku-performance
GET    /v1/reports/content-performance

POST   /v1/webhook-endpoints
GET    /v1/usage
```

처음부터 외부 공개 API를 완성하지 않습니다. 내부 서비스도 같은 도메인 명령과 이벤트 규격을 사용하도록 만든 뒤 안정된 부분만 외부에 공개합니다.

## 7. 인증과 권한

### 사용자·파트너 API

- API 키: 서버 간 단순 연동
- OAuth 2.0: 외부 앱이 사용자 승인을 받아 연결
- 키는 원문 저장하지 않고 해시 또는 비밀 저장소 사용
- 워크스페이스별 키 분리
- 만료·회전·폐기 지원

권장 범위:

- `skus:read`, `skus:write`
- `content:read`, `content:write`
- `events:write`
- `orders:write`
- `reports:read`
- `connections:manage`

### 웹훅

- HMAC 서명
- 전달 ID와 타임스탬프
- 재시도와 지수 백오프
- 중복 전달 허용을 전제로 수신자 멱등 처리
- 전달 로그와 수동 재전송

Shopify는 주문 생성 같은 변경을 웹훅으로 전달하지만 전달 순서를 보장하지 않으며, 누락에 대비해 주기적 재조정 작업을 권장합니다. [Shopify 웹훅](https://shopify.dev/docs/apps/build/webhooks) 마켓빅시도 웹훅과 주기적 동기화를 함께 사용해야 합니다.

## 8. 커넥터 우선순위

### 0단계: CSV와 추적 링크

- SKU CSV 가져오기
- 주문·환불 CSV 가져오기
- 캠페인 링크 생성
- 자바스크립트 이벤트 스니펫 또는 서버 이벤트 수신

이 단계는 플랫폼 심사 없이 제품 가치를 검증할 수 있습니다.

### 1단계: GA4

- `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `refund`
- `item_id`를 SKU와 매핑
- Data API 또는 BigQuery 내보내기 방식 검토
- 광고 플랫폼 보고서와 실제 주문을 구분

GA4 이커머스 이벤트는 자동 수집되지 않으므로 사이트·앱에서 명시적으로 전송해야 합니다. [GA4 이커머스 설정](https://support.google.com/analytics/answer/12200568?hl=ko)

### 2단계: 국내 커머스 하나

선택안 A: 네이버 스마트스토어

- 상품·주문·정산 관련 공개 API 존재
- 상품 목록에서 판매자 관리 코드 조회 가능
- 주문 상세에서 상품 번호·판매자 상품 코드·수량·가격·상태 확인 가능
- OAuth·애플리케이션 등록과 권한 획득 필요

자료: [네이버 커머스API 소개](https://apicenter.commerce.naver.com/docs/introduction), [최신 커머스API](https://apicenter.commerce.naver.com/docs/commerce-api/current)

선택안 B: 카페24

- Admin API에서 상품·주문·회원·게시판 CRUD 지원
- Analytics API에서 사용자 행동 데이터 제공
- OAuth 2.0과 호출량 제어 필요

자료: [카페24 REST API](https://developers.cafe24.com/docs/api/)

첫 고객 3곳의 사용 채널 비중으로 둘 중 하나만 먼저 선택합니다.

### 3단계: Shopify

- GraphQL Admin API로 ProductVariant·SKU·주문 항목 동기화
- 웹훅으로 상품·주문·환불 변경 수신
- 웹훅 누락·역순에 대비한 재조정 작업

### 4단계: 광고·CRM

- Meta Pixel·Conversions API
- Google Ads 전환 및 비용
- Salesforce·HubSpot CRM
- 이메일·메시징 도구

CRM은 리드·거래 파이프라인이 중요한 B2B 고객이 확보된 후 연결합니다. 이커머스 MVP에서는 SKU·주문·콘텐츠 연결이 먼저입니다.

## 9. 기여도 계산

### MVP

- 최초 접점: 첫 추적 콘텐츠·캠페인
- 마지막 비직접 접점: 구매 전 마지막 유효 접점
- 보조 전환: 구매 경로에 포함됐지만 최종 접점이 아닌 콘텐츠
- 직접 구매: 추적 접점 없음

### 이후

- 위치 기반 배분
- 시간 감쇠
- 캠페인 홀드아웃과 증분 효과
- SKU·고객군별 반복 구매 기여

화면에는 모델 이름, 조회 기간, 룩백 윈도우, 직접 유입 처리 규칙을 표시합니다. 서로 다른 모델의 매출을 합산하지 않습니다.

## 10. 사용량·원가 계측

`UsageLedger`에 최소 다음 단위를 기록합니다.

| 단위 | 예시 |
|---|---|
| platform_query | Naver·YouTube·Google 조사 1회 |
| api_call | 외부 API 요청 수 |
| ai_input_tokens | AI 입력 토큰 |
| ai_output_tokens | AI 출력 토큰 |
| content_generation | 초안 생성 건 |
| active_sku_day | 활성 SKU 일수 |
| event_ingested | 수집 이벤트 수 |
| order_ingested | 주문 행 수 |
| storage_byte_day | 저장 용량·기간 |
| export | CSV·HTML·리포트 내보내기 |

성공·실패·재시도와 공급자 비용을 함께 기록해야 가격 하한선과 API 한도를 계산할 수 있습니다.

## 11. 신뢰성 설계

- 외부 API별 어댑터 계층
- 요청 큐와 동시성 제한
- 429 응답의 재시도 시각 준수
- 공급자별 회로 차단기
- 원본 응답과 정규화 데이터 분리
- 마지막 정상 동기화 시각 표시
- 데이터 출처와 수집 시각 표시
- 웹훅＋주기적 전체 재조정
- 공급자 버전 변경 모니터링

카페24는 호출량·처리시간 제한과 429 응답을 문서화하고 응답 헤더로 잔여량을 확인하도록 안내합니다. [카페24 API 제한](https://developers.cafe24.com/docs/api/)

## 12. 개인정보·보안

- MVP 성과 측정에는 주문자 이름·전화번호·주소를 기본 수집하지 않음
- 주문 ID는 외부 ID와 내부 ID를 분리하거나 해시
- 고객 식별이 필요할 경우 가명 ID 사용
- OAuth 토큰과 API 키는 Firestore 일반 문서와 분리
- 데이터 보존기간과 삭제 작업 제공
- 워크스페이스 경계를 모든 서버 쿼리에서 검사
- 관리자 열람과 내보내기 감사 로그
- AI 제공자에게 전송되는 필드와 보존 정책 명시
- 외부 공개 API 전 보안 검토와 속도 제한

## 13. 현재 인프라에 적용할 때 확인할 항목

1. Firebase 문서가 사용자 ID만 기준인지 워크스페이스 기준인지
2. Netlify Function이 장기 동기화·웹훅 처리에 적합한지
3. 큐·스케줄러·재시도 저장소가 있는지
4. 사용량 차감이 서버에서 원자적으로 처리되는지
5. 플랫폼별 OAuth 토큰을 안전하게 보관·회전하는지
6. 이벤트와 주문의 중복 방지 키가 있는지
7. Firestore 쿼리로 장기간 이벤트 집계를 감당할 수 있는지
8. 분석용 저장소를 운영 DB와 분리해야 하는 시점

주문·이벤트 양이 증가하면 Firestore 원본 이벤트를 매번 조회하는 방식보다 일별 집계 테이블 또는 별도 분석 저장소가 필요합니다. 정확한 전환 시점은 실제 이벤트 수와 쿼리 비용을 측정한 뒤 정합니다.

## 14. 구현 순서

1. 내부 ID·이벤트·사용량 규격 확정
2. 워크스페이스와 SKU 모델
3. 콘텐츠·캠페인·추적 링크
4. 주문 CSV와 멱등 수집
5. 기본 퍼널·SKU·콘텐츠 성과판
6. GA4 연동
7. 국내 커머스 한 곳
8. 팀 권한
9. 내부 API 안정화 후 외부 공개
10. 추가 커넥터와 고급 기여도


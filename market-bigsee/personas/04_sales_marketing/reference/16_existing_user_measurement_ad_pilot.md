# 기존 약 20명 사용자 계측과 첫 광고 시험안

기준일: 2026-08-13  
상태: 사용자가 전달한 `약 20명`을 미검증 기준으로 반영·등록/활성/유료 구분 필요

## 결론

기존 약 20명은 광고 전환의 기준 집단으로 먼저 사용합니다. 개발자가 3~7일 안에 기존 사용자 행동을 백필하고 신규 이벤트를 검수하면, 네이버·Google 검색부터 4주간 최대 150만원의 학습 광고를 시작합니다. Meta는 방문자 풀이 생긴 뒤 리타게팅만 시험하고 TikTok은 이번 시험에서 제외합니다.

## 개발자에게 확인할 첫 숫자

| 구분 | 숫자 | 정의 |
|---|---|---|
| 등록 사용자 | 전체 계정 수 | 중복·테스트·관리자 계정 제외 |
| 7일·28일 활성 | 기간 중 핵심 행동 1회 이상 사용자 | 로그인만으로 활성 처리하지 않음 |
| 첫 가치 도달 | 실제 키워드로 리포트 1건 완성 | 가입 후 24시간 내 여부도 분리 |
| 반복 사용자 | 서로 다른 날에 리포트 2건 이상 완성 | 단발성 체험과 구분 |
| 유료 사용자 | 실제 수금 완료 | 쿠폰·내부·환불 계정 분리 |
| 팀 의도 사용자 | 초대·공유·복수 고객·팀 기능 클릭 | B2B 영업 후보 |
| 휴면·이탈 | 28일 핵심 행동 없음 | 마지막 가치 행동일 포함 |

## 기존 20명 백필표

개인정보 대신 내부 ID를 사용하고 사용자 1명당 한 행으로 전달받습니다.

| 필드 | 의미 |
|---|---|
| `user_id`, `workspace_id` | 가명 내부 ID와 조직 경계 |
| `created_at`, `first_seen_at`, `last_value_at` | 가입·첫 방문·마지막 핵심 행동 시각 |
| `role_segment` | 1인 셀러·프리랜서·대행사·기타·미확인 |
| `acquisition_source` | 직접·소개·검색·광고·기타·미확인 |
| `active_days_7d`, `active_days_28d` | 단순 로그인 제외 핵심 행동 일수 |
| `research_completed_count` | 성공한 조사 수 |
| `report_completed_count` | 완성 리포트 수 |
| `export_share_count` | 다운로드·복사·공유 수 |
| `time_to_first_value_minutes` | 가입→첫 리포트 완성 시간 |
| `paid_at`, `net_revenue`, `refund_amount` | 실제 수금·순매출·환불 |
| `team_intent_count` | 초대·팀 기능·복수 프로젝트 신호 수 |
| `direct_cost_30d` | 최근 30일 API·AI·인프라 직접원가 |
| `support_minutes_30d` | 최근 30일 사람 지원시간 |

기존 로그로 알 수 없는 필드는 `0`이 아니라 `unknown`으로 둡니다.

## 신규 이벤트

모든 이벤트 공통 필드:

```text
event_id, event_name, occurred_at, received_at,
anonymous_id, user_id, workspace_id, session_id,
utm_source, utm_medium, utm_campaign, utm_content, utm_term,
landing_variant, referrer, device_type, app_version
```

| 흐름 | 이벤트 | 반드시 붙일 값 |
|---|---|---|
| 유입 | `landing_view` | URL·UTM·광고 클릭 ID·랜딩 버전 |
| 가입 | `signup_started`, `signup_completed` | 가입 방식·역할 선택·오류 코드 |
| 온보딩 | `onboarding_completed` | 역할·목표·사용 채널 |
| 조사 | `research_started`, `research_completed`, `research_failed` | 조사 ID·키워드 유형·채널·소요시간·실패 코드 |
| 첫 가치 | `report_completed` | 리포트 ID·출처 수·가입 후 경과시간 |
| 활용 | `report_exported`, `report_shared`, `result_copied` | 결과 유형·공유 방식 |
| 반복 | `core_action_returned` | 첫 가치 후 경과일·누적 리포트 수 |
| 결제 | `paywall_viewed`, `checkout_started`, `subscription_started`, `refund_completed` | 요금제·통화·금액·거래 ID |
| 팀 의도 | `workspace_created`, `member_invited`, `team_feature_clicked` | 조직·좌석·기능 이름 |
| 의견 | `feedback_submitted` | 점수·사유 분류·사용 상황 |

`signup_completed`는 상단 퍼널 관찰값이고, 광고 품질의 핵심 전환은 `report_completed`입니다. 결제가 시작되면 `subscription_started`를 최종 사업 전환으로 봅니다.

## 원가 원장

각 외부 요청과 생성 작업에 다음을 남깁니다.

```text
usage_id, occurred_at, user_id, workspace_id, report_id,
provider, operation, quantity, unit, input_tokens, output_tokens,
request_count, duration_ms, storage_bytes, status, retry_count,
provider_cost_krw, allocated_infra_cost_krw
```

반드시 계산할 숫자:

- 사용자당 30일 직접원가
- 성공 리포트 1건당 직접원가
- 공급자별 비용과 요청 수
- 실패·재시도 비용 비율
- 처리시간 중앙값과 P95
- 고객지원 시간을 포함한 공헌이익

## 개발 완료 검수

| 검수 | 통과 기준 |
|---|---|
| 이벤트 중복 | 동일 `event_id`가 두 번 집계되지 않음 |
| 퍼널 연결 | 테스트 5회 모두 랜딩→가입→첫 리포트가 같은 사용자로 연결 |
| UTM 보존 | 가입과 첫 리포트 이후에도 최초·최종 UTM 조회 가능 |
| 원가 연결 | 테스트 리포트 5건 모두 공급자 호출과 원가가 리포트 ID에 연결 |
| 실패 기록 | 의도적으로 만든 실패가 오류 코드·재시도와 함께 저장 |
| 개인정보 | 불필요한 개인정보를 광고 플랫폼으로 보내지 않음 |

## 예상 개발 공수

실제 코드 확인 전 일정 가설이며 개발자 회신으로 교체합니다.

| 현재 구조 | 예상 공수 | 포함 범위 |
|---|---:|---|
| 사용자 ID·행동 로그·UTM이 이미 있음 | 1~3 개발일 | 20명 백필, 첫 가치 이벤트, 기본 대시보드·검수 |
| 행동 로그는 있으나 원가 연결이 없음 | 3~7 개발일 | 위 범위와 공급사별 사용량·리포트별 원가 원장 |
| 이벤트 저장소·광고 귀속이 거의 없음 | 5~10 개발일 이상 | 이벤트 설계·저장·서버 측 귀속·검수; 과거 백필은 제한될 수 있음 |

광고비와 별개로 이 작업의 인건비는 개발자 일 단가와 실제 범위를 받아 계산합니다.
## 광고 실행안

### 순서와 상한

1. 3~7일: 기존 20명 백필·이벤트·원가 검수
2. 7일: 네이버 검색 30만원
3. 7일: Google 검색 30만원
4. 14일: 더 좋은 검색 채널에 60만원
5. 방문자 풀이 충분할 때만 Meta 리타게팅 15만원
6. 예비비 15만원

총 매체비 상한은 `150만원/4주`이며 부가세·소재 외주·개발 인건비는 별도입니다. TikTok은 이번 4주 시험에서 집행하지 않습니다.

### 결과 시나리오

검색 매체비 120만원을 기준으로 한 계산 예시이며 시장 평균 예측이 아닙니다.

| 시나리오 | CPC 가정 | 클릭 | 가입률 | 첫 가치율 | 첫 가치 사용자 | 첫 가치 CAC |
|---|---:|---:|---:|---:|---:|---:|
| 낙관 | 1,000원 | 1,200 | 10% | 40% | 48명 | 25,000원 |
| 기준 | 2,500원 | 480 | 8% | 30% | 약 12명 | 약 100,000원 |
| 보수 | 5,000원 | 240 | 5% | 20% | 약 2~3명 | 약 500,000원 |

정확한 예상 클릭수와 CPC는 집행 직전 네이버 광고 도구와 Google 키워드 플래너에 실제 키워드·지역·일치 유형을 넣어 교체합니다. Google 키워드 플래너는 예산·입찰·계절성·광고 품질을 반영한 클릭·비용 예측을 제공합니다. [Google Keyword Planner forecast](https://support.google.com/google-ads/answer/3022575)

### 중단 기준

- 채널당 30만원을 써도 첫 가치 사용자가 3명 미만이면 중단
- 100클릭 이후 방문→가입이 3% 미만이면 광고보다 랜딩을 수정
- 가입 10명 이후 가입→첫 가치가 20% 미만이면 온보딩·제품을 수정
- UTM 또는 원가 연결이 깨지면 즉시 집행 중단
- 유료 전환이 생기면 `허용 CAC = 월 ARPA × 총마진율 × 목표 회수개월`로 확대 기준 교체

## 매체 설정 근거

- Google: `report_completed`를 핵심 전환으로 두고 가입은 관찰 전환으로 분리합니다. Google은 Primary 전환은 입찰에 사용하고 Secondary는 관찰만 한다고 설명합니다. [Google primary/secondary conversions](https://support.google.com/google-ads/answer/10993988)
- Google 일일예산은 특정일 최대 2배까지 지출될 수 있고 월 한도는 평균 일일예산의 30.4배입니다. [Google Ads 지출 한도](https://support.google.com/google-ads/answer/10486637?hl=ko-KR)
- 네이버: 공식 웹 전환 스크립트로 표준 전환을 검수하되 `report_completed`와 원가는 자체 이벤트 원장에서 판단합니다. [네이버 웹 전환 추적](https://naver.github.io/conversion-tracking/)
- Meta: 검색 방문자 풀이 생긴 후 Pixel과 Conversions API로 후속 전환을 연결합니다. Meta는 Conversions API가 구독 같은 후속 행동 측정과 최적화를 지원한다고 설명합니다. [Meta Conversions API](https://www.facebook.com/business/help/AboutConversionsAPI)
- TikTok: 이번 시험에서는 제외합니다. 이후 Pixel·Events API를 준비하고 유기 소재가 검증됐을 때 시작합니다. [TikTok web data connection](https://ads.tiktok.com/help/article/get-started-pixel?lang=en-GB)

## 개발자에게 그대로 보낼 요청문

```text
현재 약 20명의 등록 사용자가 있다고 들었습니다. 광고 전에 이들을 기준 집단으로 만들고 싶습니다.

1) 테스트·관리자·중복을 제외한 실제 등록 수와 7일/28일 활성, 첫 리포트 완성, 반복 사용, 유료, 팀 의도 수를 확인해 주세요.
2) 기존 사용자 1명당 user_id, 가입일, 마지막 핵심 행동일, 7/28일 활성일수, 조사/리포트/내보내기 수, 첫 가치 시간, 유료·환불, 팀 의도, 최근 30일 직접원가·지원시간을 한 행으로 추출해 주세요. 알 수 없는 값은 0이 아니라 unknown으로 표시해 주세요.
3) landing_view → signup_completed → report_completed → 재사용 → subscription_started → team_intent를 같은 user/workspace로 연결하고 최초·최종 UTM을 보존해 주세요.
4) 외부 API·AI·인프라 사용은 provider, operation, quantity, token, 요청 수, 성공/실패/재시도, 처리시간, 원가를 user/workspace/report_id에 연결해 주세요.
5) 테스트 5회에서 이벤트 중복 없음, 퍼널·UTM·원가 연결, 실패 기록을 함께 검수하고 3~7일 내 가능 범위와 공수를 알려 주세요.

이 검수가 끝나면 네이버와 Google 검색부터 4주 최대 150만원으로 순차 시험하겠습니다.
```

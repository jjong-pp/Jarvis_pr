# 자이언트 특송사 API (GGATE API V2) — 원문 검증 메모

최초 기록: 2026-08-11 · 확인 기준 버전: **v1.3.5 (2026-08-06)**

> **유지 목적**: Postman 원문 URL, 실제 엔드포인트, 버전 이력, 제약·에러코드처럼 다른 문서에 없는 기술 근거만 보관한다. 운영 결정과 미결 질의는 `planning/리스크_질의대장.html`, 최종 필드 계약은 `planning/api_field_mapping.html`이 원본이다. 이 메모에는 협의 정책을 중복 기록하지 않는다.

## 1. 접속 정보

| 항목 | 값 |
|---|---|
| API 문서 (Postman) | https://documenter.getpostman.com/view/11773234/2sBXqGrh3A#139b3cfe-ee5f-41cf-b986-190125e48891 |
| 운영 Base URL | `https://g-api.giantnetworkgroup.com` (컬렉션 변수 `{{prop}}`) |
| 인증 | 요청 헤더 `X-Api-Key` |
| 컬렉션 원본 JSON | https://documenter.gw.postman.com/api/collections/11773234/2sBXqGrh3A?segregateAuth=true&versionTag=latest |

> Postman 문서 화면은 지연 로딩되어 일부 요청만 보이는 경우가 있다.
> **규격 대조는 반드시 위 컬렉션 원본 JSON을 내려받아 확인한다.** (2026-08-10 1차 검토 오판의 원인)

## 2. 요청 인벤토리 (7개 — 컬렉션 원본 전수)

| Method | 요청명 | 경로 | 당사 사용 |
|---|---|---|---|
| GET | HWB 단건 조회 | `/api/hwb/:hwbNo` | 보조 |
| POST | **HWB 등록** | `/api/hwb/bulk-sync` | 사용 (핵심) |
| POST | HWB 검색 (최대 500건) | `/api/hwb/search` | 사용 (동수 전송 판별) |
| GET | 화물 진행 상태 조회 | `/api/unipass/cargo-progress?hwbNo=&hwbNoYear=` | 사용 (관리자 통관조회) |
| PATCH | HWB 정보 일부 수정 | `/api/hwb/:hwbNo` | 사용 (오류 수정 재제출) |
| POST | HWB 통관 이상 조회 | `/api/entry-exit/search` | 검토 (CS 대응) |
| GET | 개인통관고유부호 검증 | `/api/unipass/personal-code/validate` | 미사용 (당사는 NICE 경유) |

**없는 것**: DELETE 엔드포인트 없음 / MWB 등록 API 없음(v1.3.3 추가 → v1.3.4 마스터 정보 삭제).
→ 오류건 취소 경로가 없으므로 `PATCH` 4개 필드 외 정정은 자이언트에 절차 확인 필요.

## 3. 버전 이력 (컬렉션 원본 기재)

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.3.5 | 2026-08-06 | HWB 등록 — `hwbNo` 미입력(누락·빈값) 시 택배사 코드 기준 하우스번호 자동 채번 |
| v1.3.4 | 2026-07-28 | HWB 등록 마스터 관련정보 삭제 |
| v1.3.3 | 2026-07-24 | HWB 단건조회 응답에 택배사 집배코드 추가 / HWB 등록 `mwbNo` 필수 제외 / MWB 등록 API 신규 |
| v1.3.2 | 2026-07-23 | HWB 등록 마스터정보 추가 (mwbNo·carrierCode·conveyanceName·voyageNo·departurePort·arrivalPort·departureDate·arrivalDate) |
| v1.3.1 | 2026-07-16 | `transportType` 추가 / `domesticCarrierName` 한글 택배사명 입력 허용 |
| v1.3.0 | 2026-06-11 | HWB 통관 이상 조회 500건 |
| v1.2.0 | 2026-06-10 | 화물 진행 상태 조회 · HWB 정보 일부 수정 · 통관 이상 조회 추가 |

## 4. 원문 대조에서 발견한 차이 (2026-08-11, 현재 기획 반영 완료)

2026-08-11 검토 당시 기획서 기재값과 실제 규격이 달랐던 항목이다. 현재 값은 `planning_v6.html`과 `api_field_mapping.html`에 정정 반영되었으며, 이 표는 원문 검증 근거로만 보관한다.

| 필드 | 과거 기획 문서 기재 | **컬렉션 원본 (실제)** | 관세청 대응 필드 |
|---|---|---|---|
| `items[]` 배열 | 최대 5개 (동수 채번) | **1~50개** | `product_info` [1, 999] |
| `items[].productName` | String(300) | **Max 200자** | `ord_prod_nm` String(600) |
| `consigneeName` | String(150) | **Max 100자** | `cnsi_nm` String(150) |
| `consigneeAddr` | String(250) | **Max 150자** | `cnsi_bscs_addr` String(250) |
| `consigneeAddressEng` | String(300) | **Max 200자** | — |
| `consigneeTel` | String(60) | **Max 40자** | `cnsi_telno` String(60) |
| `shipperName` | String(150) | **Max 100자** | — |
| `shipperAddr` | String(250) | **Max 150자** | — |
| `orderSiteUrl` | String(3000) | **Max 300자, 필수 N** | `ord_site_url` String(200) |
| `ordererId` | String(50) | **Max 100자** | `ordrr_id` String(50) |
| `brokerCode`/`brokerName` | "제출자 부호/상호" | **"판매중개자부호/판매중개자명"** (유형 A일 때 필수) | `elcm_ents_sgn`? — 의미 확인 필요 |

소수점 자릿수: `unitPrice` 소수점 3자리 / `itemAmount` Min 0.00 / **`totalValueUsd` 소수점 2자리** / `weight` 소수점 3자리.
→ 단가 3자리 × 수량 합계가 3자리로 떨어지면 관세청(16,3)과 자이언트(2자리) 총액이 어긋난다.
→ **2026-08-12 관세청 질의 선행**: 상품별 선반올림 여부, 전체 합산 후 반올림 여부, `itemAmount` 합계와 총액 허용 오차, 관세청 3자리와 자이언트 2자리 금액 차이 허용 여부. 회신 전 단가 2자리 고정 금지.

`tempAuthNo` 전달 주체, 분할 출고, USD 150 포장, 관세청 `tot_stlm_amt` 등 운영 정책과 질의 상태는 통합 대장에서만 관리한다.

## 5. 실무상 알아둘 동작

- **HWB 검색**: `transportType`(AI/OI) 필수. 존재하지 않는 `hwbNo`는 **에러 없이 조용히 결과에서 제외**되고, `transportType`을 잘못 넣어도 그냥 빠진다. → "결과에 없음"은 "동수 미전송"과 구분되지 않는다.
- **HWB 검색 응답**에 `mwbNo`(연결 마스터 운송장번호)·`mwbSdt`·`pccError`·`pccErmsg`·`gngMsgCode` 포함.
- **중복 등록**: `H006 이미 등록된 운송장번호(hwbNo)입니다.`
- **HWB 검색 상한 확정(2026-08-12)**: 최대 **500건이며 증설 불가**. 반드시 500건 단위로 분할 조회한다. 공통 에러표 `H004`의 "최대 1,000건" 문구는 이 엔드포인트 구현 기준으로 사용하지 않는다.
- **개인통관고유부호 검증**: 본문 설명은 `POST`인데 컬렉션 요청 메서드는 `GET`(body 동반). → 자이언트 확인 필요.
- `pccCode`는 "13자 고정 (P...)"로만 기재됨. 협력인정업체 전환 시 쓰는 `O`로 시작하는 일회용부호 허용 여부는 등록 API에 명시가 없다(검증 API에는 허용 명시).
- 검증 API는 형식 오류가 1건이라도 있으면 **요청 전체가 400**으로 거부된다.

## 6. gngMsgCode (통관 이상 코드) 요약

`00` 미지정(초기값) · `01` 검사 · `02` 검역 · `03` 개인정보 오류(PCCC 미갱신·자격중지) · `04` 발송 주소오류 ·
`11~13` X-RAY(검사/취하/반출) · `15` 사업자 변경 ·
`21` 합산취하 · `22` 지재권 · `23` 수량과다 · `24` 가격상이 · `25` 품명상이 · `26` 개인통관부호 상이 · `27` 기타 · `30` 저작권 (모두 서류제출) ·
`28` 세금 발생 · `29` 서류보완 · `44` 통관오류 · `45` 무적화물 · `46` 미착화물 · `47` 분할·정정 · `48` 대형화물 ·
`93` 세금납부 거부 · `94` 서류제출 거부 · `95` 서류수집 불가 · `96` 분실 · `97` 파손 · `98` 세관폐기 · `99` 통관불가

## 7. 공통 에러코드

`C001` 유효성 실패 · `C002` 서버 오류 / `A001` 인증 필요 · `A002` 권한 없음 · `A003` API Key 누락 · `A004` 유효하지 않은 Key /
`H001` HWB 없음 · `H002` 송하인 없음 · `H003` 수하인 없음 · `H004` 벌크 건수 초과 · `H005` 벌크 일부 검증 실패 ·
`H006` hwbNo 중복 · `H007` 배치 정보 없음 · `H010` hwbNo 누락 · `H011` HS코드 6자리 아님 · `H012` 수량 1 미만 · `H013` 수량 총수량 초과 · `H014` 중량 0 이하

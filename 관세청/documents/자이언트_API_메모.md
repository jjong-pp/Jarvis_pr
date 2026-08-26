# 자이언트 GGATE API — 원본 대조 메모

> 원본: Postman 컬렉션 공개 문서 <https://documenter.getpostman.com/view/11773234/2sBYArTsRz>
> 컬렉션 JSON: `https://documenter.getpostman.com/api/collections/11773234/2sBYArTsRz`
> 대조 기준: **v2.0.0 (2026-08-20)** · 대조일 2026-08-26
> 규칙 — 자이언트 규격은 **Postman 화면으로 판단하지 않는다.** 컬렉션 원본 JSON을 내려받아 대조한다. 화면은 지연 로딩되어 일부만 보인다(2026-08-10 오판 원인).

---

## 1. v2.0.0에서 무엇이 사라졌는가 — 가장 중요한 변경

컬렉션 개요의 v2.0.0 항목 원문:

> `v2.0.0 2026-08-20` — HWB 등록, HWB 검색, HWB 정보 일부 수정, MWB 등록, **개인통관고유부호 검증 삭제**.
> HWB 거래정보등록, HWB 상품정보등록, HWB 등록상태 조회, HWB 검색, MWB 등록 **신규 추가**.
> **HWB 수정 추가되었으나 기능 제공은 하지 않음.**

| 종전 문서가 전제하던 것 | v2.0.0 실제 |
|---|---|
| `PATCH /api/hwb/{hwbNo}` 로 `consigneeTel`·`pccCode`·`tempAuthNo`·`totalValueUsd` 4개 정정 | **엔드포인트 없음.** 대체 `PATCH /api/hwb/bulk-sync/merged`는 설명이 **“삭제 예정”** 한 줄뿐이며 기능 미제공 |
| 자이언트 PCCC 검증 API (GET/POST 표기 충돌 건) | **삭제됨.** NICE 검증만 남음 — 종전 “개발 범위 제외” 결론은 결과적으로 맞았으나 이유가 다름 |
| `POST /api/hwb/search` (레거시 전 컬럼 조회) | 별도 문서(`hwb_legacy_search_api.txt`)로 분리. 신규 경로는 `POST /api/hwb/bulk-sync/search` |
| `DELETE /api/hwb/{hwbNo}` · “미완성 HBL 24시간 자동 소멸” | **컬렉션에 없음.** 기획서 기재는 근거 미확인 상태 그대로 |

> **등록 후 정정 경로가 없다.** 관세청 FAQ 8-14는 운송장번호가 바뀌면 새 제출번호로 거래정보를 재제출하라고 하는데, 자이언트 쪽에는 대응하는 수정 수단이 없다. 잘못 등록된 HWB의 처리 절차를 자이언트에 확인해야 한다.

---

## 2. 엔드포인트 전량 (v2.0.0)

| 메서드 | 경로 | 이름 | 비고 |
|---|---|---|---|
| POST | `/api/hwb/bulk-sync/clearance` | HWB 거래정보 등록 | **Geek** 소유 — 통관·수하인 |
| POST | `/api/hwb/bulk-sync/logistics` | HWB 상품정보 등록 | **동수** 소유 — 물류·상품 |
| POST | `/api/hwb/bulk-sync/status/search` | HWB 등록상태 조회 | **아래 3절 참조 — 현재 미구현 상태** |
| POST | `/api/hwb/bulk-sync/search` | HWB 검색 | 병합 확정 건 조회 |
| POST | `/api/hwb/bulk-sync/master` | MWB 등록 | MAWB 별도 |
| PATCH | `/api/hwb/bulk-sync/merged` | HWB 수정 | **삭제 예정 · 기능 미제공** |
| POST | `/api/entry-exit/search` | HWB 통관 이상 조회 | `gngMsgCode` |
| GET | `/api/unipass/cargo-progress` | 화물 진행 상태 조회 | `hwbNo` + `hwbNoYear` |

인증은 전 경로 `X-Api-Key` 헤더. 누락 `A003` / 무효 `A004`.

---

## 3. `status/search` — Geek 미구현 구간

컬렉션 원문:

> 등록(`clearance`/`logistics`) 응답의 `pending`에는 **“상대를 기다리는 건”과 “최종검증에 걸린 건”이 함께 담긴다.** 앞은 기다리면 풀리지만 뒤는 **데이터를 고쳐 재전송해야** 풀린다. 그 둘을 갈라 보기 위한 조회다.

2026-08-25 Geek 회신은 “`/api/hwb/bulk-sync/search`는 호출할 필요가 없어 구현하지 않았다”였다. 그러나 **`status/search`는 `search`와 다른 엔드포인트**이고, 이것이 없으면 `pending`에 남은 건이 *대기 중*인지 *검증 실패*인지 구분할 수 없다. 검증 실패 건은 방치하면 영원히 병합되지 않는다.

→ Geek에 `status/search` 구현 여부를 별도로 확인해야 한다. (`search` 미구현과 혼동 금지)

스냅샷 원본 필드는 돌려주지 않는다 — 타사 소유 필드가 조회 방향으로 새면 소유 분리가 깨지기 때문. 확정된 값을 보려면 `bulk-sync/search`를 쓴다.

---

## 4. `clearance` (Geek) 필드 — 전량

공통키: `hwbNo`(Max 20) + `orderNo`(Max 52, 관세청 `ord_no`와 동일). 배열 `hwbList` 1~500건.

| 필드 | 타입 | 필수 | 제약 | 비고 |
|---|---|---|---|---|
| `ordererName` | String | Y | Max 150 | 주문자 성명 |
| `ordererTel` | String | N | Max 40 | 하이픈 제외 권고 |
| `ordererId` | String | N | Max 100 | 주문자 계정 ID |
| `consigneeName` | String | Y | Max 100 | PER 검증 통과 명의 |
| `consigneeNameEng` | String | Y | Max 150 | |
| `consigneeAddr` | String | Y | Max 150 | 한글 기본주소 |
| `consigneeAddrDet` | String | N | Max 100 | |
| `consigneeAddressEng` | String | Y | Max 200 | **행정안전부 영문주소 API 결과** |
| `consigneeZip` | String | Y | 5자 고정 숫자 | 신 5자리. 구 6자리는 관세청 `3180` |
| `consigneeTel` | String | Y | Max 40 | 실번호. **안심번호(050) 금지** |
| `pccCode` | String | Y | 13자 고정 `^[PpOo][0-9A-Za-z]{12}$` | **일반 `P` / 간소화 `O`** 로 시작 |
| `tempAuthNo` | String | Y | 6자 고정 | **발급 실패 건은 `Z99999`** |
| `orderCompletionDate` | String | Y | 14자 `YYYYMMDDHHmmss` | |

**동수 소유 필드는 받지 않는다** — `weight`·`packageCount`·`ecTypeCode`·`broker*` 등을 보내도 매핑되지 않는다. **상품(`items`)도 받지 않는다.**

같은 `(hwbNo, orderNo)` 재전송은 오류가 아니라 **멱등 upsert(덮어쓰기)**. 단 이미 병합 확정된 건의 재전송은 `H019`. 한 요청 안에 같은 키가 두 번 실리면 `H005`.

응답은 **HTTP 202 Accepted** — 저장은 끝났지만 상대 스냅샷이 없으면 하우스로 확정되지 않은 상태이기 때문. `data.accepted` = `merged[]`.length + `pending[]`.length.

---

## 5. `logistics` (동수) 상품 필드 — `itemSeq` 관련

`hwbList[].items[]` 1~50건.

| 필드 | 타입 | 필수 | 제약 | 비고 |
|---|---|---|---|---|
| `itemSeq` | String | Y | 3자 고정 숫자 | `001`, `002`… — **병합 키** |
| `itemGroupOrderNo` | String | Y | Max 52 | 상품그룹 주문번호 |
| `productPageUrl` | String | Y | Max 3000 | 상품판매 페이지 URL |
| `categoryName1` | String | Y | Max 100 | 상품 분류 1단계 |
| `categoryName2` | String | Y | Max 100 | 상품 분류 2단계 |
| `productName` | String | Y | Max 200 | |
| `hsCode` | String | Y | 6자 고정 숫자 | |

`itemSeq`는 명세상 **필수(Y)이고 병합 키**다. 다만 값 자체는 HWB 내 1부터의 연속 채번이라 **발신측이 스스로 만들 수 있고, 동수가 별도로 제공해야 할 데이터가 아니다.** 2026-08-26 자이언트·당사 협의에서 “큰 의미를 부여하지 말라”고 정리된 것도 같은 이유다 — 관세청 `prod_srno`도 동일하게 발신측 채번으로 충족한다.

---

## 6. `gngMsgCode` — 통관 이상 코드 (실제 테스트 HWB 기준)

`POST /api/entry-exit/search` 응답: `mwbNo` · `hwbNo` · `gngMsgCode` · `gngMsgName` · `messageKo`(한글 안내).
**초기값은 `00`이고, 문제 발생 시 코드·코드명·한글 메시지가 함께 바뀐다.**

| 코드 | 의미 |
|---|---|
| `00` | 미지정 (초기값 — 이상 없음) |
| `01` | 검사 |
| `02` | 검역 |
| `11` | 검사 (X-RAY) |
| `22` | 취하 (지재권) : 서류제출 |
| `23` | 취하 (수량과다) : 서류제출 |
| `27` | 취하 (기타) : 서류제출 |
| `28` | 세금 발생 |
| `29` | 서류보완 |
| `44` | 기타 (통관오류) |
| `45` | 무적화물 |
| `99` | 통관불가 |

> **주의** — 종전 문서가 쓰던 `24 가격상이`·`26 개인통관부호 상이`는 **이 목록에 없다.** 위 표는 컬렉션에 실린 테스트 HWB 목록에서 확인한 값이고 코드표 자체는 “별첨 참고”로만 되어 있으므로, `24`·`26`의 존재 여부와 전체 코드표를 자이언트에 별도 요청해야 한다. 확인 전까지 CS 문구는 위 12개 기준으로 쓴다.

`00`이 초기값이라는 점이 중요하다 — **`00` 수신은 “정상 통관”이 아니라 “아직 아무 일도 없음”**이다.

---

## 7. 종전 함정 — v2.0.0에서도 유효한지

| 함정 | v2.0.0 상태 |
|---|---|
| `POST /api/hwb/search`가 없는 `hwbNo`를 에러 없이 조용히 제외 | 레거시 `search`는 별도 문서로 분리됨. 신규 `bulk-sync/search`는 공통키 기준이며 조용한 누락 여부 **미확인** — 요청 N건 대 응답 M건 대사는 계속 유지 |
| 중복 등록 `H006` | v2.0.0 오류 코드표에는 `C001`·`H005`·`H019`·`A003`·`A004`만 등재. `H006`·`H014` **미등재** — 레거시 코드일 가능성 |
| `weight`가 0이면 `H014` | 위와 같음 — `logistics` 명세에서 재확인 필요 |
| `consigneeTel` 대시 포함 예시 vs 관세청 하이픈 제외 | v2.0.0은 `01040243740`(하이픈 없음)으로 통일됨. **포맷 분기 불필요** |
| 검색 상한 500건 | 유지. `clearance`·`logistics`·`status/search`·`search` 모두 1~500건 |
| 문자열 길이가 기획서보다 짧음 (`productName` 200 등) | 유지. 4·5절 표가 현행값 |

---

## 8. 확인 요청 목록 (자이언트)

1. 등록 후 **정정 경로**가 무엇인가 — `PATCH .../merged`가 “삭제 예정”이면 잘못 등록된 HWB는 어떻게 고치는가. 관세청 FAQ 8-14(운송장 변경 시 재제출)와 어떻게 맞추는가.
2. `gngMsgCode` **전체 코드표**(“별첨”) 원문. `24`·`26`의 존재 여부.
3. `bulk-sync/search`가 존재하지 않는 `hwbNo`를 **조용히 제외**하는가, 아니면 오류를 주는가.
4. `H006`·`H014`가 v2.0.0에서도 유효한가.
5. `DELETE` 엔드포인트와 “미완성 HBL 24시간 자동 소멸”이 실제로 존재하는가.

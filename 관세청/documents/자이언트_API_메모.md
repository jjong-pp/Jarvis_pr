# 자이언트 GGATE API — 원본 대조 메모

> 원본: Postman 컬렉션 공개 문서 <https://documenter.getpostman.com/view/11773234/2sBYArTsRz>
> 컬렉션 JSON: `https://documenter.getpostman.com/api/collections/11773234/2sBYArTsRz`
> 대조 기준: **공개 v2.0.0 (2026-08-20)** · 원본 대조일 2026-08-26 · 협의 델타 반영일 2026-08-28
> 규칙 — 자이언트 규격은 **Postman 화면으로 판단하지 않는다.** 컬렉션 원본 JSON을 내려받아 대조한다. 화면은 지연 로딩되어 일부만 보인다(2026-08-10 오판 원인).

---

## 0. 2026-08-28 최종 정정 — A/B와 신고서식을 분리한다

관세청 담당자 회신으로 아래 기준을 확정했다.

- `ecTypeCode=A/B`는 **거래 역할**이다. `A`는 직접판매, `B`는 구매대행이다.
- `LEGACY_IMPORT`와 `ECOMMERCE_DEDICATED`는 **수입신고 경로**다. A/B와 별도로 주문마다 판정한다.
- 기존 수입신고서를 사용하는 경우 관세청 회신상 **TRA001 거래정보 제출과 일회용 인증번호가 불필요**하다.
- 전자상거래 전용 수입신고서를 사용하는 경우에만 거래정보·일회용 인증번호를 해당 규격에 따라 제출한다.
- 수하인·주소·전화·PCCC·화물·상품 기본값까지 면제된다는 뜻은 아니다. 기존 수입신고에 필요한 HWB 필드는 자이언트의 레거시 계약으로 별도 확정한다.

따라서 종전의 **“외부 플랫폼 B는 모두 V2-1 전체등록하고 `tempAuthNo`·`orderCompletionDate`를 필수 전송한다”**는 문장은 일반 운영 규칙으로 사용하지 않는다. 공개 V2-1은 두 필드와 `pccCode`를 필수로 검증하므로, 기존 수입신고 A/B를 받을 endpoint·구분값·조건부 필수 규칙을 자이언트가 서면 확정해야 한다. 확정 전 임의 OTP·`Z99999`·가짜 주문완료일시를 만들지 않는다.

현재 채널 마스터는 **총 11개 = 자사몰 1 + 외부 플랫폼 10(네이버 1 + 기타 9)**이다. `도메인모음_20260828.xlsx`에는 A/B 및 업체부호만 두며 주문별 개인정보·PCCC·OTP는 넣지 않는다.

---

## 0-A. 2026-08-28 B유형 조건부 필드 협의 — 후속 정정 전 협의 이력

2026-08-28 당사와 자이언트 담당자 협의에서 외부 플랫폼 구매대행 `B` 주문은 동수 `/api/hwb/bulk-sync/logistics` 요청에 아래 9개 필드를 추가하는 안을 검토했다. 이 안은 이후 V2-1 제안과 관세청 신고서식 회신 전의 기록이며, 현재 자동 라우팅 규칙이 아니다.

`ordererName` · `ordererTel` · `consigneeName` · `consigneeNameEng` · `consigneeAddr` · `consigneeAddressEng` · `consigneeZip` · `consigneeTel` · `pccCode`

이 협의는 아래 공개 v2.0.0 원본의 “동수 logistics는 개인정보를 받지 않는다”는 계약을 **B유형에 한해 변경하는 후속 합의**다. 아직 공개 컬렉션 버전·배포일·필드별 필수검증·오류코드가 갱신되지 않았으므로, 배포 완료로 간주하지 않는다. 기존 `clearance` 필수인 `tempAuthNo`와 `orderCompletionDate`는 9개 목록에 없으며 B의 처리 경로가 미확정이다.

`buyingAgent*`는 채널 마스터에서 다음 두 경우로 분기한다.

| B 채널 | `buyingAgentCode` | `buyingAgentName` |
|---|---|---|
| 네이버스토어 | `K26014765` | `(주)아이베` |
| 기타 외부 9개 | `K26000099` | `(주)크로네` |

`buyingAgentCode=ecTypeCode` 또는 `buyingAgentName=brokerCode`처럼 다른 필드에서 변환·복사하지 않는다. 자사몰 `A`는 `buyingAgent*`와 위 개인정보 9개 필드를 동수 요청에 넣지 않는다.

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
| POST | `/api/hwb/bulk-sync/clearance` | HWB 거래정보 등록 | 공개 v2.0.0: **Geek** 소유 — 통관·수하인. 자사몰 A 유지 |
| POST | `/api/hwb/bulk-sync/logistics` | HWB 상품정보 등록 | 공개 v2.0.0: **동수** 소유 — 물류·상품. B 개인정보 추가안은 후속 신고서식 분리로 보류 |
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

## 4. `clearance` (Geek) 필드 — 공개 v2.0.0 전량

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

## 5. `logistics` (동수) 상품 필드 — `itemSeq` 및 B유형 협의 델타

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

2026-08-28 B유형 협의 델타의 기록 및 현재 해석:

- `ecTypeCode=A`: 위 9개 주문자·수하인·PCCC 필드와 `buyingAgent*` 전송 금지.
- `ecTypeCode=B`: 채널 역할값과 `buyingAgent*`는 채널 마스터에서 결정한다. 주문자·수하인·PCCC·OTP 전송 여부는 B만으로 결정하지 않는다.
- `buyingAgentCode/Name`: 네이버 B는 `K26014765/(주)아이베`, 기타 외부 9개 B는 `K26000099/(주)크로네`.
- `LEGACY_IMPORT`: 관세청 회신상 TRA001·OTP 불필요. 자이언트 레거시 필수 HWB 필드는 별도 확정한다.
- `ECOMMERCE_DEDICATED`: 거래정보·OTP를 포함한 해당 endpoint 전체 필수값을 확보한 뒤 전송한다.
- `tempAuthNo`, `orderCompletionDate`: 기존 수입신고 건에 임의 추가 금지. V2-1 조건부 검증 확정 전 자동 전송 금지.

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

0. **기존 수입신고 A/B 경로** — 관세청 회신상 TRA001·OTP가 불필요한 주문을 어느 endpoint 또는 구분값으로 보내는가. V2-1의 `tempAuthNo`·`orderCompletionDate`는 미전송 가능한가. `pccCode` 및 기본 수하인·상품 필수범위는 무엇인가. 임의 `Z99999` 사용 여부가 아니라 정식 계약을 요청한다.
1. 등록 후 **정정 경로**가 무엇인가 — `PATCH .../merged`가 “삭제 예정”이면 잘못 등록된 HWB는 어떻게 고치는가. 관세청 FAQ 8-14(운송장 변경 시 재제출)와 어떻게 맞추는가.
2. `gngMsgCode` **전체 코드표**(“별첨”) 원문. `24`·`26`의 존재 여부.
3. `bulk-sync/search`가 존재하지 않는 `hwbNo`를 **조용히 제외**하는가, 아니면 오류를 주는가.
4. `H006`·`H014`가 v2.0.0에서도 유효한가.
5. `DELETE` 엔드포인트와 “미완성 HBL 24시간 자동 소멸”이 실제로 존재하는가.

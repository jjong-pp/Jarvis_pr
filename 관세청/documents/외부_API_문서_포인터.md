# 외부 API 문서 포인터

최초 기록: 2026-08-12  
목적: 외부 API 원문을 다시 확인할 때 사용하는 링크·인증정보 구분 메모. 실제 `client_id`, `client_secret`, API Key 등 비밀값은 이 파일에 기록하지 않는다.

## 1. NICE 통합인증 API

- 공식 가이드: https://auth-guide.niceid.co.kr/#tag/1.-API/1
- 문서명: NICE 통합인증 서비스 가이드 v1.0.0
- API 도메인: `https://auth.niceid.co.kr`
- 권한 신청 전제: 이용기관 서버 Outbound IP를 NICE 담당자에게 전달하여 별도 권한 등록
- 권한 등록 후 발급: 통합인증 전용 `client_id`, `client_secret`

### 주요 엔드포인트

| 기능 | Method | URI |
|---|---|---|
| 접근 토큰 발급 | POST | `/ido/intc/v1.0/auth/token` |
| 인증 URL 요청 | POST | `/ido/intc/v1.0/auth/url` |
| 인증 결과 요청 | POST | `/ido/intc/v1.0/auth/result` |

### PCCC 검증 API와의 구분

- 기존에 발급받은 PCCC 유효성 검증용 `client_id/client_secret`과 통합인증용 인증정보는 별도다.
- PCCC 검증용 인증정보를 통합인증 API에 재사용하지 않는다.
- Geek PER 담당자에게는 NICE가 새로 발급한 **통합인증용 개발계·운영계 `client_id/client_secret`**을 보안 채널로 전달한다.
- 기존 PCCC 검증용 `client_id/client_secret`은 교체하지 않고 별도 환경변수로 계속 관리한다.
- `access_token`은 통합인증 서버가 런타임에 발급하는 24시간 토큰이므로 사람이 고정값으로 전달하지 않는다.

### `NICE KEY` 의미

- `NICE KEY`는 API 호출용 고정 인증키가 아니다.
- 회원이 휴대폰 본인확인을 완료했을 때 NICE가 회원별로 반환하도록 권한 설정하는 식별값이다.
- 자사몰은 회원별 NICE KEY를 저장하고, PCCC 간소화 요청 시 주문자 식별키로 전달한다.
- NICE는 NICE KEY를 내부에서 CI로 변환하여 관세청 요청을 수행하는 구조라고 2026-08-12 NICE 담당자가 설명했다.
- 현재 공개 통합인증 가이드의 인증 결과 표에는 `ci`, `ci2`, `di`가 기재되어 있고 `NICE KEY` 필드명은 공개되어 있지 않다. NICE KEY 적용 시 **실제 응답 필드명·길이·PCCC 간소화 요청 필드 매핑**을 NICE 담당자에게 별도로 받아야 한다.

### 보안 주의

- `client_id/client_secret`을 Git, 기획서, 채팅 로그, 화면 캡처에 저장하지 않는다.
- 개발계와 운영계를 분리하고 서버 환경변수 또는 비밀관리 저장소에 보관한다.
- 인증 결과는 `enc_data` 무결성 검증 후 AES/GCM 방식으로 복호화해야 한다. 상세 구현은 공식 가이드 원문을 따른다.

## 2. 자이언트 GGATE API V2

- Postman 문서: https://documenter.getpostman.com/view/11773234/2sBXqGrh3A#139b3cfe-ee5f-41cf-b986-190125e48891
- 내부 검증 메모: `documents/자이언트_API_메모.md`
- 운영 Base URL: `https://g-api.giantnetworkgroup.com`
- 인증: `X-Api-Key`

자이언트 API의 엔드포인트·버전·제약·오류코드 상세는 `자이언트_API_메모.md`를 참조한다. 실제 `X-Api-Key` 값은 이 문서에 기록하지 않는다.

## 3. 담당자 전달 체크리스트

NICE 통합인증 권한 등록이 끝나면 Geek 김동섭 담당자에게 아래 항목을 전달한다.

1. 개발계 통합인증 `client_id/client_secret`
2. 운영계 통합인증 `client_id/client_secret`
3. 등록 완료된 Outbound IP 목록
4. NICE KEY 반환 권한이 적용된 계정인지 여부
5. NICE KEY 실제 응답 필드명·타입·길이
6. PCCC 간소화 요청에서 NICE KEY를 넣는 정확한 필드명
7. 개발·운영 API 도메인 및 테스트 방법
8. 과금 단가·계약 적용일

전달하지 않는 값: 회원별 NICE KEY 샘플 원문, CI 원문, 운영 접근 토큰, 자이언트 `X-Api-Key`.

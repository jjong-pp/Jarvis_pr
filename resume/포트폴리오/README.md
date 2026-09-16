# PM 포트폴리오

이 폴더가 포트폴리오 파일의 단일 진입점이다. 현재 제출본은 `output/박종혁_PM_포트폴리오_v4.1.pptx`와 `.pdf`이며, 관세청 통관 연동과 산후조리원 전용 B2B 몰 두 프로젝트만 담는다. `v4`는 수정 전 복구용으로 보존한다.

## 폴더 구조

| 경로 | 용도 |
|---|---|
| `output/` | 외부 제출 가능한 현재본 |
| `source/v4/` | v4.1 생성기·증빙 이미지 준비 스크립트와 편집 원본 |
| `assets/` | 프로필 등 공개 가능한 공용 이미지 |
| `evidence/b2b/raw_private/` | 개인정보·가격이 포함된 B2B 원본 화면. 외부 제출 금지 |
| `evidence/b2b/submission_safe/` | 원본을 잘라 민감정보를 제거한 외부 제출용 평탄화 이미지 |
| `evidence/customs/submission_safe/` | 업체명을 역할명으로 치환한 실제 업무 문서 발췌 이미지 |
| `evidence/bigsee/current/` | BIGSEE 현행 참고 자료. v4 미사용 |
| `evidence/bigsee/legacy_do_not_submit/` | 폐기 정책이 섞인 과거 자료. 외부 제출 금지 |
| `archive/v1_series/` | v1~v1.2 계보 보관 |
| `archive/v3/` | BIGSEE를 포함한 v3와 전수 렌더 기록 |
| `qa/v4_1/` | v4.1 PPTX·PDF 전 페이지 렌더 검수 이미지 |
| `.build/v4_1/` | v4.1 생성 중간물과 검증 영수증 |

## 제출 안전 규칙

- B2B 원본 캡처는 포인트, 주문번호, 가격, 고객 식별값을 포함하므로 제출본에 원본 파일을 삽입하지 않는다. `submission_safe/`의 평탄화 이미지에 상태 건수까지 제거한 뒤 사용한다.
- 관세청은 실제 시스템 화면이 아니라 실제 업무 문서 발췌로 표시하며, 업체명은 역할명으로 치환한다.
- BIGSEE 자료와 v1~v3은 수정 이력 보존용이며 v4와 함께 제출하지 않는다.
- 이력·기간·수치·역할의 정본은 `../career_facts.md`다.

## 재생성

`source/v4/prepare_evidence.mjs`로 제출용 증빙 이미지를 만든 뒤 `source/v4/build_v4_1.mjs`로 PPTX를 생성한다. 출력 후 PPTX와 PDF 13쪽을 모두 렌더링하고 `qa/v4_1/`에서 시각 검수한다.

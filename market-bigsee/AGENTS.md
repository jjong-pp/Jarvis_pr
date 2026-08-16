# BIGSEE 로컬 작업 규칙

이 파일은 `C:\MyMain\market-bigsee`와 모든 하위 디렉터리에 적용됩니다.

## 시작 순서

1. `README.md`
2. 사업 배경·현재 전략·이전 판단을 이어가는 요청이면 `control/17_context_handoff.md`
3. `system/dashboard/SECTION_REGISTRY.md`에서 요청과 맞는 페이지 확인
4. 등록된 `control/` 정본 또는 담당 persona `output.md` 확인
5. 근거가 필요할 때만 해당 `state.md`, `research.md`, `reference/` 확인

전체 Markdown이나 생성된 HTML 전체를 한꺼번에 읽지 않는다.

## 파일 책임

- 루트에는 `README.md`, `AGENTS.md`, `dashboard.html`만 둔다.
- `control/`은 전사 현황 `00`, 결정 `08`, 검증 `09`, 실행 `15`, 최신 재기획 `16`, 전체 인계 `17`을 관리한다.
- `system/`은 운영 규칙과 하네스·대시보드 계약을 관리한다.
- 상세 분석은 담당 persona의 `reference/`에서 관리한다.
- 역할별 최신 상태와 결과는 각 `state.md`, `output.md`가 정본이다.
- 같은 사실을 여러 파일에 복제하지 않고 링크와 현재 결론만 사용한다.

## 페르소나 하네스

- 주 담당 하나와 필요한 검토 역할을 정한다.
- 작업 순서는 `inbox → research → state → output`이며, 의미 있는 상태 변경은 `updates` 이력에 추가한다.
- 전사 판단으로 승격할 내용만 `control/`에 반영한다.
- 역할 간 충돌은 `control/08_decision_log.md`에 올린다.
- 상세 계약은 `system/12_persona_harness.md`를 따른다.

## 연결형 대시보드

- 사람이 처음 여는 HTML은 `dashboard/index.html`이다.
- 상세 화면은 `dashboard/pages/` 아래의 상호 연결 HTML로 나눈다.
- 공통 디자인과 동작은 `dashboard/assets/`에서 관리한다.
- 현재 페이지 구조는 `전체 현황·전략·시장·제품·마케팅·재무·기술·리스크`다.
- 사업 사실은 MD에서만 수정하며 생성 HTML을 직접 고치지 않는다.
- 페이지가 길어지면 새 화면을 만들기 전에 기존 정본의 책임을 확인하고, 독립적인 의사결정 영역일 때만 `dashboard/pages/`에 추가한다.
- 생성기는 `scripts/dashboard/`에서 분리하고 진입점은 `scripts/build-dashboard.ps1` 하나로 유지한다.
- 세부 규칙은 `system/dashboard/RULES.md`를 따른다.

Markdown 변경 후 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 후 진입 페이지와 역할 페이지 7개, 공통 내비, 내부 링크, JavaScript 구문, 소스 경로·해시를 확인한다.

과거 결정과 근거를 삭제하지 않으며 코드·원가·계약·채널 견적을 확인하지 않은 추정을 확정하지 않는다.

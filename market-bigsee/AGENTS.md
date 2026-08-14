# BIGSEE 로컬 작업 규칙

이 파일은 `C:\MyMain\market-bigsee`와 모든 하위 디렉터리에 적용됩니다.

## 시작 순서

1. `README.md`
2. `system/dashboard/SECTION_REGISTRY.md`에서 요청과 맞는 태그 확인
3. 등록된 `control/` 정본 또는 담당 persona `output.md` 확인
4. 근거가 필요할 때만 해당 `state.md`, `research.md`, `reference/` 확인

전체 Markdown이나 생성된 `dashboard/index.html`을 한꺼번에 읽지 않는다.

## 파일 책임

- 루트에는 `README.md`, `AGENTS.md`, `dashboard.html`만 둔다.
- `control/`은 전사 현황 `00`, 결정 `08`, 검증 `09`, 실행 순서 `15`를 관리한다.
- `system/`은 운영 규칙과 하네스·대시보드 계약을 관리한다.
- 상세 분석은 담당 persona의 `reference/`에서 관리한다.
- 역할별 최신 상태와 결과는 각 `state.md`, `output.md`가 정본이다.
- 같은 사실을 여러 파일에 복제하지 않고 링크와 현재 결론만 사용한다.

## 페르소나 하네스

- 주 담당 하나와 필요한 검토 역할을 정한다.
- 작업 순서는 `inbox → research → state → output`이다.
- 전사 판단으로 승격할 내용만 `control/`에 반영한다.
- 역할 간 충돌은 `control/08_decision_log.md`에 올린다.
- 상세 계약은 `system/12_persona_harness.md`를 따른다.

## 단일 대시보드

- 사람이 여는 HTML은 `dashboard/index.html` 하나다.
- `지금·단계·광고·협업·결정·역할·전체`는 같은 HTML 안의 내비 태그다.
- 현재 상태와 이번 행동은 바로 표시하고 긴 표는 접기/펼치기로 둔다.
- 별도 현황 HTML이나 페이지별 메뉴를 만들지 않는다.
- HTML이 길어질 때는 `scripts/dashboard/` 안에서 생성 렌더러를 분리한다.
- 사업 사실은 MD에서만 수정하며 HTML을 직접 고치지 않는다.
- 세부 규칙은 `system/dashboard/RULES.md`를 따른다.

Markdown 변경 후 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 후 단일 HTML, 내비 태그 7개, 7단계, 광고 4채널, 협업 3구간, persona 7개, 전체 현황 표, 내부 링크, JavaScript 구문, 소스 해시를 확인한다.

과거 결정과 근거를 삭제하지 않으며 코드·원가·계약을 확인하지 않은 추정을 확정하지 않는다.

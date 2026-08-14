# BIGSEE 로컬 작업 규칙

이 파일은 `C:\MyMain\market-bigsee`와 모든 하위 디렉터리에 적용됩니다.

## 시작 순서

1. `README.md`
2. `control/00_project_status.md`
3. 필요하면 `control/15_execution_control.md`
4. `personas/registry.md`
5. 담당 역할의 `inbox.md`, `state.md`, `output.md`
6. 근거가 필요할 때만 해당 `research.md`와 `reference/` 문서

전체 Markdown이나 생성 HTML을 한꺼번에 읽지 않는다.

## 파일 책임

- 루트에는 `README.md`, `AGENTS.md`, `dashboard.html`만 둔다.
- `control/`은 전사 현황 `00`, 결정 `08`, 검증 `09`, 실행 순서 `15`를 관리한다.
- `system/`은 운영 규칙과 하네스 계약을 관리한다.
- 상세 분석은 담당 페르소나의 `reference/`에서 관리한다.
- 역할별 최신 상태와 결과는 각 `state.md`, `output.md`가 정본이다.
- 같은 사실을 여러 파일에 복제하지 않고 링크와 현재 결론만 사용한다.
- `dashboard/` HTML은 생성물이며 직접 수정하지 않는다.

## 페르소나 하네스

- 복합 과업은 주 담당 하나와 필요한 검토 역할을 정한다.
- 작업 순서는 `inbox → research → state → output`이다.
- `reference/`에는 그 역할이 장기 책임질 상세 분석만 둔다.
- 사실·가설·제안·사용자 결정을 구분한다.
- 역할 간 충돌은 임의로 합치지 않고 `control/08_decision_log.md`에 올린다.
- 상세 계약은 `system/12_persona_harness.md`를 따른다.

## 대시보드

- 기본 화면은 `dashboard/index.html`이다.
- 지금 상태와 이번 주 행동만 항상 보이고 상세는 접기/펼치기로 둔다.
- 큰 대제목과 페이지별 메뉴를 만들지 않는다.
- 긴 표와 전체 근거는 `dashboard/evidence.html`에 둔다.
- 기간이 지났다는 이유로 단계를 완료 처리하지 않는다.
- 미측정을 0으로 바꾸지 않는다.

Markdown 변경 후 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 후 7단계, 광고 4채널, 협업 3구간, 페르소나 7개, 내부 링크, JavaScript 구문, 소스 해시를 확인한다.

## 사용자 피드백

1. 입력을 사실·가설·결정·행동·아이디어로 분류한다.
2. 담당 페르소나의 작업 파일을 갱신한다.
3. 전사 상태 변화만 `control/`에 승격한다.
4. 대시보드를 다시 만들고 검증한다.

과거 결정과 근거를 삭제하지 않으며, 코드·원가·계약을 확인하지 않은 추정을 확정하지 않는다.

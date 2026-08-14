# BIGSEE 운영·대시보드 갱신 규약

## 1. 정본

- Markdown만 사업 내용의 편집 정본입니다.
- `dashboard/index.html`과 `dashboard/pages/*.html`은 읽기 전용 생성물입니다.
- HTML과 Markdown이 다르면 Markdown이 맞습니다.
- 같은 사실은 하나의 control 또는 persona reference에만 기록합니다.

## 2. 사람이 보는 화면

진입점은 `dashboard/index.html`이며 상세 화면은 같은 폴더 구조 안에서 상호 연결됩니다.

| 화면 | 내용 |
|---|---|
| 개요 | 최신 시장진입·제품 재기획과 다음 행동 |
| 타깃 | 대행사·인하우스·활성 셀러의 구매상황과 제외 대상 |
| 시장진입 | 커뮤니티·Meta 동시 시험·소재·예산·측정 |
| 제품 | 워크스페이스·SKU·콘텐츠·CRM·원가·API |
| 운영 | 이번 주 행동·현금·개발 협업·통과 조건 |
| 결정 | 채택·대체 결정과 검증 가설 |

각 화면의 경로와 정본은 `system/dashboard/SECTION_REGISTRY.md`가 관리합니다.

## 3. 토큰 절약

1. `system/dashboard/SECTION_REGISTRY.md`에서 질문과 맞는 화면을 찾습니다.
2. 그 행의 `먼저 읽을 정본` 하나만 읽습니다.
3. persona 작업은 `output.md`부터 읽고 필요할 때만 `state.md`, `research.md`, `reference/`를 읽습니다.
4. 화면 문제일 때만 생성기와 공통 CSS·JavaScript를 읽습니다.
5. 생성된 HTML 전체를 사업 판단용 컨텍스트로 읽지 않습니다.

페이지 수가 늘어도 AI가 읽는 정본 수는 늘리지 않습니다. 페이지는 사람의 탐색 단위이고 MD 등록부는 AI의 선택 로딩 단위입니다.

## 4. 사용자 피드백

1. 입력을 사실·가설·결정·행동·아이디어로 구분합니다.
2. 담당 persona의 `inbox → research → state → output`을 갱신합니다.
3. 전사 판단으로 승격할 내용만 `control/`에 반영합니다.
4. 관련 페이지 정본을 `SECTION_REGISTRY.md`에 연결합니다.
5. 대시보드를 다시 생성합니다.

## 5. 생성

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성기는 등록된 MD를 읽고 공통 내비·스타일·소스 경로·생성 시각·해시를 포함한 6개 화면을 만듭니다. 과거 단일 HTML 생성기는 진입점에서 호출하지 않습니다.

## 6. 품질 점검

- `dashboard/index.html`과 `dashboard/pages/`의 상세 5개 화면이 존재하는가
- 모든 페이지에 공통 내비 6개와 올바른 상대경로가 있는가
- 긴 구역과 표를 접기/펼치기로 탐색할 수 있는가
- 모든 페이지에 정본 경로·생성 시각·소스 해시가 있는가
- 공통 JavaScript에 구문 오류가 없는가
- `미측정`을 0으로 바꾸지 않았는가
- 대체된 결정과 과거 증거가 삭제되지 않았는가

화면이 길어지면 독립적인 판단 영역인지 먼저 확인한 뒤에만 `dashboard/pages/`에 화면을 추가하고 등록부와 생성기를 함께 갱신합니다.


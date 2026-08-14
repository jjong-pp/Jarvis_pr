# 연결형 대시보드 관리 규칙

## 구조

- 진입점은 `dashboard/index.html`이다.
- 상세 화면은 `dashboard/pages/personas.html`, `launch.html`, `product.html`, `operations.html`, `decisions.html`이다.
- 모든 화면은 같은 상단 내비와 `dashboard/assets/styles.css`, `app.js`를 사용한다.
- 별도 증거 페이지를 만들지 않는다. 근거·한계·행동은 담당 화면 안에 함께 표시한다.
- 페이지가 독립적인 의사결정 단위로 너무 길어질 때만 `dashboard/pages/`에 화면을 추가한다.

## 정본

- 사업 사실은 Markdown에서만 바꾼다.
- HTML은 읽기 전용 생성물이며 직접 편집하지 않는다.
- 각 페이지에 정본 경로·생성 시각·소스 해시를 표시한다.
- 과거 결정을 삭제하지 않고 `대체됨`과 대체 ID를 남긴다.

## 토큰 절약 로딩

1. `system/dashboard/SECTION_REGISTRY.md`에서 요청과 맞는 화면을 찾는다.
2. 해당 행의 `먼저 읽을 정본` 하나만 먼저 읽는다.
3. 역할 결론이 필요하면 그 persona의 `output.md`를 읽는다.
4. 근거나 충돌이 있을 때만 `state.md`, `research.md`, `reference/`를 추가한다.
5. 생성된 HTML 전체를 AI 작업 컨텍스트로 읽지 않는다.

## 생성 코드

| 경로 | 역할 |
|---|---|
| `scripts/build-dashboard.ps1` | 생성 진입점 |
| `scripts/dashboard/build-linked-dashboard.ps1` | MD 로딩·HTML 페이지·내비·검증 생성 |
| `dashboard/assets/styles.css` | 공통 스타일 |
| `dashboard/assets/app.js` | 현재 내비·접기/펼치기 동작 |

기존 단일 HTML 생성 스크립트는 과거 구조 호환용으로 남길 수 있으나 진입점에서 호출하지 않는다.

## 완료 조건

- 진입 페이지와 상세 5페이지가 존재한다.
- 모든 페이지에서 6개 내비 링크가 정상 상대경로를 사용한다.
- 사업 정본에만 있는 최신 핵심 결론이 화면에 반영된다.
- 긴 표와 세부 구역은 접기/펼치기를 사용할 수 있다.
- 내부 파일 링크와 외부 출처 링크가 유효한 형식이다.
- 공통 JavaScript의 구문 오류가 없다.
- 모든 페이지에 정본 경로·생성 시각·소스 해시가 있다.


# 단일 대시보드 관리 규칙

## 고정 원칙

- 사람이 여는 HTML은 `dashboard/index.html` 하나입니다.
- 별도 현황·근거·역할 HTML을 만들지 않습니다.
- 긴 내용은 같은 HTML 안에서 상단 내비 태그와 접기/펼치기로 나눕니다.
- 사업 사실은 HTML·CSS·JavaScript에 직접 기록하지 않고 Markdown 정본에서만 바꿉니다.
- 생성된 `dashboard/index.html`은 읽기 전용이며 AI 작업 컨텍스트로 전체 로딩하지 않습니다.

## 생성 코드

| 경로 | 역할 |
|---|---|
| `scripts/build-dashboard.ps1` | 전체 생성 진입점 |
| `scripts/build-dashboard-core.ps1` | control 정본의 표 데이터 준비 |
| `scripts/build-persona-dashboard.ps1` | persona state·output 취합 |
| `scripts/build-dashboard-pages.ps1` | 현재·단계·광고·협업·역할 화면 생성 |
| `scripts/dashboard/finalize-single.ps1` | 전체 현황·결정·가설·문서 지도를 같은 HTML에 합치고 별도 HTML 제거 |

생성 코드가 더 길어지면 `scripts/dashboard/` 아래에 렌더러를 추가합니다. 최종 HTML 파일을 추가하지 않습니다.

## 토큰 절약 로딩

1. 먼저 `system/dashboard/SECTION_REGISTRY.md`에서 질문과 맞는 태그를 찾습니다.
2. 해당 행에 적힌 Markdown만 읽습니다.
3. 페르소나 질문이면 그 역할의 `output.md`를 먼저 읽고 근거가 필요할 때만 `state.md`, `research.md`, `reference/`를 읽습니다.
4. 화면 오류일 때만 관련 생성 스크립트와 CSS·JavaScript를 읽습니다.
5. 생성된 `dashboard/index.html` 전체를 사업 판단용으로 읽지 않습니다.

## 변경 완료 조건

- `dashboard/index.html`만 존재
- 상단 태그 7개: 지금·단계·광고·협업·결정·역할·전체
- 전체 현황·영역·90일·지표·리스크·행동·결정·가설·문서 지도 포함
- 별도 `evidence.html` 및 해당 링크·문구 없음
- 모든 Markdown·HTML 내부 링크 정상
- 소스 해시에 `.history`를 제외한 Markdown 포함

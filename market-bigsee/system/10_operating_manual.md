# 마켓빅시 운영·대시보드 갱신 규약

## 1. 정본

- Markdown만 사업 내용의 편집 정본입니다.
- `dashboard/index.html`은 읽기 전용 생성물입니다.
- HTML과 Markdown이 다르면 Markdown이 맞습니다.
- 같은 사실은 하나의 control 또는 persona reference에만 기록합니다.

## 2. 사람이 보는 화면

사람이 여는 화면은 `dashboard/index.html` 하나입니다.

| 태그 | 내용 |
|---|---|
| 지금 | 현재 단계와 이번 행동 |
| 단계 | 0~6단계·통과·중단 조건 |
| 광고 | 채널 순서와 개인→B2B 흐름 |
| 협업 | 15%·90일 시험·조건 승급·제안문 |
| 결정 | 사용자 결정 대기 |
| 역할 | 7개 persona의 최신 출력 |
| 전체 | 전사 현황·지표·리스크·결정·가설·문서 지도 |

태그는 모두 같은 HTML 안의 위치를 엽니다.

## 3. 토큰 절약

1. `system/dashboard/SECTION_REGISTRY.md`에서 질문과 맞는 태그를 찾습니다.
2. 그 행에 적힌 Markdown만 읽습니다.
3. persona 작업은 `output.md`부터 읽고 필요할 때만 `state.md`, `research.md`, `reference/`를 읽습니다.
4. 화면 문제일 때만 관련 생성 스크립트와 CSS·JavaScript를 읽습니다.
5. 생성된 `index.html` 전체를 사업 판단용 컨텍스트로 읽지 않습니다.

## 4. 사용자 피드백

1. 입력을 사실·가설·결정·행동·아이디어로 구분합니다.
2. 담당 persona의 `inbox → research → state → output`을 갱신합니다.
3. 전사 판단으로 승격할 내용만 `control/`에 반영합니다.
4. 대시보드를 다시 생성합니다.

## 5. 생성

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 순서:

1. control 표 데이터를 준비합니다.
2. persona `state.md`, `output.md`를 취합합니다.
3. 현재·단계·광고·협업·결정·역할 구역을 만듭니다.
4. `scripts/dashboard/finalize-single.ps1`이 전사 현황·지표·리스크·가설·문서 지도를 같은 HTML에 합칩니다.
5. 최종 `dashboard/index.html` 하나만 남깁니다.

## 6. 품질 점검

- `dashboard/`에 HTML이 `index.html` 하나뿐인가
- 내비 태그 7개가 같은 HTML의 실제 ID로 연결되는가
- 7단계, 광고 4채널, 협업 3구간, persona 7개가 출력되는가
- 전체 구역에 현황·영역·90일·지표·리스크·행동·결정·가설·문서 지도가 있는가
- 모든 내부 링크가 실제 파일로 연결되는가
- `미측정`을 0으로 바꾸지 않았는가
- 생성 해시에 `.history`를 제외한 Markdown이 포함되는가

과거 결정과 증거를 삭제하지 않으며 화면이 길어지면 HTML 페이지가 아니라 `scripts/dashboard/` 생성 모듈을 나눕니다.

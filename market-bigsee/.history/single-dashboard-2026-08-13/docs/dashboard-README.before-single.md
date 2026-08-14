# BIGSEE 대시보드 출력 폴더

| 파일 | 역할 |
|---|---|
| `index.html` | 현재 상태와 이번 행동을 표시하고 단계·광고·협업·결정·역할을 접기/펼치기로 통합 |
| `evidence.html` | 기존의 긴 상세 대시보드와 근거 표 |

HTML은 직접 편집하지 않습니다. `../control/`, `../system/`, `../personas/`의 Markdown을 수정하고 루트에서 재생성합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

`styles.css`와 `app.js`에는 화면 표현과 상호작용만 두며 사업 사실은 기록하지 않습니다.

# BIGSEE 단일 대시보드 출력

| 파일 | 역할 |
|---|---|
| `index.html` | 모든 사업 현황을 내비 태그와 접기/펼치기로 합친 유일한 HTML |
| `styles.css`, `unified.css` | 기본 화면과 전체 표 스타일 |
| `app.js`, `unified.js` | 복사·전체 접기·내비 태그 동작 |

사업 내용은 `../control/`, `../system/`, `../personas/`의 Markdown에서 관리합니다. HTML이 길어져도 다른 HTML을 추가하지 않고 `../scripts/dashboard/`의 생성 로직을 분리합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

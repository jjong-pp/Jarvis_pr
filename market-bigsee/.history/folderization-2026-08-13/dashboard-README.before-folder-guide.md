# BIGSEE 대시보드 출력 폴더

이 폴더는 현재 행동과 상세 내용을 한 화면에 합친 HTML 대시보드입니다.

| 파일 | 역할 |
|---|---|
| `index.html` | 지금 상태와 이번 주 행동을 바로 표시하고 단계·광고·협업·결정·역할은 접기/펼치기로 통합 |
| `evidence.html` | 기존의 긴 상세 대시보드와 근거 표 |

HTML은 직접 편집하지 않습니다. 데이터는 `../control/15_execution_control.md`와 기존 루트·페르소나 Markdown을 수정하고 다음 명령으로 재생성합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

`styles.css`와 `app.js`는 통합 화면의 표현·상호작용 자산입니다. 사업 사실은 이 파일들에 기록하지 않습니다. 별도 단계·광고·협업·역할 HTML을 만들지 않습니다.


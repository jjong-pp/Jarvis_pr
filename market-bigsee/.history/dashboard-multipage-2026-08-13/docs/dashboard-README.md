# BIGSEE 대시보드 출력 폴더

이 폴더는 사람이 보기 쉬운 페이지별 HTML 대시보드입니다.

| 페이지 | 역할 |
|---|---|
| `index.html` | 지금 상태와 이번 주 행동 |
| `stages.html` | 0~6단계 실행 순서와 통과 기준 |
| `growth.html` | 네이버·Google·Meta·TikTok 광고와 B2B 전환 |
| `partnership.html` | 15% 제안과 단계별 협업 조건 |
| `roles.html` | 7개 페르소나의 현재 판단 |
| `evidence.html` | 기존의 긴 상세 대시보드와 근거 표 |

HTML은 직접 편집하지 않습니다. 데이터는 `15_execution_control.md`와 기존 루트·페르소나 Markdown을 수정하고 다음 명령으로 재생성합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

`styles.css`와 `app.js`는 페이지 공통 화면·상호작용 자산입니다. 사업 사실은 이 파일들에 기록하지 않습니다.

# BIGSEE 연결형 대시보드

`index.html`은 진입 화면이고 `pages/`에는 타깃·시장진입·제품·운영·결정 화면이 있습니다. 모든 화면은 `assets/`의 공통 스타일과 동작을 사용합니다.

이 폴더의 HTML은 Markdown 정본에서 자동 생성되는 읽기 전용 결과물입니다. 내용을 직접 수정하지 말고 `system/dashboard/SECTION_REGISTRY.md`에서 담당 정본을 찾아 수정한 뒤 아래 명령을 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

과거 단일 화면에서 사용하던 미사용 자산은 `.history/single-page-assets/`에 보존했습니다.


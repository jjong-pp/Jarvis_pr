# SCM 포트폴리오 화면 시연

- 기준: 2026-10-08 `C:\MyMain\Eibe\SCM-Dashboard`의 v1 `app/`·`web/` 복제본. 원본 수정 없음. 아래에 적은 재고 화면 초기화 결함만 격리본에서 보정.
- 실행: `C:\MyMain\Eibe\SCM-Dashboard\venv\Scripts\python.exe run_demo.py`
- URL: http://127.0.0.1:8765/login
- 합성 시연 전용 계정: `portfolio` / `PortfolioSample26!`
- 데이터: 6개 샘플 SKU, 3개 샘플 창고, 18개 재고 로트, 16주 판매·출고 합성 이력. 수치와 상품·창고명은 실제 운영자료가 아님.
- DB: 이 폴더의 `data/portfolio_sample.db`. 원본 운영 DB를 읽거나 복사하지 않음. 백업도 이 폴더 내부에만 생성.
- 캡처 라벨: **실제 구현 화면 · 합성 데이터 시연**
- 추천 화면: `/inventory`(Excel 업로드 및 창고·유통기한별 현재고), `/expiry`(창고 필터 및 기한별 조회), `/order-plan`(담당자 입력 가정에 따른 시나리오).
- 주의: `/`의 일부 차트는 앱 자체에 내장된 샘플 그래프다. 운영 실측이나 실제 집계 결과로 제시하지 않음.
- 정지: 실행 콘솔에서 Ctrl+C. 이번 실행은 도구 세션 93331, Python PID 36732.
- 검증: `/api/inventory/summary`, `/api/expiry/summary`, `/api/order-plan/simulation`, `/api/sales`, `/api/outflow`가 정상 응답.

## 구현 경계

1. Excel 업로드와 DB 저장 기반이며 OMS 원천 자동 수집을 입증하지 않는다.
2. 판매 실적과 재고 감소를 위한 출고 이력은 별도 모델이다.
3. 창고와 유통기한별 조회 화면은 실제 앱에서 동작한다.
4. 가중치와 수량 입력은 담당자 가정에 따른 검토이며 AI 자동 발주 승인 기능이 아니다.
5. 샘플 실행은 UI·계산 경로만 증명한다. 현업 기간·오류 건수·시간 절감은 사용자 경력 자료가 근거다.

## 시연용 초기화 보정

- `web/inventory.html`: 데이터 로드 전 빈 배열을 초기값으로 두고 창고 필터를 기다린 후 표와 KPI 렌더링.
- 같은 파일: checkbox의 문자열 창고 ID와 응답의 숫자 창고 ID를 문자열로 맞춰 KPI 집계.
- 같은 파일: API 응답을 화면 행으로 바꿀 때 빠진 `product_code` 속성 복원.
- 기능·디자인 추가 없음. 원본 UI의 기존 데이터를 제대로 바인딩하기 위한 격리본 수정.
- `/order-plan`의 품목 선택 드롭다운은 원래 하드코딩 값이므로 `전체 품목(요약)` 상태만 캡처. 표와 히트맵은 API의 합성 시연 자료.

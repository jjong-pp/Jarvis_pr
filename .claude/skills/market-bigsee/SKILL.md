---
name: market-bigsee
description: 마켓빅시 BIGSEE 사업 기획·전략 프로젝트. 7개 페르소나 하네스(전략CEO·고객시장·제품성장·영업마케팅·재무가격·기술데이터·리스크운영), control/ 정본 6종, 연결형 HTML 대시보드 빌드 파이프라인. BIGSEE, 마켓빅시, 페르소나, 대행사, 사업성, 퍼널, 대시보드 빌드, build-dashboard, SECTION_REGISTRY, decision_log 관련 작업에 로드한다.
---

> 모드: 기획 · 정본: market-bigsee/README.md · 상태: project_state.md#마켓빅시 BIGSEE
> 마감: 없음 · 패턴: 페르소나형 · 갱신: 2026-08-15

## 한 줄 정의

마켓빅시 BIGSEE의 서비스·사업성 분석과 대행사 우선 판매·경영 전략 기획. 저장소 파일의 다수(129개)를 차지하며 **자체 하네스를 갖는다** — 루트 4계층과 별개로 페르소나 기반 작업 흐름을 쓴다. 이 스킬은 그 하네스를 루트 체계에 등록하는 2층 계약이다.

## 절대 규칙

1. **로컬 계약이 우선한다.** 이 폴더의 작업 규칙 정본은 `market-bigsee/AGENTS.md`이고 상세 계약은 `system/12_persona_harness.md`·`system/dashboard/RULES.md`다. 루트 `AGENTS.md`(헌법)와 충돌하면 헌법이 이기지만, 작업 방식은 로컬을 따른다.
2. Claude Code는 `AGENTS.md`를 자동으로 읽지 않는다. **`market-bigsee/CLAUDE.md`가 `@AGENTS.md`로 임포트하므로 이 폴더 파일을 읽으면 자동 로드된다** (2026-08-15 추가 — 종전에는 "먼저 읽어라"는 문장에만 의존했다). 단 하위 `CLAUDE.md`는 컴팩션에서 유실되므로, 긴 세션에서는 이 스킬이 재주입 담당이다.
3. **전체 Markdown이나 생성된 HTML 전체를 한꺼번에 읽지 않는다.**
4. **사업 사실은 MD에서만 수정하며 생성 HTML을 직접 고치지 않는다.**
5. **과거 결정과 근거를 삭제하지 않으며, 코드·원가·계약·채널 견적을 확인하지 않은 추정을 확정하지 않는다.**

## 확정 사실

### 시작 순서 (출처: `market-bigsee/AGENTS.md`)

1. `README.md`
2. 사업 배경·현재 전략·이전 판단을 이어가는 요청이면 `control/17_context_handoff.md`
3. `system/dashboard/SECTION_REGISTRY.md`에서 요청과 맞는 페이지 확인
4. 등록된 `control/` 정본 또는 담당 persona `output.md` 확인
5. 근거가 필요할 때만 해당 `state.md`, `research.md`, `reference/` 확인

### 페르소나 하네스

- 페르소나 7종: `01_strategy_ceo` · `02_customer_market` · `03_product_growth` · `04_sales_marketing` · `05_finance_pricing` · `06_technology_data` · `07_risk_operations`
- 각 페르소나 폴더 구조: `inbox.md` → `research.md` → `state.md` → `output.md` (+ `reference/`)
- 주 담당 하나와 필요한 검토 역할을 정한다. 작업 순서는 `inbox → research → state → output`.
- 전사 판단으로 승격할 내용만 `control/`에 반영한다. 역할 간 충돌은 `control/08_decision_log.md`에 올린다.
- **역할별 최신 상태와 결과는 각 `state.md`, `output.md`가 정본이다.** 같은 사실을 여러 파일에 복제하지 않고 링크와 현재 결론만 사용한다.

### 파일 책임

- 루트에는 `README.md`, `AGENTS.md`, `dashboard.html`만 둔다.
- `control/`은 전사 현황 `00`, 결정 `08`, 검증 `09`, 실행 `15`, 최신 재기획 `16`, 전체 인계 `17`을 관리한다.
- `system/`은 운영 규칙과 하네스·대시보드 계약을 관리한다.
- 상세 분석은 담당 persona의 `reference/`에서 관리한다.

### 연결형 대시보드

- 사람이 처음 여는 HTML은 `dashboard/index.html`. 상세 화면은 `dashboard/pages/` 아래 상호 연결 HTML.
- 공통 디자인·동작은 `dashboard/assets/`. 현재 페이지 구조는 `개요·타깃·시장진입·제품·운영·결정`.
- 페이지가 길어지면 새 화면을 만들기 전에 기존 정본의 책임을 확인하고, 독립적인 의사결정 영역일 때만 추가한다.
- 생성기는 `scripts/dashboard/`에서 분리하고 진입점은 `scripts/build-dashboard.ps1` 하나로 유지한다.

Markdown 변경 후 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 후 진입 페이지, 연결 페이지 6개, 공통 내비, 내부 링크, JavaScript 구문, 소스 경로·해시를 확인한다.

### 제품 방향 (출처: `project_state.md` 2026-08-13)

`시장 조사 → 콘텐츠 기획·초안 → SKU·캠페인 연결 → 유입·구매 측정 → 다음 실행 추천`.
블로그 기능은 범용 자동 작문이 아니라 조사 근거·사람 승인·SKU·매출 추적을 결합하고, **허위 리뷰 생성은 제외한다.**

## 함정

- **이 폴더의 운영 규칙이 Claude 세션에서 오랫동안 로드되지 않았다.** `AGENTS.md`는 Codex 계열 규약이고 Claude Code는 자동으로 읽지 않는다. 이 스킬이 그 간극을 메우기 위해 존재한다 (2026-08-15 확인).

## 파일 지도

`README.md` 정본 시작점 · `AGENTS.md` 로컬 작업 규칙 · `control/00_project_status.md`·`08_decision_log.md`·`09_validation_board.md`·`15_execution_control.md`·`16_replanning_brief.md`·`17_context_handoff.md` 전사 정본 6종 · `system/10_operating_manual.md`·`11_operating_system_research.md`·`12_persona_harness.md` 운영 계약 · `system/dashboard/RULES.md`·`SECTION_REGISTRY.md` 대시보드 계약 · `personas/0n_*/` 페르소나 7종 · `dashboard/` 생성물 · `scripts/build-dashboard.ps1` 빌드 진입점

## 지침 로그

- [2026-08-15] 신규 등록. 종전에는 루트 룰 체계 밖에 있어 Claude 세션에서 운영 규칙이 로드되지 않았다.

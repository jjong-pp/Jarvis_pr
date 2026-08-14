# 마켓빅시 사업·제품 운영 저장소

기준일: 2026-08-13

이 폴더는 마켓빅시의 사업 현황, 판매 전략, 제품·기술 기획, 역할별 탐색 결과를 다음 로컬 환경에서도 이어가기 위한 Markdown 정본입니다.

## 바로 시작하기

- 사람이 보는 통합 현재판: [dashboard/index.html](dashboard/index.html)
- 단계·광고·협업·결정·역할 상세: 위 통합 현재판의 접기/펼치기
- 기존의 긴 표와 근거: [dashboard/evidence.html](dashboard/evidence.html)
- 모든 새 작업의 첫 정본: [control/00_project_status.md](control/00_project_status.md)
- 실행 통제 정본: [control/15_execution_control.md](control/15_execution_control.md)
- 자동 에이전트 규칙: [AGENTS.md](AGENTS.md)

`dashboard/` 아래 HTML과 진입용 `dashboard.html`은 Markdown에서 자동 생성되는 읽기 전용 화면입니다. HTML을 직접 수정하지 않습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

## 지금 이해해야 할 한 문장

> 현재는 광고를 크게 집행하는 단계가 아니라, 개발 총괄과 협업 조건을 글로 정하고 제품·원가·사용자 행동을 측정할 수 있는지 확인하는 0단계입니다.

상세 실행 순서와 다음 단계 완료 기준은 `control/15_execution_control.md` 한 파일에서 관리합니다.

## 핵심 제품 방향

> 시장 조사 → 콘텐츠 기획·초안 → SKU·캠페인 연결 → 유입·구매 측정 → 다음 실행 추천

첫 시장 가설은 2~20인 이커머스 대행사입니다. 개인 고객은 일반 소비자가 아니라 1인 셀러·프리랜서 마케터 같은 업무형 개인으로 정의하고, 반복 사용 신호가 있는 개인을 팀·대행사 계약으로 확장합니다.

## 다음 로컬의 기본 로딩

1. `README.md`
2. `control/00_project_status.md`
3. 현황·단계 질문이면 `control/15_execution_control.md`
4. `personas/registry.md`
5. 질문과 관련된 페르소나의 `output.md`
6. 필요할 때만 해당 `state.md`, `research.md`, 상세 루트 문서 1~2개

AI는 전체 Markdown이나 생성된 HTML을 기본 컨텍스트로 한꺼번에 읽지 않습니다.

## 루트 정본 지도

| 문서 | 역할 |
|---|---|
| `control/00_project_status.md` | 전체 사업 현재 상태 |
| `01~07` | 서비스·판매·시장·제품·기술·경쟁 상세 근거 |
| `control/08_decision_log.md` | 확정·제안·대체된 결정 |
| `control/09_validation_board.md` | 가설·시험·증거·통과 기준 |
| `system/10_operating_manual.md` | 정본·피드백·빌드 규칙 |
| `system/11_operating_system_research.md` | 운영 체계 전문 근거 |
| `system/12_persona_harness.md` | 역할별 입력·탐색·상태·출력 계약 |
| `personas/04_sales_marketing/reference/13_it_saas_gtm_paid_acquisition.md` | IT·SaaS 광고와 개인→B2B 전략 |
| `personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md` | 15% 보상과 파트너십 협상 |
| `control/15_execution_control.md` | 단계·이번 주 행동·광고 순서·협업 승급 |

## 페르소나 작업 공간

`personas/` 아래에는 전략, 고객, 제품, 세일즈, 재무, 기술, 리스크의 7개 역할이 있습니다. 각 역할은 다음 계약을 유지합니다.

```text
inbox.md → research.md → state.md → output.md
```

대시보드는 각 역할의 `state.md`와 `output.md`만 취합합니다.

## 사용자 피드백 반영

1. 사용자가 `dashboard/index.html`에서 현재 행동을 보고 필요한 상세만 펼칩니다.
2. 새 입력을 사실·가설·결정·행동·아이디어로 분류합니다.
3. 주 담당 페르소나의 작업 파일을 갱신합니다.
4. 전사 상태가 바뀌면 루트 정본과 `control/15_execution_control.md`를 갱신합니다.
5. 대시보드를 재생성하고 접기 항목·링크·해시를 검증합니다.

기존 전체 분석 원본은 `C:\MyMain\market-bigsee-service-business-analysis-2026-08-12.md`에 보존돼 있습니다.


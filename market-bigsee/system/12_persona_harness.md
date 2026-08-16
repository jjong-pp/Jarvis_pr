# BIGSEE 페르소나 하네스 규약

기준일: 2026-08-16

## 목적

전략·고객·제품·판매·재무·기술·리스크 판단을 역할별로 분리해 책임·근거·차단 요인을 추적합니다. 다음 로컬은 전체 파일을 읽지 않고 인계 정본과 관련 역할만 선택해서 읽습니다.

## 전체 흐름

```text
사용자 피드백·새 사실
        ↓
control/17_context_handoff.md와 SECTION_REGISTRY로 라우팅
        ↓
담당 persona inbox.md
        ↓
탐색·검증 → research.md / 상세 정리 → reference/
        ↓
현재 상태 → state.md / 최신 결론 → output.md
        ↓
전사 결론만 control/00·08·09·15·16·17로 승격
        ↓
scripts/build-dashboard.ps1 → dashboard/index.html + pages/
```

## 폴더 계약

각 `personas/<persona>/`는 다음을 유지합니다.

| 파일 | 역할 |
|---|---|
| `inbox.md` | 사용자 요청·다른 역할 전달·대기 과업 |
| `research.md` | 탐색 경로·출처·증거·반증 누적 |
| `state.md` | 지금 하는 일·초점·차단·다음 행동 |
| `output.md` | 현재 결론·한계·추천·정본 링크 |
| `updates.md` | 날짜별 상태 보고·완료·결과·다음 단계의 누적 이력 |
| `reference/` | 해당 역할이 책임지는 상세 분석 정본 |

`state.md`와 `output.md`는 최신 상태만 유지합니다. 의미 있는 주간 보고나 상태 변경은 `updates.md`에 추가하고, 과거 근거와 분석은 `research.md`·`reference/`에서 삭제하지 않고 대체 관계를 표시합니다.

대시보드 생성기는 이 구조를 바꾸지 않고 문서·표의 ID를 통합 레코드로 정규화합니다. 질문지·설계·과업·예정·결정·결과·이력의 조회 계약과 신규 문서 메타데이터는 `system/data/RECORD_SCHEMA.md`가 정본입니다.

## 역할 라우팅

| 질문·변경 | 주 담당 | 검토 역할 |
|---|---|---|
| ICP·포지셔닝·사업 우선순위·파트너십 | STR | MKT, FIN, RSK |
| 고객 문제·경쟁·커뮤니티·인터뷰 | MKT | STR, SAL |
| 기능·사용 흐름·활성화·제품 실험 | PRD | TEC, MKT |
| 리드·콘텐츠·제안·광고·판매 채널 | SAL | MKT, PRD, FIN |
| 원가·가격·마진·현금·비용 계단 | FIN | TEC, STR |
| 코드·계측·API·인프라·권한·확장성 | TEC | PRD, FIN |
| 개인정보·약관·환불·AI 품질·운영 통제 | RSK | TEC, STR, SAL |

복합 입력도 주 담당 하나를 정하고 다른 역할은 검토자로 둡니다. 같은 사실의 정본을 여러 폴더에 복제하지 않습니다.

## 입력·출력 계약

새 과업은 `inbox.md`에 과업 ID, 날짜, 질문, 완료 기준, 관련 정본, 데이터·권한 제약을 기록합니다.

`state.md`에는 최소한 persona ID, 상태, 현재 과업 ID, 현재 과업, 초점, 차단 요인, 다음 행동, 목표일, 현재 정본, 마지막 갱신을 둡니다.

`output.md`에는 현재 결론, 가장 큰 한계, 다음 제안, 마지막 갱신, 정본 링크가 드러나야 합니다. 질문에 따라 시장진입·예산·P0·파트너십 같은 역할별 필드를 추가할 수 있습니다. `updates.md`에는 날짜, 과업 ID, 상태, 완료·변경, 결과, 다음 단계, 근거를 추가합니다. 알 수 없는 값은 삭제하거나 0으로 만들지 않고 `미측정`, `미정` 또는 `입력 대기`로 둡니다.

## 정본 승격

- 전체 배경·변경 이유는 `control/17_context_handoff.md`에 반영합니다.
- 최신 짧은 전략은 `control/16_replanning_brief.md`에 반영합니다.
- 현재 단계·리스크는 `control/00_project_status.md`에 반영합니다.
- 확정·대체 결정은 `control/08_decision_log.md`에 기록합니다.
- 가설·실험·증거는 `control/09_validation_board.md`에 기록합니다.
- 30일 행동과 통과 조건은 `control/15_execution_control.md`에 반영합니다.
- 상세 근거는 담당 persona의 `reference/` 하나에 유지합니다.

## 충돌·실패

- 역할 간 제안이 충돌하면 각각의 근거와 비용을 남기고 D/Q 항목으로 승격합니다.
- 최신성이 필요한 외부 사실은 확인 전 확정하지 않습니다.
- 코드·청구·계약이 없는 원가·공수·용량 추정은 가설로 표시합니다.
- 오래된 문서는 삭제하지 않고 최신 정본과 대체 이유를 인계 문서에 기록합니다.
- HTML에서만 만들어진 사실은 무효입니다.

## 토큰 로딩

총괄 요청은 다음 순서로 읽습니다.

1. `README.md`
2. `control/17_context_handoff.md`
3. `system/dashboard/SECTION_REGISTRY.md`
4. 요청과 맞는 control/reference 하나
5. 담당 persona `output.md`
6. 필요할 때만 `state.md`, `research.md`, 추가 reference

개별 역할 과업은 `personas/START_HERE.md → 자신의 state.md·output.md → 관련 정본 1~2개 → 필요한 research 범위` 순서로 읽습니다.

생성 HTML은 사업 정본으로 읽지 않습니다.

## 대시보드

- 연결형 대시보드는 control과 주요 reference 정본을 읽기 쉽게 표현합니다.
- persona output은 다음 로컬의 짧은 역할 인계이며, 전체 현황 화면은 비교에 필요한 현재 작업·결론·다음 행동·갱신일만 요약합니다.
- 각 역할의 `전체 자료`는 그 역할의 질문지·설계·과업·결과·조사·이력을 검색하고 생성형 상세 화면으로 연결합니다.
- 페이지와 소스 라우팅은 `system/dashboard/SECTION_REGISTRY.md`가 관리합니다.
- 생성 페이지는 결론을 새로 계산하지 않습니다.

## 완료 정의

1. 질문과 완료 기준에 답했습니다.
2. 사실·가설·결정·과거안이 구분되었습니다.
3. 가장 큰 한계와 다음 행동이 있습니다.
4. 관련 persona의 `state.md`·`output.md`가 최신입니다.
5. 필요한 control 정본과 인계 문서를 갱신했습니다.
6. 대시보드를 재생성하고 링크·내비·JavaScript·UTF-8을 검증했습니다.


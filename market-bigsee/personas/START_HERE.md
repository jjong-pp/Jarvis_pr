# 페르소나 작업 시작 안내

전체 규약은 [../system/12_persona_harness.md](../system/12_persona_harness.md), 역할 목록은 [registry.md](registry.md)를 기준으로 합니다.

## 실행 순서

1. 사업 맥락이 필요한 과업이면 `../control/17_context_handoff.md`를 읽습니다.
2. 등록부에서 주 담당과 검토 역할을 정합니다.
3. 주 담당 `inbox.md`에 과업 ID·질문·완료 기준을 추가합니다.
4. 해당 역할의 현재 정본 1~2개만 읽고 `research.md`에 근거를 기록합니다.
5. `state.md`를 최신화하고 `output.md`에 최신 결과를 씁니다.
6. 주간 보고나 의미 있는 상태 변경이면 `updates.md`에 날짜별 결과를 추가합니다.
7. 전사 판단으로 승격할 결론만 `control/` 정본과 필요할 때 전체 인계에 반영합니다.
8. 루트에서 `scripts/build-dashboard.ps1`을 실행합니다.
9. 전체 자료 검색과 상세 화면에서 새 과업·결과·근거가 조회되는지 확인합니다.

```text
inbox.md → research.md → state.md → output.md → updates.md
                    reference/ ↑
```

과거 근거는 삭제하지 않고 대체 날짜와 새 근거를 남깁니다.

독립 질문지·설계 문서에 구조화 메타데이터가 필요하면 [../system/data/RECORD_SCHEMA.md](../system/data/RECORD_SCHEMA.md)를 따릅니다.

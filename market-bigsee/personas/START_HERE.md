# 페르소나 작업 시작 안내

전체 규약은 [../system/12_persona_harness.md](../system/12_persona_harness.md), 역할 목록은 [registry.md](registry.md)를 기준으로 합니다.

## 실행 순서

1. 등록부에서 주 담당과 검토 역할을 정합니다.
2. 주 담당 `inbox.md`에 과업 ID·질문·완료 기준을 추가합니다.
3. 해당 역할의 `reference/`와 필요한 `control/` 정본 1~2개만 읽고 `research.md`에 근거를 기록합니다.
4. `state.md`를 최신화하고 `output.md`에 표준 결과를 씁니다.
5. 전사 판단으로 승격할 결론만 `control/` 정본에 반영합니다.
6. 루트에서 `scripts/build-dashboard.ps1`을 실행합니다.

```text
inbox.md → research.md → state.md → output.md
                    reference/ ↑
```

과거 근거는 삭제하지 않고 대체 날짜와 새 근거를 남깁니다.

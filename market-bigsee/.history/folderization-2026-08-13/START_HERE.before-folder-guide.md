# 페르소나 작업 시작 안내

전체 규약은 [../system/12_persona_harness.md](../system/12_persona_harness.md), 역할 목록은 [registry.md](registry.md)를 기준으로 합니다.

## 실행 순서

1. 등록부에서 주 담당과 검토 역할을 정합니다.
2. 주 담당 `inbox.md`에 과업 ID·질문·완료 기준을 추가합니다.
3. 필요한 루트 정본 1~2개만 읽고 `research.md`에 근거를 기록합니다.
4. `state.md`를 최신화하고 `output.md`에 표준 결과를 씁니다.
5. 필요한 결론만 루트 정본으로 승격합니다.
6. 루트에서 `scripts/build-dashboard.ps1`을 실행합니다.

## 고정 파일 계약

```text
inbox.md     입력과 과업 대장
state.md     현재 진행·차단·다음 행동
research.md  탐색 경로와 증거 이력
output.md    대시보드에 취합할 최신 합성 결과
```

파일명과 표 제목은 빌드 계약이므로 바꾸지 않습니다. 과거 근거는 삭제하지 않고 대체 날짜와 새 근거를 남깁니다.


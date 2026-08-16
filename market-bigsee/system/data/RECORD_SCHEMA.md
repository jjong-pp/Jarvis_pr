<!-- bigsee-record
{
  "schema_version": "1.0",
  "id": "SYS-DATA-001",
  "type": "design",
  "role": "ALL",
  "status": "채택",
  "priority": "P0",
  "created_at": "2026-08-16",
  "updated_at": "2026-08-16",
  "related_ids": ["D-016", "STR-005", "PRD-002", "TEC-003"]
}
-->

# BIGSEE 로컬 데이터·레코드 규격

기준일: 2026-08-16  
목적: Git으로 여러 로컬을 오가면서 문서·과업·질문·결정·예정·결과·이력을 유실 없이 조회한다.

## 1. 운영 구조

```text
Markdown 정본
  control/ + personas/ + system/
        ↓ scripts/build-dashboard.ps1
통합 카탈로그
  dashboard/data/catalog.js + manifest.json
        ↓
전체 현황·7개 역할 화면 + dashboard/records/*.html
```

- 실행 중인 서버나 외부 데이터베이스가 필요하지 않다.
- `dashboard/index.html`을 직접 열어도 검색·필터·상세 조회가 작동한다.
- HTML·JavaScript·JSON은 생성물이다. 사실 수정은 Markdown 정본에서만 한다.
- 생성물은 정본이 손상돼도 다시 만들 수 있어야 한다.

## 2. 확장자 책임

| 확장자 | 책임 | Git 정본 여부 |
|---|---|---|
| `.md` | 사람이 편집하는 현재 상태·과업·질문지·설계·결정·근거·이력 | 정본 |
| `.jsonl` | 자동 수집 이벤트가 수백 건 이상으로 늘 때 월·역할 단위 추가 전용 로그 | 조건부 정본 |
| `.js` | `file://` 환경에서도 읽을 수 있는 통합 검색 카탈로그 | 생성물 |
| `.json` | 생성 건수·유형·역할별 검증 명세 | 생성물 |
| `.html` | 전체·역할·자료 상세 화면 | 생성물 |
| `.sqlite` | 필요할 때 로컬 분석용으로 재생성하는 캐시 | 정본 금지·Git 제외 |

현재 업무 이력은 사람이 검토하는 `updates.md` 규모이므로 `.jsonl`로 중복 저장하지 않는다. 외부 이벤트·사용량처럼 한 달 수백 건을 넘고 자동 추가만 필요한 데이터가 생길 때 `.jsonl`을 도입한다.

## 3. 현재 파일의 레코드 매핑

| 원본 | 레코드 |
|---|---|
| `personas/*/inbox.md` | 과업 대장 + 각 ID별 과업 |
| `personas/*/updates.md` | 이력 대장 + 각 행별 업무 이력 |
| `personas/*/state.md` | 역할별 현재 상태 |
| `personas/*/output.md` | 역할별 현재 판단 |
| `personas/*/research.md`, `reference/*.md` | 조사·질문지·설계·리스크·상세 문서 |
| `control/08_decision_log.md` | 결정·제안 |
| `control/09_validation_board.md` | 가설 |
| `control/00_project_status.md` | 지표·리스크·결정 대기·예정 내역 |
| `control/15_execution_control.md` | 실행 단계·예정 내역 |

생성기는 기존 표를 분해해 개별 레코드로 만든다. 따라서 과거 문서를 대량 이동하거나 복제하지 않고도 현재 데이터를 한곳에서 찾을 수 있다.

## 4. 신규 독립 문서 메타데이터

기존 문서는 호환 변환할 수 있지만, 2026-08-16 이후 새 질문지·설계·결정 근거처럼 독립적으로 추적할 문서는 맨 위에 JSON 메타데이터를 반드시 둔다. PowerShell 5.1에서 별도 YAML 모듈 없이 검증하기 위한 형식이다.

```html
<!-- bigsee-record
{
  "schema_version": "1.0",
  "id": "TEC-004",
  "type": "questionnaire",
  "role": "TEC",
  "status": "진행",
  "priority": "P0",
  "created_at": "2026-08-16",
  "updated_at": "2026-08-16",
  "due_at": null,
  "related_ids": ["Q-004"]
}
-->
```

필수 필드는 `id`, `type`, `role`, `status`, `updated_at`이다. 날짜는 `YYYY-MM-DD`, 관계는 기존 과업·결정·질문 ID를 사용한다. 메타데이터가 없는 기존 문서는 경로 해시로 안정적인 문서 ID를 부여한다.

## 5. 자료 유형

`task`, `update`, `decision`, `question`, `risk`, `metric`, `hypothesis`, `plan`, `questionnaire`, `design`, `status`, `result`, `research`, `document`를 사용한다. 같은 사실을 여러 유형의 Markdown에 복제하지 않는다.

관계의 기본 흐름은 다음과 같다.

```text
questionnaire → question → design → decision → task → update/result
                                      ↘ risk · metric · hypothesis
```

## 6. 민감 정보

- 계좌번호·개인정보·비밀번호·API 키·원문 고객 데이터는 Git에 넣지 않는다.
- 대시보드에는 비식별 요약·집계·정본 위치만 둔다.
- 외부 원본이 필요하면 저장 위치와 접근 책임만 기록한다.

## 7. 병합·복구 원칙

- 현재 상태는 `state.md`·`output.md`에서 갱신한다.
- 과거 이력·결정은 행을 삭제하지 않고 상태와 대체 ID를 남긴다.
- 생성물 충돌은 Markdown 정본을 먼저 병합한 뒤 빌드하여 해소한다.
- SQLite 같은 바이너리 파일을 Git 정본으로 합치지 않는다.
- `manifest.json`의 원본 문서 수·레코드 수·유형·역할 집계가 빌드 검증 기준이다.

## 8. 생성과 검증

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

생성 후 확인한다.

1. 전체 현황과 7개 역할 화면이 존재한다.
2. 모든 화면이 `catalog.js`를 읽는다.
3. 카탈로그 ID가 중복되지 않는다.
4. 모든 레코드에 정적 상세 화면과 원본 경로가 있다.
5. 레코드 수가 원본 문서 수보다 많아 표 내부 항목이 분해됐음을 보장한다.
6. 로컬 링크와 JavaScript 구문이 유효하다.
7. 명시 메타데이터의 필수값·유형·역할·날짜가 잘못되거나 ID가 중복되면 빌드를 실패시킨다.
8. `related_ids`의 대상이 없거나 상세 화면의 정본 해시가 누락되면 빌드를 실패시킨다.

## 9. 규모 전환 기준

- 카탈로그 5,000건 이하, 생성 데이터 10MB 이하, 빌드 10초 이하는 현재 구조를 유지한다.
- 위 기준을 반복해서 넘으면 역할·유형별 `catalog.js`로 분할하고, Markdown에서 재생성하는 로컬 SQLite 검색 색인을 검토한다.
- 이벤트·지표가 100,000건 이상이거나 월별 분석이 병목이 되면 JSONL을 월별 Parquet로 변환하고 DuckDB로 집계한다.
- 같은 레코드의 동시 쓰기와 권한별 트랜잭션이 필요해지면 파일 형식 문제가 아니라 Git 쓰기 구조의 한계이므로 그때 중앙 API를 검토한다.

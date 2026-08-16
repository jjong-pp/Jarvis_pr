# BIGSEE 사업·제품 운영 저장소

기준일: 2026-08-16

이 저장소는 BIGSEE를 운영·판매·개발하기 위한 정본과 연결형 대시보드를 관리합니다. 현재 방향은 세 개의 실제 업무 페르소나를 대상으로 대형 커뮤니티와 Meta를 동시 검증하고, 조사에서 SKU·콘텐츠·영업·매출 측정까지 제품을 확장하는 것입니다.

## 바로 보기

- 대시보드: [dashboard/index.html](dashboard/index.html)
- 다음 로컬 전체 인계: [control/17_context_handoff.md](control/17_context_handoff.md)
- 최신 재기획: [control/16_replanning_brief.md](control/16_replanning_brief.md)
- 전사 현황: [control/00_project_status.md](control/00_project_status.md)
- 실행 계획: [control/15_execution_control.md](control/15_execution_control.md)
- 페이지 라우팅: [system/dashboard/SECTION_REGISTRY.md](system/dashboard/SECTION_REGISTRY.md)

## 폴더 책임

| 경로 | 내용 |
|---|---|
| `control/` | 전사 현황·결정·가설·실행·재기획 |
| `personas/` | 역할별 inbox·research·state·output·상세 reference |
| `system/` | 하네스와 대시보드 운영 계약 |
| `system/data/` | 로컬 데이터·레코드·확장자 계약 |
| `scripts/dashboard/` | MD 정본을 통합 카탈로그와 연결형 HTML로 만드는 생성기 |
| `dashboard/pages/` | 전략·시장·제품·마케팅·재무·기술·리스크 역할 화면 |
| `dashboard/records/` | 질문지·설계·과업·예정·결정·결과·이력의 생성형 상세 화면 |
| `dashboard/data/` | 서버 없이 검색하는 카탈로그·검증 명세 생성물 |
| `dashboard/assets/` | 공통 CSS·JavaScript |

루트에는 `README.md`, `AGENTS.md`, `dashboard.html`만 둡니다.

## 다음 세션의 최소 로딩

1. 이 파일을 읽습니다.
2. 사업의 배경이나 현재 방향을 이어갈 때는 `control/17_context_handoff.md`를 읽습니다.
3. `system/dashboard/SECTION_REGISTRY.md`에서 필요한 페이지의 정본을 찾습니다.
4. 해당 정본 하나와 담당 persona `output.md`만 먼저 읽습니다.
5. 근거가 부족할 때만 연결된 reference를 읽습니다.

생성 HTML·JavaScript·JSON을 사업 판단의 정본으로 읽거나 직접 편집하지 않습니다. 데이터 구조는 [system/data/RECORD_SCHEMA.md](system/data/RECORD_SCHEMA.md)를 따릅니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-dashboard.ps1
```

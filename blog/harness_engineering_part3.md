# AI 하네스 엔지니어링 — Part 3. 진짜 쓸만한가? 실전 평가와 유지보수

---

Part 1에서는 게이팅과 룰 계층화라는 뼈대를, Part 2에서는 의도 파싱과 동적 페르소나라는 엔진 내부를 살펴보았습니다. 이제 가장 솔직하고 중요한 질문에 답할 차례입니다.

**"과연 이 시스템이 실무 현장에서 진짜 쓸만했을까요?"**

이번 글은 반년 간 이 시스템을 운영하며 얻은 냉정한 평가서이자, 무너지는 규칙 파일들을 부여잡고 씨름했던 실전 트러블슈팅 기록입니다.

---

## 1. 비용: 공짜 점심은 없다 — 토큰 소비의 실제 청구서

모든 자동화 아키텍처에는 비용이 따릅니다. AI 에이전트 환경에서 비용은 곧 **토큰 소비량**입니다.

이론상 3단계 게이팅으로 효율을 잡았다고 했지만, 실제 레벨별 토큰 오버헤드는 큰 차이가 있었습니다.

* **Level 0 (경량 직답)**: 추가 토큰 **0%**. 지체 없이 즉시 응답합니다.
* **Level 1 (단일 스킬)**: 스킬 지침 파일 로딩으로 **10~20%**의 오버헤드가 발생합니다.
* **Level 2 (풀 오케스트레이션)**: 서브에이전트 생성, 메시지 교환, 검증 루프를 거치며 단일 응답 대비 **4~5배**의 토큰을 소비합니다.

실제 업무를 집계해 보면 전체 요청의 70~80%는 Level 0과 1에서 처리되어 평균 비용 효율은 훌륭했습니다. 하지만 게이팅 엔진이 오작동하여 `"오타 하나 고쳐줘"`라는 요청을 Level 2로 올려버리면, 서브에이전트 3마리가 튀어나와 토큰을 잔치판처럼 태우는 참사가 벌어지기도 했습니다.

솔직히 고백하자면, 토큰 소비량을 건건이 추적하는 실측 모니터링 체계가 초기에는 없었습니다. 이 체감상의 비용 추정을 정량화하는 것이 첫 번째 과제였습니다.

---

## 2. 모델 성능: Gemini에 하네스를 덧씌우면 Claude 수준이 나올까요?

가장 많이 받는 질문 중 하나입니다. **"Gemini에 하네스를 붙이면 Claude 3.5 Sonnet 급의 결과물이 나오는가?"**

반년간의 실무 경험을 바탕으로 낸 가장 솔직한 답은 이렇습니다.

> **"일상적 업무의 80~85%에서는 동등하거나 오히려 우수하지만, 나머지 15~20%의 영역에서는 여전히 모델 자체의 추론 지능 차이가 드러납니다."**

| 구분 | Gemini Engine (Antigravity 주력) | Claude Engine (3.5 Sonnet 특수용) |
| :--- | :--- | :--- |
| **주요 역할** | 일상 작업 전담 (Worker / Runner) | 아키텍처 설계 및 감수 (Architect / Auditor) |
| **강점 영역** | 2M+ 대용량 컨텍스트, 보일러플레이트, 초고속 리서치 | 복잡한 예외 로직 추론, 미묘한 뉘앙스, 코드 밀도 |
| **운용 전략** | 하네스로 촘촘한 가이드 및 제어망 씌움 | 핵심 아키텍처 및 최종 검증 단계에만 스팟 투입 |

하네스는 에이전트에게 올바른 행동 구조를 줄 뿐, 모델 자체의 근본적인 추론 IQ를 올려주지는 못합니다. 이것이 제가 **Gemini(전담 실행) + Claude(최종 감수)**의 2대 엔진 전략을 유지하는 이유입니다.

---

## 3. 실전에서 터진 3대 구멍과 땜질 해결책

멋지게 설계했다고 생각했던 하네스도 실전에 투입하니 3가지 치명적인 구멍이 뚫렸습니다. 기존 IT 기술 업계의 검증된 패턴을 가져와 땜질한 경과입니다.

| 구분 | 발생한 3대 취약점 (Problem) | 현상 및 페인 포인트 | 도입한 해결책 (Pattern) |
| :--- | :--- | :--- | :--- |
| **구멍 1** | **관측 가능성(Observability) 부재** | 게이팅 판단이나 스킬 매칭이 맞았는지 기록이 안 남아 개선 불가능 | `observability_log.md` 한 줄 경량 로깅 도입 |
| **구멍 2** | **불확실한 상태에서의 무모한 실행** | 지시가 모호해도 되묻지 않고 냅다 코드를 엎어버리는 현상 | 3문항 확신도 자가진단 체크리스트 도입 |
| **구멍 3** | **설정 파일 부패 (Rule Corruption)** | 서브에이전트들이 공용 룰 파일을 동시에 고치다 규칙이 뒤엉킴 | **GitOps 단일 수정 권한** & 스냅샷 백업 강제 |

#### 🛠️ `observability_log.md` 기록 예시
Level 1과 2 작업이 발생할 때마다 아래와 같이 한 줄 로그를 남겨 모니터링을 가능하게 했습니다.

```markdown
| Timestamp (ISO-8601) | Session ID | Intent Goal | Level | Matched Skills | Status | Cost Overhead |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| 2026-08-04T05:00:12Z | s-8f2a | Payment module refactoring | LEVEL_2 | `sw-eng`, `qa-review` | SUCCESS | 4.2x |
| 2026-08-04T05:12:45Z | s-8f2b | Check project status | LEVEL_0 | None | SUCCESS | 1.0x |
```

---

## 4. 시스템이 야생으로 변하지 않게 막는 유지보수 사이클

하네스 시스템은 잡초 같아서 며칠만 방치해도 규칙이 엉키고 썩어버립니다. 시스템의 건전성을 유지하기 위해 정착시킨 **5단계 유지보수 루틴**입니다.

| 주기 | 수행 작업 | 주요 목적 |
| :--- | :--- | :--- |
| **매 세션 (Every Session)** | 커밋 포인트 기록 & `state-sync` 실행 | 세션 간 작업 맥락 및 상태 연속성 유지 |
| **주간 (Weekly)** | `error_journal.md` 분석 및 룰 승격 | 반복되는 실수를 공통 규칙 패치로 반영 |
| **월간 (Monthly)** | `system-auditor` 전담 에이전트 가동 | `observability_log` 분석을 통한 게이팅 오판 교정 |
| **분기 (Quarterly)** | 스킬 카탈로그 통폐합 | 사용 빈도가 낮거나 중복된 스킬 정제 |
| **반년 (Semi-annually)** | 마스터 룰 구조 아키텍처 리팩토링 | 최신 업계 툴 및 모델 트렌드 반영 |

유지보수를 관통하는 대원칙은 하나입니다. **"변경은 오직 메인 에이전트 한 곳에서, 변경 전 반드시 백업을 남기고, 증분 수정(Incremental Edit)으로 진행한다."** 규칙을 싹 지우고 다시 쓰는 Clean Rewrite는 최후의 자폭 버튼으로 남겨두어야 합니다.

---

## 5. 마무리에 부쳐: 반년간의 시행착오 끝에 남은 것

Part 1부터 Part 3까지 긴 여정을 달려왔습니다. 반년간 하네스 엔지니어링을 붙잡고 씨름하면서 얻은 가장 큰 깨달음은 이것입니다.

> **"새롭게 출시되는 모델 성능 10% 향상에 환호하는 것보다, 내 업무 흐름에 딱 맞는 하네스를 제대로 설계하는 것이 실제 생산성에 훨씬 더 압도적인 영향을 미칩니다."**

이 마크다운 기반 하네스 패턴은 코딩, 리서치, 기획, 문서 작성 등 도메인을 가리지 않고 똑같은 제어망으로 작동합니다. 여러분만의 AI 사령부를 구축하는 데 이 작은 실전 기록이 도움이 되기를 바랍니다.

---

## 🎁 [부록] 바로 복사해서 사용하는 `master_harness_rules.md` 템플릿

여러분의 개발 환경(Antigravity, Cursor, Windsurf 등)에 즉시 적용할 수 있는 최우선 마크다운 룰 템플릿입니다.

```markdown
# Master Harness Control Rules (v1.0)

## Tier 1. Autonomous Harness (Precedence: P0 - MAX)
1. Phase 0 Memory Sync: Every new session MUST read `project_state.md` and `error_journal.md` before answering.
2. 3-Level Gating:
   - Level 0 (Signal 0): Bypass all skill loading for simple Q&A.
   - Level 1 (Signal 1): Load single matching skill from `skills/`.
   - Level 2 (Signal 2+): Spawn isolated sub-agents via `define_subagent` with specific personas.
3. Confidence Check: If task goal or target file is ambiguous (Confidence <= 1/3), STOP and ask user for clarification.

## Tier 2. Architecture & Engine Rules (Precedence: P1)
1. Single Engine Authority: Only Main Agent is allowed to modify master rule files. Sub-agents must suggest diffs only.
2. Snapshot Safety: ALWAYS create `.bak` copy before modifying system configuration or structural files.

## Tier 3. Security & Logging (Precedence: P2)
1. Privacy: Never expose raw API keys or secrets in logs.
2. Observability: Append execution metrics to `observability_log.md` for Level 1 and Level 2 tasks.

## Tier 4. Formatting (Precedence: P3)
1. Markdown Output: Use clean GitHub-flavored markdown with bold keywords and structured tables.
```

---
*시리즈 완결: Part 1~3 전체 읽기 완료*

출처: semon.log

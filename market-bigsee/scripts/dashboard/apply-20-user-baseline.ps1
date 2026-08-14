$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Replace-Required {
    param([string]$Text, [string]$Old, [string]$New, [string]$Label)
    if (-not $Text.Contains($Old)) { throw "Required text not found: $Label" }
    return $Text.Replace($Old, $New)
}

function Set-Utf8Text {
    param([string]$Path, [string]$Text)
    Set-Content -LiteralPath $Path -Value $Text -Encoding UTF8
}

$statusPath = Join-Path $projectRoot 'control\00_project_status.md'
$statusText = Get-Content -Raw -Encoding UTF8 -LiteralPath $statusPath
if (-not $statusText.Contains('| 기존 등록 사용자 | 약 20명')) {
    $statusText = Replace-Required $statusText '| 첫 판매 상황 | 신규 광고주 제안서와 캠페인 조사 |' "| 첫 판매 상황 | 신규 광고주 제안서와 캠페인 조사 |`r`n| 기존 등록 사용자 | 약 20명 · 사용자 전달값 · 실제/활성/유료 구분 미확인 |" 'status existing users'
}
$statusText = Replace-Required $statusText '| 다음 사업 게이트 | 유료 대행사 파일럿 3곳에서 반복 사용과 지불의사 확인 |' '| 다음 사업 게이트 | 기존 약 20명의 활성·첫 가치·반복·유료·팀 의도 분류 후 신규 유료 파일럿 확인 |' 'status business gate'
$statusText = Replace-Required $statusText '| 판매·PMF | 미검증 | 창업자 직접 영업과 14일 파일럿 설계 완료 | 유료 파일럿 3곳, 이후 8~10곳 |' '| 판매·PMF | 진행 | 기존 등록 사용자 약 20명 존재하나 활성·유료·반복 사용 미확인 | 20명 전수 분류와 5명 인터뷰, 이후 검색 광고 파일럿 |' 'status sales area'
$statusText = Replace-Required $statusText '| 1 | 현재 서비스 코드와 운영 로그 확보 | 데이터 모델·인증·사용량·API 호출 구조를 읽을 수 있음 | 대기 |' '| 1 | 기존 약 20명 사용자 백필표 확보 | 실제·활성·첫 가치·반복·유료·팀 의도·원가가 사용자별로 구분됨 | 진행 |' 'status first action'
$statusText = Replace-Required $statusText '| 2 | 이커머스 전문 대행사 100곳 목록 작성 | 연락처·전문 업종·최근 사례가 포함됨 | 대기 |' '| 2 | 신규 퍼널·UTM·원가 이벤트 검수 | 테스트 5회에서 랜딩→가입→첫 가치와 원가가 연결됨 | 대기 |' 'status second action'
Set-Utf8Text -Path $statusPath -Text $statusText

$controlPath = Join-Path $projectRoot 'control\15_execution_control.md'
$controlText = Get-Content -Raw -Encoding UTF8 -LiteralPath $controlPath
$controlText = Replace-Required $controlText '상태: 실행 계획 초안·사용자 승인과 실제 결과에 따라 갱신' '상태: 기존 등록 사용자 약 20명 전달·활성/유료/반복 여부 계측 대기' 'control status'
$controlText = Replace-Required $controlText '| 지금 단계 | 0단계 · 협업 조건과 측정 준비 |' '| 지금 단계 | 0~1단계 · 협업 조건과 기존 약 20명 사용자 측정 |' 'control current stage'
$controlText = Replace-Required $controlText '| 지금 목표 | 전체 전략을 실행하기 전에 개발 총괄과 역할·정산·정보 접근을 합의 |' '| 지금 목표 | 개발 총괄과 조건을 합의하면서 기존 약 20명의 실제 사용·원가를 수치화 |' 'control current goal'
$controlText = Replace-Required $controlText '| 이번 주 핵심 | 90일 Term Sheet 초안 공유, 코드·원가 자료 요청, 첫 고객 후보 정의 |' '| 이번 주 핵심 | 20명 백필표, 퍼널·UTM·원가 이벤트 검수, 5명 인터뷰, 검색 광고 준비 |' 'control weekly core'
$controlText = Replace-Required $controlText '| 아직 하면 안 되는 일 | 네 광고 채널 동시 대규모 집행, 근거 없는 가격 확정, 조건 합의 전 전체 실행 자산 이전 |' '| 아직 하면 안 되는 일 | 계측 검수 전 광고 집행, 네 채널 동시 집행, 가입 CPA만 보고 확대, 근거 없는 가격 확정 |' 'control do not'
$controlText = Replace-Required $controlText '| 다음 단계로 가는 조건 | 협업 조건 합의와 가입→첫 리포트→결제→유지 측정 가능 여부 확인 |' '| 다음 단계로 가는 조건 | 기존 20명 분류와 테스트 5회의 랜딩→가입→첫 리포트→원가·UTM 연결 성공 |' 'control next gate'
if (-not $controlText.Contains('## 기존 약 20명 계측')) {
    $newSections = @'

## 기존 약 20명 계측

| 측정 | 정의 | 현재 |
|---|---|---|
| 실제 등록 사용자 | 테스트·관리자·중복 제외 | 약 20명 · 미검증 |
| 7일·28일 활성 | 로그인 외 핵심 행동 1회 이상 | 미측정 |
| 첫 가치 도달 | 실제 키워드 리포트 1건 완성 | 미측정 |
| 반복 사용자 | 서로 다른 날 리포트 2건 이상 | 미측정 |
| 유료 사용자 | 실제 수금 완료·환불 분리 | 미측정 |
| 팀 의도 | 초대·공유·복수 고객·팀 기능 클릭 | 미측정 |
| 사용자당 30일 직접원가 | API·AI·인프라·재시도 합계 | 미측정 |

상세 백필 필드·이벤트·원가 원장·개발 검수 기준은 `personas/04_sales_marketing/reference/16_existing_user_measurement_ad_pilot.md`가 정본입니다.

## 첫 광고 예산

| 순서 | 기간 | 채널·용도 | 매체비 상한 | 시작 조건 |
|---:|---|---|---:|---|
| 0 | 3~7일 | 기존 사용자 백필·계측 검수 | 광고비 0원 | 테스트 5회 퍼널·UTM·원가 연결 |
| 1 | 7일 | 네이버 검색 | 300,000원 | 역할별 랜딩과 첫 가치 이벤트 정상 |
| 2 | 7일 | Google 검색 | 300,000원 | 네이버와 같은 기준으로 비교 가능 |
| 3 | 14일 | 더 좋은 검색 채널 | 600,000원 | 첫 가치 사용자 3명 이상 획득 |
| 4 | 조건부 | Meta 리타게팅 | 150,000원 | 충분한 방문자 풀과 검증 소재 |
| 5 | 필요 시 | 예비비 | 150,000원 | 랜딩·키워드 보정 근거 존재 |

첫 4주 매체비 상한은 1,500,000원입니다. 부가세·소재 외주·개발 인건비는 별도이며 TikTok은 이번 시험에서 제외합니다.
'@
    $controlText = $controlText.Replace('## 단계별 실행', $newSections.TrimEnd() + "`r`n`r`n## 단계별 실행")
}
$controlText = Replace-Required $controlText '| 1. 제품·측정 확인 | 1~2주 | 광고 전에 무엇을 측정하고 팔 수 있는지 확인 | 코드·인프라·외부 API·원가 자료 확보, 가입·첫 리포트·결제·4주 유지 이벤트 점검 | 사용자당 원가 시나리오와 핵심 퍼널 이벤트를 기록할 수 있음 | 코드·로그 접근이 없거나 첫 가치 이벤트를 측정할 수 없음 | 입력 대기 |' '| 1. 제품·측정 확인 | 3~7일 | 기존 약 20명을 기준으로 무엇을 측정하고 팔 수 있는지 확인 | 20명 백필, 가입·첫 리포트·재사용·결제·팀 의도·원가·UTM 이벤트 점검 | 테스트 5회 퍼널 연결과 사용자당 원가 원장을 기록할 수 있음 | 코드·로그 접근이 없거나 첫 가치·원가를 연결할 수 없음 | 진행 |' 'control stage 1'
$controlText = Replace-Required $controlText '| 2. 고객 문제 확인 | 2~4주 | 업무형 개인과 대행사가 같은 문제에 돈을 내는지 확인 | 1인 셀러·프리랜서·대행사 실무자 인터뷰, 실제 최근 업무 시간과 도구 기록 | 10회 이상 인터뷰, 반복 문제 1개, 유료 시험 의향이 있는 후보 5명 이상 | 좋은 반응만 있고 최근 실제 업무·비용·결제 의향이 없음 | 미시작 |' '| 2. 고객 문제 확인 | 1~2주 | 기존 사용자 중 누가 어떤 문제로 반복 사용하는지 확인 | 기존 사용자 5명 우선 인터뷰, 역할·최근 업무·대체 도구·지불의사 기록 | 5명 심층 인터뷰와 20명 역할 분류, 반복 문제·첫 가치 정의 | 등록 수만 있고 실제 업무·반복 사용·지불의사 근거가 없음 | 진행 |' 'control stage 2'
$controlText = Replace-Required $controlText '| 3. 소액 광고와 첫 결제 | 3~6주 | 고의도 채널 하나에서 활성 유료 고객을 만들기 | 역할별 랜딩 3개, 네이버·Google 검색부터 시험, 첫 리포트 완성까지 추적 | 유료 개인 10명 또는 유료 파일럿 3건, 채널별 활성 고객 CAC 계산 | 가입은 늘지만 첫 리포트 완성률이나 결제가 기준 이하 | 대기 |' '| 3. 소액 광고와 첫 결제 | 계측 후 4주 | 고의도 검색에서 첫 가치 사용자를 만들기 | 네이버·Google을 각 30만원으로 순차 시험하고 승자 채널에 60만원 추가 | 채널별 첫 가치 CAC 계산과 유료 개인 또는 파일럿 발생 | 채널당 30만원에도 첫 가치 3명 미만 또는 가입→첫 가치 20% 미만 | 검수 대기 |' 'control stage 3'
$controlText = Replace-Required $controlText '| 1 | 개발 총괄에게 90일 협업 조건 제안 | 1~2쪽 Term Sheet와 회신 기한 | STR | 진행 |' '| 1 | 기존 약 20명 백필표 요청 | 실제·활성·첫 가치·반복·유료·팀 의도·원가 분류 | TEC·SAL | 진행 |' 'control task 1'
$controlText = Replace-Required $controlText '| 2 | 15%의 뜻을 질문 | 최초·갱신·업셀·환불·부가세·지급일 정의 | STR·FIN | 대기 |' '| 2 | 퍼널·UTM·원가 이벤트 검수 | 테스트 5회와 중복·실패·재시도 확인 | TEC·FIN | 대기 |' 'control task 2'
$controlText = Replace-Required $controlText '| 3 | 코드·인프라·원가 자료 요청 | 저장소, 배포 구조, API 공급사, 최근 청구·로그 목록 | TEC·FIN | 대기 |' '| 3 | 기존 사용자 5명 인터뷰 | 역할·최근 업무·첫 가치·대체 도구·지불의사 | MKT·SAL | 대기 |' 'control task 3'
$controlText = Replace-Required $controlText '| 4 | 첫 고객 세 종류 확정 | 1인 셀러, 프리랜서 마케터, 대행사 실무자 조건 | MKT | 대기 |' '| 4 | 네이버·Google 키워드 예측 | 실제 키워드별 검색량·예상 CPC·클릭·비용 | SAL | 대기 |' 'control task 4'
$controlText = Replace-Required $controlText '| 5 | 첫 가치 정의 | 실제 키워드로 의사결정 리포트 1건 완성 | PRD | 대기 |' '| 5 | 역할별 랜딩과 첫 가치 정의 | 실제 키워드 리포트 1건 완성까지 추적 | PRD·SAL | 대기 |' 'control task 5'
$controlText = Replace-Required $controlText '| 6 | 광고 전 계측표 작성 | 방문→가입→첫 리포트→유료→4주 활성→팀 의도 | SAL·TEC | 대기 |' '| 6 | 4주 광고 집행 승인 | 최대 150만원·중단 기준·광고비 부담 주체 합의 | STR·FIN | 대기 |' 'control task 6'
$controlText = Replace-Required $controlText '| 1 | 네이버 검색 | 한국어로 문제와 도구를 찾는 사람 포착 | 역할별 랜딩과 첫 리포트 이벤트 준비 | 4주 활성 유료 고객 CAC가 허용 범위 | 준비 전 |' '| 1 | 네이버 검색 | 한국어로 문제와 도구를 찾는 사람 포착 | 기존 20명 백필과 테스트 5회 계측 통과 | 30만원에 첫 가치 사용자 3명 이상 | 검수 대기 |' 'control naver'
$controlText = Replace-Required $controlText '| 2 | Google 검색 | 전문 도구·경쟁 서비스·글로벌 검색 수요 포착 | 네이버와 같은 측정 기준 준비 | 네이버와 비교해 더 좋은 활성 고객 CAC 또는 다른 유효 세그먼트 발견 | 준비 전 |' '| 2 | Google 검색 | 전문 도구·경쟁 서비스·글로벌 검색 수요 포착 | 네이버와 같은 첫 가치·원가 기준 준비 | 30만원에 첫 가치 사용자 3명 이상 또는 네이버보다 낮은 CAC | 검수 대기 |' 'control google'
$controlText = Replace-Required $controlText '| 3 | Meta | 검색·콘텐츠 방문자 리타게팅과 화면 데모 | 검색 방문자와 검증된 소재 확보 | 리타게팅이 첫 리포트와 유료 전환을 증가 | 준비 전 |' '| 3 | Meta | 검색·콘텐츠 방문자 리타게팅과 화면 데모 | 충분한 검색 방문자와 검증된 소재 확보 | 15만원 내 첫 가치 보조전환과 검색 대비 증분 확인 | 조건부 |' 'control meta'
$controlText = Replace-Required $controlText '| 4 | TikTok | 숏폼 후크와 새로운 잠재 수요 시험 | 유기 콘텐츠에서 반응 좋은 데모 소재 발견 | 리드가 아니라 활성 사용자 비용이 허용 범위 | 준비 전 |' '| 4 | TikTok | 숏폼 후크와 새로운 잠재 수요 시험 | 유기 소재와 검색 광고 결과가 먼저 검증 | 다음 시험으로 보류 | 제외 |' 'control tiktok'
$controlText = Replace-Required $controlText '초기 학습 예산 가설은 네이버 40, Google 30, Meta 20, TikTok 10입니다. 네 채널을 같은 날 크게 시작하라는 뜻이 아니라 위 순서대로 검증하며 예산 상한을 배분한다는 뜻입니다.' '첫 4주 매체비 상한은 150만원입니다. 네이버 30만원 → Google 30만원 → 승자 검색 60만원 → 조건부 Meta 15만원 → 예비비 15만원 순서이며 TikTok은 제외합니다.' 'control budget narrative'
Set-Utf8Text -Path $controlPath -Text $controlText

$registryPath = Join-Path $projectRoot 'system\dashboard\SECTION_REGISTRY.md'
$registryText = Get-Content -Raw -Encoding UTF8 -LiteralPath $registryPath
$registryText = Replace-Required $registryText '`personas/04_sales_marketing/reference/13_it_saas_gtm_paid_acquisition.md` |' '`personas/04_sales_marketing/reference/16_existing_user_measurement_ad_pilot.md` |' 'section registry ad reference'
Set-Utf8Text -Path $registryPath -Text $registryText

Write-Output '20-user baseline applied to control and dashboard routing.'


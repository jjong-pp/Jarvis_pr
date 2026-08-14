$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$controlPath = Join-Path $projectRoot 'control/15_execution_control.md'
$partnershipPath = Join-Path $projectRoot 'personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md'
$registryPath = Join-Path $projectRoot 'personas\registry.md'
$legacyPath = Join-Path $projectRoot 'dashboard.html'

foreach ($required in @($controlPath, $partnershipPath, $registryPath, $legacyPath)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Required dashboard source missing: $required" }
}
New-Item -ItemType Directory -Force -Path $dashboardRoot | Out-Null

function Encode-Html {
    param([AllowEmptyString()][string]$Text)
    return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Get-SectionText {
    param([string]$Text, [string]$Heading)
    $pattern = '(?ms)^##\s+' + [regex]::Escape($Heading) + '\s*\r?\n(.*?)(?=^##\s+|\z)'
    $match = [regex]::Match($Text, $pattern)
    if (-not $match.Success) { throw "Markdown section not found: $Heading" }
    return $match.Groups[1].Value.Trim()
}

function Split-MarkdownRow {
    param([string]$Line)
    return @($Line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
}

function Get-MarkdownTable {
    param([string]$Text, [string]$Heading)
    $section = Get-SectionText -Text $Text -Heading $Heading
    $lines = @($section -split '\r?\n' | Where-Object { $_.Trim().StartsWith('|') })
    if ($lines.Count -lt 2) { throw "Markdown table not found: $Heading" }
    $headers = Split-MarkdownRow $lines[0]
    $rows = @()
    for ($index = 2; $index -lt $lines.Count; $index++) {
        $cells = Split-MarkdownRow $lines[$index]
        if ($cells.Count -eq 0) { continue }
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows += [pscustomobject]$record
    }
    return $rows
}

function Get-KeyValueTable {
    param([string]$Text, [string]$Heading, [string]$ValueColumn = '현재')
    $result = @{}
    foreach ($row in (Get-MarkdownTable -Text $Text -Heading $Heading)) {
        $result[[string]$row.항목] = [string]$row.$ValueColumn
    }
    return $result
}

function Get-PersonaValues {
    param([string]$Path, [string]$Heading)
    return Get-KeyValueTable -Text (Get-Content -Raw -Encoding UTF8 -LiteralPath $Path) -Heading $Heading -ValueColumn '값'
}

function Get-StatusClass {
    param([string]$Status)
    switch -Regex ($Status) {
        '완료|확정|통과' { return 'done' }
        '진행' { return 'progress' }
        '주의|중단|미해결' { return 'stop' }
        '대기|입력 대기|협상 대기|준비 전|미시작|기획' { return 'wait' }
        default { return 'neutral' }
    }
}

function Render-Status {
    param([string]$Status)
    return '<span class="status status-' + (Get-StatusClass $Status) + '">' + (Encode-Html $Status) + '</span>'
}

$controlText = Get-Content -Raw -Encoding UTF8 -LiteralPath $controlPath
$partnershipText = Get-Content -Raw -Encoding UTF8 -LiteralPath $partnershipPath
$registryText = Get-Content -Raw -Encoding UTF8 -LiteralPath $registryPath
$quick = Get-KeyValueTable -Text $controlText -Heading '한눈에 보기'
$stages = @(Get-MarkdownTable -Text $controlText -Heading '단계별 실행')
$weekTasks = @(Get-MarkdownTable -Text $controlText -Heading '이번 주 할 일')
$channels = @(Get-MarkdownTable -Text $controlText -Heading '광고 실행 순서')
$levels = @(Get-MarkdownTable -Text $controlText -Heading '협업 조건 승급')
$decisions = @(Get-MarkdownTable -Text $controlText -Heading '내가 내려야 할 결정')
$statusMeanings = @(Get-MarkdownTable -Text $controlText -Heading '쉬운 상태 설명')
$personas = @(Get-MarkdownTable -Text $registryText -Heading 'Persona Registry')

$allMarkdown = @(Get-ChildItem -LiteralPath $projectRoot -Filter '*.md' -Recurse | Where-Object { $_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)
$hashText = [System.Text.StringBuilder]::new()
foreach ($file in $allMarkdown) {
    [void]$hashText.AppendLine($file.FullName.Substring($projectRoot.Length))
    [void]$hashText.AppendLine((Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName))
}
$sha = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($hashText.ToString()))
$sourceHash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant().Substring(0, 16)
$generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm'

$currentStage = @($stages | Where-Object { [string]$_.상태 -match '진행' } | Select-Object -First 1)
if ($currentStage.Count -eq 0) { $currentStage = @($stages | Select-Object -First 1) }
$currentStatus = if ($currentStage.Count -gt 0) { [string]$currentStage[0].상태 } else { '미확인' }

$taskBuilder = [System.Text.StringBuilder]::new()
foreach ($task in $weekTasks) {
    [void]$taskBuilder.Append('<li><span class="order">' + (Encode-Html $task.순서) + '</span><div><strong>' + (Encode-Html $task.'할 일') + '</strong><small>' + (Encode-Html $task.결과물) + ' · ' + (Encode-Html $task.담당) + '</small></div>' + (Render-Status $task.상태) + '</li>')
}

$stageBuilder = [System.Text.StringBuilder]::new()
foreach ($stage in $stages) {
    $number = if ([string]$stage.단계 -match '^(\d+)') { $matches[1] } else { '·' }
    $name = ([string]$stage.단계) -replace '^\d+\.\s*', ''
    $openAttribute = if ([string]$stage.상태 -match '진행') { ' open' } else { '' }
    [void]$stageBuilder.Append(@"
<details class="item stage-item"$openAttribute>
  <summary><span class="item-id">$number</span><span class="summary-copy"><strong>$(Encode-Html $name)</strong><small>$(Encode-Html $stage.'기간 가설') · $(Encode-Html $stage.목표)</small></span>$(Render-Status $stage.상태)</summary>
  <div class="item-body"><div><span class="field">지금 할 일</span><p>$(Encode-Html $stage.'지금 할 일')</p></div><div><span class="field">통과 기준</span><p>$(Encode-Html $stage.'완료 기준')</p></div><div><span class="field">멈추거나 고칠 조건</span><p>$(Encode-Html $stage.'멈추거나 고칠 조건')</p></div><div class="item-foot"><span>담당 $(Encode-Html $stage.'주 담당')</span><a href="../$(Encode-Html $stage.'상세 정본')">정본 열기</a></div></div>
</details>
"@)
}

$channelBuilder = [System.Text.StringBuilder]::new()
foreach ($channel in $channels) {
    [void]$channelBuilder.Append(@"
<details class="item">
  <summary><span class="item-id">$(Encode-Html $channel.순서)</span><span class="summary-copy"><strong>$(Encode-Html $channel.채널)</strong><small>$(Encode-Html $channel.'왜 쓰는가')</small></span>$(Render-Status $channel.상태)</summary>
  <div class="item-body two"><div><span class="field">시작 조건</span><p>$(Encode-Html $channel.'시작 조건')</p></div><div><span class="field">확대 조건</span><p>$(Encode-Html $channel.'확대 조건')</p></div></div>
</details>
"@)
}

$levelBuilder = [System.Text.StringBuilder]::new()
foreach ($level in $levels) {
    [void]$levelBuilder.Append(@"
<details class="item">
  <summary><span class="summary-copy"><strong>$(Encode-Html $level.구간)</strong><small>$(Encode-Html $level.'내가 맡는 일')</small></span></summary>
  <div class="item-body two"><div><span class="field">받을 조건</span><p>$(Encode-Html $level.'받을 조건')</p></div><div><span class="field">다음 구간의 증거</span><p>$(Encode-Html $level.'다음 구간으로 가는 증거')</p></div></div>
</details>
"@)
}

$decisionBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $decisions) {
    [void]$decisionBuilder.Append(@"
<details class="item">
  <summary><span class="item-id text-id">$(Encode-Html $row.ID)</span><span class="summary-copy"><strong>$(Encode-Html $row.질문)</strong><small>$(Encode-Html $row.추천안)</small></span>$(Render-Status $row.상태)</summary>
  <div class="item-body"><div><span class="field">결정 전에 확인</span><p>$(Encode-Html $row.'결정 전 확인')</p></div></div>
</details>
"@)
}

$roleBuilder = [System.Text.StringBuilder]::new()
foreach ($persona in $personas) {
    $directory = Join-Path (Join-Path $projectRoot 'personas') ([string]$persona.Directory)
    $state = Get-PersonaValues (Join-Path $directory 'state.md') 'Harness State'
    $output = Get-PersonaValues (Join-Path $directory 'output.md') 'Dashboard Output'
    [void]$roleBuilder.Append(@"
<details class="item">
  <summary><span class="item-id text-id">$(Encode-Html $persona.ID)</span><span class="summary-copy"><strong>$(Encode-Html $persona.페르소나)</strong><small>$(Encode-Html $state['현재 과업'])</small></span>$(Render-Status $state['상태'])</summary>
  <div class="item-body"><div><span class="field">현재 결론</span><p>$(Encode-Html $output['결론'])</p></div><div><span class="field">다음 행동</span><p>$(Encode-Html $output['제안'])</p></div><div><span class="field">막힌 것</span><p>$(Encode-Html $state['차단 요인'])</p></div><div class="item-foot"><a href="../personas/$(Encode-Html $persona.Directory)/output.md">출력</a><a href="../personas/$(Encode-Html $persona.Directory)/state.md">상태</a></div></div>
</details>
"@)
}

$statusBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $statusMeanings) {
    [void]$statusBuilder.Append('<div class="meaning-row">' + (Render-Status $row.상태) + '<span>' + (Encode-Html $row.뜻) + '</span></div>')
}

$scriptSection = Get-SectionText -Text $partnershipText -Heading '9. 제안 대화문'
$scriptMatch = [regex]::Match($scriptSection, '(?ms)```text\s*(.*?)\s*```')
$conversation = if ($scriptMatch.Success) { $scriptMatch.Groups[1].Value.Trim() } else { 'personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md의 제안 대화문을 확인하세요.' }

$html = @"
<!doctype html>
<html lang="ko"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">
  <title>BIGSEE 사업 실행 현황</title><meta name="description" content="BIGSEE 사업의 현재 행동과 상세 근거를 한 화면에서 접어 보는 로컬 대시보드">
  <link rel="stylesheet" href="styles.css">
</head><body>
  <a class="skip-link" href="#main">본문으로 이동</a>
  <header class="topbar"><div class="topbar-inner"><a class="brand" href="index.html"><span class="brand-mark">B</span><span>BIGSEE</span></a><div class="top-status"><span>$(Encode-Html $quick['지금 단계'])</span>$(Render-Status $currentStatus)</div><div class="top-actions"><button type="button" class="small-button" data-collapse-all>모두 접기</button><a class="small-button solid" href="evidence.html">상세 근거</a></div></div></header>
  <main class="shell" id="main">
    <h1 class="sr-only">BIGSEE 사업 실행 현황</h1>
    <section class="now-card" aria-label="현재 현황">
      <div class="now-row"><span class="kicker">지금</span><strong>$(Encode-Html $quick['지금 단계'])</strong></div>
      <p class="now-goal">$(Encode-Html $quick['지금 목표'])</p>
      <div class="now-grid"><div><span class="field">이번 주 핵심</span><p>$(Encode-Html $quick['이번 주 핵심'])</p></div><div><span class="field">다음 단계 조건</span><p>$(Encode-Html $quick['다음 단계로 가는 조건'])</p></div></div>
      <div class="do-not"><span>아직 하지 않기</span>$(Encode-Html $quick['아직 하면 안 되는 일'])</div>
    </section>

    <section class="action-block" aria-label="이번 주 할 일"><div class="inline-label"><strong>이번 주</strong><span>$($weekTasks.Count)개 행동</span></div><ol class="action-list">$($taskBuilder.ToString())</ol></section>

    <div class="accordion-stack">
      <details class="group" data-group="stages"><summary><span>실행 단계</span><small>$(Encode-Html $quick['지금 단계']) · 총 $($stages.Count)단계</small></summary><div class="group-body"><p class="group-note">기간보다 통과 기준이 우선입니다. 현재 단계만 기본으로 펼쳐집니다.</p>$($stageBuilder.ToString())</div></details>

      <details class="group" data-group="growth"><summary><span>시장 진입과 B2B 전환</span><small>기존 사용자 → 커뮤니티·직접 판매 → Meta → 검색 확대</small></summary><div class="group-body"><div class="plain-note">커뮤니티는 고객 연구와 신뢰, 직접 판매는 결제 검증, Meta는 검증된 문제·사례의 증폭에 사용합니다. 반복 사용 전에는 대량 광고를 하지 않습니다.</div><div class="budget" aria-label="첫 30일 사업개발 시간 배분 가설"><span class="naver">고객 연구 40</span><span class="google">직접 판매 30</span><span class="meta">Meta 20</span><span class="tiktok">운영 10</span></div>$($channelBuilder.ToString())<div class="flow-line"><span>고객 대화</span><i></i><span>유료 데모</span><i></i><span>Meta 증폭</span><i></i><span>반복·B2B</span></div></div></details>

      <details class="group" data-group="partnership"><summary><span>협업 조건과 15%</span><small>90일 시험 → GTM 운영 → 공동사업</small></summary><div class="group-body"><div class="plain-note"><strong>판정:</strong> 15%는 즉시 거절하거나 확정할 숫자가 아니라, 역할·갱신·비용·정산·종료 조건을 붙인 90일 시험의 출발점입니다.</div>$($levelBuilder.ToString())<details class="item"><summary><span class="summary-copy"><strong>합의 전에 확인할 조건</strong><small>계산·갱신·비용·정보권·종료 보호</small></span></summary><div class="item-body"><ul class="checklist"><li>15% 계산 기준</li><li>최초 결제·갱신·업셀 인정 기간</li><li>광고비·도구비·콘텐츠 비용 부담</li><li>CRM·결제·환불 내역 열람</li><li>고객 귀속과 월 정산·지급일</li><li>가격·할인·환불 협의</li><li>종료 후 기존 고객 수수료 보호</li><li>제품 장애와 고객지원 책임</li></ul></div></details><details class="item"><summary><span class="summary-copy"><strong>그대로 보낼 제안문</strong><small>이름과 숫자만 조정</small></span></summary><div class="item-body"><div class="copy-row"><span>개발 총괄에게 보내기 전 계약·세무 검토 권장</span><button type="button" class="small-button" data-copy="deal-script">문장 복사</button></div><textarea class="script-box" id="deal-script" readonly>$(Encode-Html $conversation)</textarea><div class="item-foot"><a href="../personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md">전체 판단 근거</a></div></div></details></div></details>

      <details class="group" data-group="decisions"><summary><span>결정 대기</span><small>$($decisions.Count)건 · 모르는 것은 확정하지 않기</small></summary><div class="group-body">$($decisionBuilder.ToString())</div></details>

      <details class="group" data-group="roles"><summary><span>역할별 현황</span><small>전략·시장·제품·판매·재무·기술·리스크</small></summary><div class="group-body">$($roleBuilder.ToString())</div></details>

      <details class="group" data-group="guide"><summary><span>상태 뜻과 상세 근거</span><small>표시를 이해하거나 전체 표가 필요할 때</small></summary><div class="group-body"><div class="meaning-grid">$($statusBuilder.ToString())</div><div class="evidence-link"><div><strong>전체 상세판</strong><span>기존 분석표·가설·결정·정본 링크를 그대로 보존합니다.</span></div><a class="small-button solid" href="evidence.html">열기</a></div></div></details>
    </div>

    <footer class="footer"><span>사업 사실은 Markdown 정본에서 관리 · HTML 직접 수정 금지</span><span>생성 $generatedAt · $sourceHash</span></footer>
  </main><script src="app.js"></script>
</body></html>
"@
Set-Content -LiteralPath (Join-Path $dashboardRoot 'index.html') -Value $html -Encoding UTF8

# Preserve the detailed generated dashboard as a separate evidence page.
$legacyHtml = Get-Content -Raw -Encoding UTF8 -LiteralPath $legacyPath
if ($legacyHtml -notmatch '<base\s') { $legacyHtml = $legacyHtml.Replace('<head>', '<head>' + [Environment]::NewLine + '  <base href="../">') }
$evidenceBar = '<div style="position:sticky;top:0;z-index:99;padding:10px 18px;background:#173d4a;color:white;font:700 13px Segoe UI,sans-serif"><a href="dashboard/index.html" style="color:white">← 통합 실행판으로 돌아가기</a><span style="margin-left:14px;opacity:.75">이 화면은 전체 표와 근거를 보는 상세판입니다.</span></div>'
$legacyHtml = $legacyHtml.Replace('<body>', '<body>' + $evidenceBar)
Set-Content -LiteralPath (Join-Path $dashboardRoot 'evidence.html') -Value $legacyHtml -Encoding UTF8

# Keep the historical root entry path working.
$rootHtml = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=dashboard/index.html"><title>BIGSEE 실행판</title></head><body><p><a href="dashboard/index.html">BIGSEE 실행판 열기</a></p></body></html>'
Set-Content -LiteralPath $legacyPath -Value $rootHtml -Encoding UTF8

Write-Output "Integrated dashboard generated: dashboard/index.html ($sourceHash)"




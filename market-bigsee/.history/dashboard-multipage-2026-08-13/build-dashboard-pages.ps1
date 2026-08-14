$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$controlPath = Join-Path $projectRoot '15_execution_control.md'
$partnershipPath = Join-Path $projectRoot '14_gtm_compensation_partnership_framework.md'
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
        '대기|입력 대기|협상 대기|준비 전|미시작' { return 'wait' }
        default { return 'neutral' }
    }
}

function Render-Status {
    param([string]$Status)
    return '<span class="status status-' + (Get-StatusClass $Status) + '">' + (Encode-Html $Status) + '</span>'
}

function Get-Navigation {
    param([string]$Current)
    $links = [ordered]@{
        'index.html' = '홈'; 'stages.html' = '단계별 실행'; 'growth.html' = '광고·판매';
        'partnership.html' = '협업 조건'; 'roles.html' = '역할별 현황'; 'evidence.html' = '상세 근거'
    }
    $builder = [System.Text.StringBuilder]::new()
    foreach ($entry in $links.GetEnumerator()) {
        $currentAttr = if ($entry.Key -eq $Current) { ' aria-current="page"' } else { '' }
        [void]$builder.Append('<a href="' + $entry.Key + '"' + $currentAttr + '>' + $entry.Value + '</a>')
    }
    return $builder.ToString()
}

function New-Page {
    param([string]$FileName, [string]$Title, [string]$Eyebrow, [string]$Headline, [string]$Lead, [string]$Content, [string]$GeneratedAt, [string]$SourceHash)
    $nav = Get-Navigation $FileName
    $html = @"
<!doctype html>
<html lang="ko"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light">
  <title>$(Encode-Html $Title) · BIGSEE</title><meta name="description" content="BIGSEE 사업을 쉬운 단계와 행동으로 관리하는 로컬 대시보드">
  <link rel="stylesheet" href="styles.css">
</head><body>
  <a class="skip-link" href="#main">본문으로 이동</a>
  <header class="site-header"><div class="header-inner"><a class="brand" href="index.html"><span class="brand-mark">B</span><span>BIGSEE 실행판</span></a><nav class="nav" aria-label="주요 화면">$nav</nav></div></header>
  <main class="shell" id="main"><section class="hero"><p class="eyebrow">$(Encode-Html $Eyebrow)</p><h1>$(Encode-Html $Headline)</h1><p class="lead">$(Encode-Html $Lead)</p></section>
    $Content
    <footer class="page-footer"><span>사업 사실은 Markdown 정본에서 관리 · HTML 직접 수정 금지</span><span>생성 $GeneratedAt · $SourceHash</span></footer>
  </main><script src="app.js"></script>
</body></html>
"@
    Set-Content -LiteralPath (Join-Path $dashboardRoot $FileName) -Value $html -Encoding UTF8
}

$controlText = Get-Content -Raw -Encoding UTF8 -LiteralPath $controlPath
$partnershipText = Get-Content -Raw -Encoding UTF8 -LiteralPath $partnershipPath
$registryText = Get-Content -Raw -Encoding UTF8 -LiteralPath $registryPath
$quick = Get-KeyValueTable -Text $controlText -Heading '한눈에 보기'
$stages = Get-MarkdownTable -Text $controlText -Heading '단계별 실행'
$weekTasks = Get-MarkdownTable -Text $controlText -Heading '이번 주 할 일'
$channels = Get-MarkdownTable -Text $controlText -Heading '광고 실행 순서'
$levels = Get-MarkdownTable -Text $controlText -Heading '협업 조건 승급'
$decisions = Get-MarkdownTable -Text $controlText -Heading '내가 내려야 할 결정'
$personas = Get-MarkdownTable -Text $registryText -Heading 'Persona Registry'

$allMarkdown = @(Get-ChildItem -LiteralPath $projectRoot -Filter '*.md' -Recurse | Sort-Object FullName)
$hashText = [System.Text.StringBuilder]::new()
foreach ($file in $allMarkdown) {
    [void]$hashText.AppendLine($file.FullName.Substring($projectRoot.Length))
    [void]$hashText.AppendLine((Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName))
}
$sha = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($hashText.ToString()))
$sourceHash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant().Substring(0, 16)
$generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm'

# Home page
$homeTaskBuilder = [System.Text.StringBuilder]::new()
foreach ($task in $weekTasks) {
    [void]$homeTaskBuilder.Append('<li><div class="task-copy"><strong>' + (Encode-Html $task.'할 일') + '</strong><small>' + (Encode-Html $task.결과물) + ' · ' + (Encode-Html $task.담당) + '</small></div>' + (Render-Status $task.상태) + '</li>')
}
$decisionBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $decisions) {
    [void]$decisionBuilder.Append('<tr><td data-label="ID"><strong>' + (Encode-Html $row.ID) + '</strong></td><td data-label="질문">' + (Encode-Html $row.질문) + '</td><td data-label="추천">' + (Encode-Html $row.추천안) + '</td><td data-label="확인">' + (Encode-Html $row.'결정 전 확인') + '</td><td data-label="상태">' + (Render-Status $row.상태) + '</td></tr>')
}
$homeContent = @"
<div class="notice"><strong>현재 판단</strong>$(Encode-Html $quick['지금 목표'])</div>
<section class="section"><div class="grid three"><article class="card"><div class="label">지금 단계</div><div class="value">$(Encode-Html $quick['지금 단계'])</div></article><article class="card"><div class="label">이번 주 핵심</div><div class="value">$(Encode-Html $quick['이번 주 핵심'])</div></article><article class="card"><div class="label">아직 하면 안 되는 일</div><div class="value">$(Encode-Html $quick['아직 하면 안 되는 일'])</div></article></div></section>
<section class="section"><div class="section-head"><div><h2>이번 주에는 이것만</h2><p class="section-sub">완료되면 상태를 바꾸고 다음 단계로 이동합니다.</p></div><a class="button secondary" href="stages.html">전체 단계 보기</a></div><ol class="task-list">$($homeTaskBuilder.ToString())</ol></section>
<section class="section"><div class="section-head"><div><h2>내가 내려야 할 결정</h2><p class="section-sub">모르는 것은 지금 확정하지 않습니다.</p></div></div><table class="decision-table"><thead><tr><th>ID</th><th>질문</th><th>추천</th><th>확인할 것</th><th>상태</th></tr></thead><tbody>$($decisionBuilder.ToString())</tbody></table></section>
<div class="hero-actions"><a class="button" href="partnership.html">15% 협업 조건 정리</a><a class="button secondary" href="growth.html">광고 순서 확인</a></div>
"@
New-Page 'index.html' '지금 현황' 'RIGHT NOW' '지금은 광고보다 조건과 측정을 먼저 정리할 때입니다.' '어려운 전략 용어 대신 이번 주 행동과 다음 단계로 넘어가는 기준만 보여줍니다.' $homeContent $generatedAt $sourceHash

# Stages page
$stageBuilder = [System.Text.StringBuilder]::new()
foreach ($stage in $stages) {
    $number = if ([string]$stage.단계 -match '^(\d+)') { $matches[1] } else { '·' }
    $name = ([string]$stage.단계) -replace '^\d+\.\s*', ''
    [void]$stageBuilder.Append(@"
<article class="step"><div><div class="step-number">$number</div><div class="step-period">$(Encode-Html $stage.'기간 가설')</div>$(Render-Status $stage.상태)</div><div class="step-main"><h3>$(Encode-Html $name)</h3><p><span class="label">목표</span><br><strong>$(Encode-Html $stage.목표)</strong></p><p><span class="label">할 일</span><br>$(Encode-Html $stage.'지금 할 일')</p><p class="muted">담당 $(Encode-Html $stage.'주 담당') · <a href="../$(Encode-Html $stage.'상세 정본')">근거 열기</a></p></div><aside class="step-gate"><strong>끝났다고 보는 기준</strong>$(Encode-Html $stage.'완료 기준')<br><br><strong>멈추거나 고칠 조건</strong>$(Encode-Html $stage.'멈추거나 고칠 조건')</aside></article>
"@)
}
$stagesContent = '<div class="notice"><strong>운영 원칙</strong>기간이 지났다고 다음 단계로 가지 않습니다. 완료 기준을 통과해야 이동합니다.</div><section class="section"><div class="steps">' + $stageBuilder.ToString() + '</div></section>'
New-Page 'stages.html' '단계별 실행' '0 → 6 STAGES' '무엇을 하고, 언제 다음으로 넘어가는지만 봅니다.' '각 단계에는 목표, 지금 할 일, 완료 기준, 멈출 조건이 있습니다. 현재는 0단계입니다.' $stagesContent $generatedAt $sourceHash

# Growth page
$channelBuilder = [System.Text.StringBuilder]::new()
foreach ($channel in $channels) {
    [void]$channelBuilder.Append('<article class="card channel"><div class="channel-order">' + (Encode-Html $channel.순서) + '</div><h3>' + (Encode-Html $channel.채널) + '</h3><p><span class="label">쓰는 이유</span><br>' + (Encode-Html $channel.'왜 쓰는가') + '</p><p><span class="label">시작 조건</span><br>' + (Encode-Html $channel.'시작 조건') + '</p><p><span class="label">확대 조건</span><br>' + (Encode-Html $channel.'확대 조건') + '</p>' + (Render-Status $channel.상태) + '</article>')
}
$growthContent = @"
<div class="verdict"><strong>핵심 전략</strong><p>일반 B2C가 아니라 업무형 개인을 모으고, 잘 쓰는 사람만 팀·대행사 영업으로 연결합니다.</p></div>
<section class="section"><div class="section-head"><div><h2>광고는 이 순서로</h2><p class="section-sub">네 채널을 같은 날 크게 시작하지 않습니다.</p></div></div><div class="grid">$($channelBuilder.ToString())</div></section>
<section class="section"><div class="section-head"><div><h2>초기 학습 예산 가설</h2><p class="section-sub">앞 채널이 준비되지 않으면 뒤 채널을 켜지 않습니다.</p></div></div><div class="card"><div class="budget" aria-label="네이버 40, Google 30, Meta 20, TikTok 10"><span class="naver">N 40</span><span class="google">G 30</span><span class="meta">M 20</span><span class="tiktok">T 10</span></div></div></section>
<section class="section"><div class="section-head"><div><h2>개인에서 B2B로</h2><p class="section-sub">가입자 수보다 제품을 실제로 쓴 흔적이 중요합니다.</p></div></div><div class="timeline"><span>광고·검색</span><span>첫 리포트 완성</span><span>4주 반복 사용</span><span>팀 의도 → 영업</span></div></section>
<section class="section"><div class="grid"><article class="card"><h3>확대해도 되는 신호</h3><p>첫 리포트 완성, 유료 전환, 4주 활성, 허용 가능한 활성 고객 CAC, 팀 의도 발생</p></article><article class="card"><h3>멈춰야 하는 신호</h3><p>클릭과 가입만 증가, 제품 첫 가치 미도달, 높은 이탈, 원가 미측정, 팀 전환 신호 없음</p></article></div></section>
"@
New-Page 'growth.html' '광고와 판매' 'ACQUIRE → ACTIVATE → EXPAND' '광고는 가입자를 사는 일이 아니라, 반복 사용자를 찾는 일입니다.' '네이버와 Google에서 고의도 사용자를 먼저 찾고, Meta와 TikTok은 검증된 소재와 리타게팅에 사용합니다.' $growthContent $generatedAt $sourceHash

# Partnership page
$levelBuilder = [System.Text.StringBuilder]::new()
foreach ($level in $levels) {
    [void]$levelBuilder.Append('<article class="card"><h3>' + (Encode-Html $level.구간) + '</h3><p><span class="label">내 역할</span><br>' + (Encode-Html $level.'내가 맡는 일') + '</p><p><span class="label">받을 조건</span><br><strong>' + (Encode-Html $level.'받을 조건') + '</strong></p><p><span class="label">다음 단계 증거</span><br>' + (Encode-Html $level.'다음 구간으로 가는 증거') + '</p></article>')
}
$scriptSection = Get-SectionText -Text $partnershipText -Heading '9. 제안 대화문'
$scriptMatch = [regex]::Match($scriptSection, '(?ms)```text\s*(.*?)\s*```')
$conversation = if ($scriptMatch.Success) { $scriptMatch.Groups[1].Value.Trim() } else { '14_gtm_compensation_partnership_framework.md의 제안 대화문을 확인하세요.' }
$partnershipContent = @"
<div class="verdict"><strong>객관적 판정</strong><p>15%는 거절할 숫자도, 바로 수락할 숫자도 아닙니다. 역할·갱신·비용·정산·종료 조건을 붙인 90일 시험의 출발점으로만 봅니다.</p></div>
<section class="section"><div class="section-head"><div><h2>조건은 이렇게 커집니다</h2><p class="section-sub">성과와 책임이 커질 때 보상과 권리도 함께 커집니다.</p></div></div><div class="ladder">$($levelBuilder.ToString())</div></section>
<section class="section"><div class="section-head"><div><h2>전체 전략 공유 전에 확인할 것</h2><p class="section-sub">파트너라는 호칭보다 아래 항목이 계약에 있는지가 중요합니다.</p></div></div><ul class="checklist"><li>15% 계산 기준</li><li>최초 결제와 갱신·업셀 인정 기간</li><li>광고비·도구비·콘텐츠 비용 부담</li><li>CRM·결제·환불 내역 열람</li><li>고객 귀속 기준</li><li>월 정산서와 지급일</li><li>가격·할인·환불 협의</li><li>종료 후 기존 고객의 수수료 보호</li><li>GTM 문서·광고 계정·고객 데이터 사용권</li><li>제품 장애와 고객지원 책임</li></ul></section>
<section class="section"><div class="section-head"><div><h2>그대로 보낼 제안문</h2><p class="section-sub">상대방에게 맞게 이름과 숫자만 조정하세요.</p></div><button class="button secondary" type="button" data-copy="deal-script">문장 복사</button></div><textarea class="script-box" id="deal-script" readonly>$(Encode-Html $conversation)</textarea></section>
<p class="muted">서명 전 법률·세무 검토가 필요합니다. <a href="../14_gtm_compensation_partnership_framework.md">전체 판단 근거 보기</a></p>
"@
New-Page 'partnership.html' '협업 조건' '15% → 90 DAYS → PARTNERSHIP' '파트너라는 이름보다, 성과에 따라 커지는 권리를 요구합니다.' '현재 전략의 가치는 아직 매출로 검증되지 않았습니다. 그래서 즉시 동등 지분도, 조건 없는 15%도 아닌 단계형 합의가 가장 공정합니다.' $partnershipContent $generatedAt $sourceHash

# Roles page
$roleBuilder = [System.Text.StringBuilder]::new()
foreach ($persona in $personas) {
    $directory = Join-Path (Join-Path $projectRoot 'personas') ([string]$persona.Directory)
    $state = Get-PersonaValues (Join-Path $directory 'state.md') 'Harness State'
    $output = Get-PersonaValues (Join-Path $directory 'output.md') 'Dashboard Output'
    [void]$roleBuilder.Append('<article class="card role-card"><div class="section-head"><div><div class="label">' + (Encode-Html $persona.ID) + '</div><h3>' + (Encode-Html $persona.페르소나) + '</h3></div>' + (Render-Status $state['상태']) + '</div><dl><div><dt>지금 하는 일</dt><dd>' + (Encode-Html $state['현재 과업']) + '</dd></div><div><dt>현재 결론</dt><dd>' + (Encode-Html $output['결론']) + '</dd></div><div><dt>다음 행동</dt><dd>' + (Encode-Html $output['제안']) + '</dd></div><div><dt>막힌 것</dt><dd>' + (Encode-Html $state['차단 요인']) + '</dd></div></dl><p class="muted"><a href="../personas/' + (Encode-Html $persona.Directory) + '/output.md">출력 열기</a> · <a href="../personas/' + (Encode-Html $persona.Directory) + '/state.md">상태 열기</a></p></article>')
}
$rolesContent = '<div class="notice"><strong>읽는 법</strong>내 질문과 관련된 역할 하나만 먼저 보세요. 상세 근거가 필요할 때만 연결 문서를 엽니다.</div><section class="section"><div class="role-grid">' + $roleBuilder.ToString() + '</div></section>'
New-Page 'roles.html' '역할별 현황' '7 PERSONAS' '각 역할이 무엇을 판단했고, 어디서 막혔는지 봅니다.' '전략·고객·제품·판매·재무·기술·리스크를 섞지 않고 필요한 역할만 선택합니다.' $rolesContent $generatedAt $sourceHash

# Preserve detailed dashboard as evidence page.
$legacyHtml = Get-Content -Raw -Encoding UTF8 -LiteralPath $legacyPath
if ($legacyHtml -notmatch '<base\s') { $legacyHtml = $legacyHtml.Replace('<head>', '<head>' + [Environment]::NewLine + '  <base href="../">') }
$evidenceBar = '<div style="position:sticky;top:0;z-index:99;padding:10px 18px;background:#173d4a;color:white;font:700 13px Segoe UI,sans-serif"><a href="dashboard/index.html" style="color:white">← 쉬운 실행판으로 돌아가기</a><span style="margin-left:14px;opacity:.75">이 화면은 전체 표와 근거를 보는 상세판입니다.</span></div>'
$legacyHtml = $legacyHtml.Replace('<body>', '<body>' + $evidenceBar)
Set-Content -LiteralPath (Join-Path $dashboardRoot 'evidence.html') -Value $legacyHtml -Encoding UTF8

# Keep the old entry path working.
$rootHtml = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=dashboard/index.html"><title>BIGSEE 실행판</title></head><body><p><a href="dashboard/index.html">BIGSEE 실행판 열기</a></p></body></html>'
Set-Content -LiteralPath $legacyPath -Value $rootHtml -Encoding UTF8

Write-Output "Dashboard pages generated: $dashboardRoot"
Write-Output 'Pages: index, stages, growth, partnership, roles, evidence'
Write-Output "Source hash: $sourceHash"


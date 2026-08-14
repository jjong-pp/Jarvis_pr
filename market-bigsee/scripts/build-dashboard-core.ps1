$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$statusPath = Join-Path $projectRoot 'control/00_project_status.md'
$decisionPath = Join-Path $projectRoot 'control/08_decision_log.md'
$validationPath = Join-Path $projectRoot 'control/09_validation_board.md'
$outputPath = Join-Path $projectRoot 'dashboard.html'

foreach ($required in @($statusPath, $decisionPath, $validationPath)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required source file not found: $required"
    }
}

function Get-SectionText {
    param(
        [string]$Text,
        [string]$Heading
    )

    $pattern = '(?ms)^##\s+' + [regex]::Escape($Heading) + '\s*\r?\n(.*?)(?=^##\s+|\z)'
    $match = [regex]::Match($Text, $pattern)
    if (-not $match.Success) {
        throw "Markdown section not found: $Heading"
    }
    return $match.Groups[1].Value.Trim()
}

function Split-MarkdownRow {
    param([string]$Line)
    return @($Line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
}

function Get-MarkdownTable {
    param(
        [string]$Text,
        [string]$Heading
    )

    $section = Get-SectionText -Text $Text -Heading $Heading
    $lines = @($section -split '\r?\n' | Where-Object { $_.Trim().StartsWith('|') })
    if ($lines.Count -lt 2) {
        throw "Markdown table not found in section: $Heading"
    }

    $headers = Split-MarkdownRow -Line $lines[0]
    $rows = @()
    for ($index = 2; $index -lt $lines.Count; $index++) {
        $cells = Split-MarkdownRow -Line $lines[$index]
        if ($cells.Count -eq 0) { continue }
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows += [pscustomobject]$record
    }
    return $rows
}

function Encode-Html {
    param([AllowEmptyString()][string]$Text)
    return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Get-StatusClass {
    param([string]$Status)
    switch -Regex ($Status) {
        '확정|완료|채택|통과' { return 'positive' }
        '진행|기획|대응 설계|통제 도입' { return 'active' }
        '주의|P0|미해결|기각' { return 'danger' }
        'P1|미검증|미측정|증거 대기' { return 'warning' }
        '보류|대기|미시작' { return 'neutral' }
        default { return 'neutral' }
    }
}

function Render-Status {
    param([string]$Status)
    $className = Get-StatusClass -Status $Status
    return '<span class="status status-' + $className + '">' + (Encode-Html $Status) + '</span>'
}

function Render-SourceLink {
    param([string]$FileName)
    $encoded = Encode-Html $FileName
    if ($FileName -match '^(?!.*\.\.)[0-9A-Za-z_./\-가-힣]+\.md$' -and (Test-Path -LiteralPath (Join-Path $projectRoot $FileName))) {
        return '<a class="source-link" href="' + $encoded + '">' + $encoded + '</a>'
    }
    return $encoded
}

function Render-Table {
    param(
        [array]$Rows,
        [array]$Columns,
        [hashtable]$Labels,
        [array]$StatusColumns = @(),
        [array]$SourceColumns = @(),
        [array]$PriorityColumns = @()
    )

    $builder = [System.Text.StringBuilder]::new()
    [void]$builder.Append('<div class="table-wrap"><table><thead><tr>')
    foreach ($column in $Columns) {
        $label = if ($Labels.ContainsKey($column)) { $Labels[$column] } else { $column }
        [void]$builder.Append('<th scope="col">' + (Encode-Html $label) + '</th>')
    }
    [void]$builder.Append('</tr></thead><tbody>')

    foreach ($row in $Rows) {
        [void]$builder.Append('<tr>')
        foreach ($column in $Columns) {
            $value = [string]$row.$column
            $cell = Encode-Html $value
            if ($StatusColumns -contains $column) {
                $cell = Render-Status -Status $value
            } elseif ($SourceColumns -contains $column) {
                $cell = Render-SourceLink -FileName $value
            } elseif ($PriorityColumns -contains $column) {
                $cell = '<span class="priority priority-' + ($value.ToLower()) + '">' + (Encode-Html $value) + '</span>'
            }
            [void]$builder.Append('<td>' + $cell + '</td>')
        }
        [void]$builder.Append('</tr>')
    }
    [void]$builder.Append('</tbody></table></div>')
    return $builder.ToString()
}

$statusText = Get-Content -Raw -Encoding UTF8 -LiteralPath $statusPath
$decisionText = Get-Content -Raw -Encoding UTF8 -LiteralPath $decisionPath
$validationText = Get-Content -Raw -Encoding UTF8 -LiteralPath $validationPath

$overviewRows = Get-MarkdownTable -Text $statusText -Heading '기본 현황'
$overview = @{}
foreach ($row in $overviewRows) { $overview[$row.항목] = $row.값 }

$areaRows = Get-MarkdownTable -Text $statusText -Heading '영역별 상태'
$roadmapRows = Get-MarkdownTable -Text $statusText -Heading '90일 단계'
$metricRows = Get-MarkdownTable -Text $statusText -Heading '핵심 지표'
$riskRows = Get-MarkdownTable -Text $statusText -Heading '상위 리스크'
$questionRows = Get-MarkdownTable -Text $statusText -Heading '다음 의사결정'
$actionRows = Get-MarkdownTable -Text $statusText -Heading '지금 할 일'
$decisionRows = Get-MarkdownTable -Text $decisionText -Heading '결정 목록'
$proposalRows = Get-MarkdownTable -Text $decisionText -Heading '제안 상태의 결정'
$hypothesisRows = Get-MarkdownTable -Text $validationText -Heading '핵심 가설'
$evidenceRows = Get-MarkdownTable -Text $validationText -Heading '증거 기록'

$markdownFiles = @(Get-ChildItem -LiteralPath $projectRoot -Filter '*.md' -Recurse | Where-Object { $_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)
$allMarkdown = [System.Text.StringBuilder]::new()
foreach ($file in $markdownFiles) {
    [void]$allMarkdown.AppendLine($file.FullName.Substring($projectRoot.Length))
    [void]$allMarkdown.AppendLine((Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName))
}

$sha = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($allMarkdown.ToString()))
$sourceHash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant().Substring(0, 16)
$totalBytes = ($markdownFiles | Measure-Object Length -Sum).Sum
$approxTokens = [math]::Round($totalBytes / 3.2)
$statusBytes = (Get-Item -LiteralPath $statusPath).Length
$statusApproxTokens = [math]::Round($statusBytes / 3.2)
$tokenReduction = if ($approxTokens -gt 0) { [math]::Round((1 - ($statusApproxTokens / $approxTokens)) * 100) } else { 0 }
$generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'

$businessScore = 0
if ($overview['사업성 평가'] -match '^(\d+)') { $businessScore = [int]$matches[1] }

$areaTable = Render-Table -Rows $areaRows -Columns @('영역','상태','현재 근거','다음 게이트','정본') -Labels @{} -StatusColumns @('상태') -SourceColumns @('정본')
$metricTable = Render-Table -Rows $metricRows -Columns @('지표','현재','90일 목표·통과 기준','측정 시작 조건','정본') -Labels @{} -StatusColumns @('현재') -SourceColumns @('정본')
$riskTable = Render-Table -Rows $riskRows -Columns @('등급','리스크','현재 영향','대응','상태','정본') -Labels @{} -StatusColumns @('상태') -SourceColumns @('정본') -PriorityColumns @('등급')
$questionTable = Render-Table -Rows $questionRows -Columns @('ID','결정','필요한 증거','결정 시점','상태') -Labels @{} -StatusColumns @('상태')
$actionTable = Render-Table -Rows $actionRows -Columns @('우선순위','행동','완료 조건','상태') -Labels @{} -StatusColumns @('상태')
$decisionTable = Render-Table -Rows $decisionRows -Columns @('ID','날짜','상태','결정','이유','주요 결과') -Labels @{} -StatusColumns @('상태')
$proposalTable = Render-Table -Rows $proposalRows -Columns @('ID','제안','결정에 필요한 증거','담당','상태') -Labels @{} -StatusColumns @('상태')
$hypothesisTable = Render-Table -Rows $hypothesisRows -Columns @('ID','우선순위','가설','시험','통과 기준','현재 증거','다음 행동','상태') -Labels @{} -StatusColumns @('상태') -PriorityColumns @('우선순위')
$evidenceTable = Render-Table -Rows $evidenceRows -Columns @('날짜','가설 ID','증거 유형','관찰·수치','출처','신뢰도','판단 영향') -Labels @{} -SourceColumns @('출처')

$roadmapBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $roadmapRows) {
    $statusClass = Get-StatusClass -Status $row.상태
    [void]$roadmapBuilder.Append(@"
<article class="roadmap-step roadmap-$statusClass">
  <div class="roadmap-marker" aria-hidden="true"></div>
  <div class="roadmap-copy">
    <div class="roadmap-top"><h3>$(Encode-Html $row.단계)</h3>$(Render-Status $row.상태)</div>
    <p class="roadmap-period">$(Encode-Html $row.기간)</p>
    <p>$(Encode-Html $row.'완료 조건')</p>
    <p class="next-action"><strong>다음:</strong> $(Encode-Html $row.'바로 다음 행동')</p>
    $(Render-SourceLink $row.정본)
  </div>
</article>
"@)
}

$documentRoles = @{
    'README.md' = '문서 지도'
    'control/00_project_status.md' = '현재 상태 정본'
    'personas/01_strategy_ceo/reference/01_service_current_state.md' = '서비스·사업 현황'
    'personas/01_strategy_ceo/reference/02_sales_management_strategy.md' = '판매·경영 전략'
    'personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md' = '이커머스 흐름'
    'personas/03_product_growth/reference/04_feature_expansion_plan.md' = '기능 확장 기획'
    'personas/06_technology_data/reference/05_data_api_architecture.md' = '데이터·API 구조'
    'personas/02_customer_market/reference/06_competitor_benchmark.md' = '경쟁사 벤치마크'
    'personas/01_strategy_ceo/reference/07_competitor_strategy_actions.md' = '경쟁 대응 실행안'
    'control/08_decision_log.md' = '결정 이력'
    'control/09_validation_board.md' = '가설·검증 대장'
    'system/10_operating_manual.md' = '운영 규약'
    'system/11_operating_system_research.md' = '운영 방식 평가·근거'
    'system/12_persona_harness.md' = '페르소나 하네스 계약'
    'personas/04_sales_marketing/reference/13_it_saas_gtm_paid_acquisition.md' = 'IT·SaaS GTM 전략'
    'personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md' = 'GTM 보상·협업 조건'
    'control/15_execution_control.md' = '실행 통제'
}

$documentBuilder = [System.Text.StringBuilder]::new()
foreach ($file in $markdownFiles) {
    $relativePath = $file.FullName.Substring($projectRoot.Length).TrimStart([char[]]"\/").Replace('\', '/')
    $titleLine = Get-Content -Encoding UTF8 -TotalCount 1 -LiteralPath $file.FullName
    $title = ([string]$titleLine) -replace '^#\s+', ''
    $role = if ($documentRoles.ContainsKey($relativePath)) { $documentRoles[$relativePath] } else { '상세 문서' }
    $modified = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
    [void]$documentBuilder.Append(@"
<a class="doc-row" href="$(Encode-Html $relativePath)" data-doc="$(Encode-Html ($relativePath + ' ' + $title + ' ' + $role))">
  <span class="doc-name">$(Encode-Html $relativePath)</span>
  <span class="doc-title">$(Encode-Html $title)</span>
  <span class="doc-role">$(Encode-Html $role)</span>
  <span class="doc-date">$(Encode-Html $modified)</span>
</a>
"@)
}
$feedbackOptions = [System.Text.StringBuilder]::new()
foreach ($row in $questionRows) {
    $value = '[' + $row.ID + '] ' + $row.결정
    [void]$feedbackOptions.Append('<option value="' + (Encode-Html $value) + '">' + (Encode-Html $value) + '</option>')
}
foreach ($row in $riskRows | Where-Object { $_.상태 -ne '완료' }) {
    $value = '[' + $row.등급 + ' 위험] ' + $row.리스크
    [void]$feedbackOptions.Append('<option value="' + (Encode-Html $value) + '">' + (Encode-Html $value) + '</option>')
}

$template = @'
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>마켓빅시 사업 운영 대시보드</title>
  <style>
    :root {
      --bg: #f3f6f8;
      --surface: #ffffff;
      --surface-2: #e9eff3;
      --text: #15232d;
      --muted: #657580;
      --line: #d6e0e5;
      --brand: #113a4a;
      --brand-2: #1a6c74;
      --accent: #d78743;
      --good: #1c7a58;
      --good-bg: #e2f4ec;
      --active: #216a85;
      --active-bg: #e3f1f6;
      --warn: #9a611f;
      --warn-bg: #fff1d9;
      --danger: #a03c3c;
      --danger-bg: #fde8e7;
      --neutral: #667780;
      --neutral-bg: #ebf0f2;
      --shadow: 0 14px 40px rgba(17, 58, 74, 0.08);
      --radius: 18px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d171d;
        --surface: #142229;
        --surface-2: #1b2c34;
        --text: #edf4f5;
        --muted: #9babb2;
        --line: #2d414a;
        --brand: #7fc1ca;
        --brand-2: #5ab0ac;
        --accent: #e5a365;
        --good: #72caa6;
        --good-bg: #183c31;
        --active: #78bed4;
        --active-bg: #173846;
        --warn: #e6b56f;
        --warn-bg: #3f301d;
        --danger: #ef9792;
        --danger-bg: #482726;
        --neutral: #a8b6bc;
        --neutral-bg: #26363d;
        --shadow: 0 18px 46px rgba(0, 0, 0, 0.24);
      }
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    button, input, select { font: inherit; }
    a { color: var(--brand-2); }
    .shell { max-width: 1480px; margin: 0 auto; padding: 24px; }
    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
      margin-bottom: 20px;
      color: var(--muted);
      font-size: 13px;
    }
    .brand-lockup { display: flex; align-items: center; gap: 12px; color: var(--text); font-weight: 750; }
    .brand-mark {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px;
      background: var(--brand); color: var(--bg); font-weight: 850; letter-spacing: -0.08em;
    }
    .generated { text-align: right; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.45fr);
      gap: 20px;
      padding: 34px;
      border-radius: 26px;
      background: linear-gradient(135deg, #103b4b 0%, #155865 58%, #357d78 100%);
      color: #f7fbfc;
      box-shadow: var(--shadow);
      overflow: hidden;
      position: relative;
    }
    .hero::after {
      content: ""; position: absolute; width: 360px; height: 360px; border-radius: 50%;
      right: -110px; top: -210px; background: rgba(255,255,255,.08);
    }
    .eyebrow { margin: 0 0 8px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; opacity: .72; }
    h1 { margin: 0; font-size: clamp(30px, 5vw, 56px); line-height: 1.04; letter-spacing: -.055em; }
    .hero-copy { max-width: 880px; margin: 16px 0 0; color: rgba(247,251,252,.78); font-size: 17px; }
    .hero-side { align-self: end; position: relative; z-index: 1; }
    .hero-status { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; font-size: 13px; }
    .hero-status-dot { width: 9px; height: 9px; border-radius: 50%; background: #f4b868; box-shadow: 0 0 0 5px rgba(244,184,104,.14); }
    .hero-gate { margin: 0; font-size: 18px; font-weight: 720; line-height: 1.4; }
    .hero-note { margin: 10px 0 0; font-size: 12px; color: rgba(247,251,252,.65); }
    .stats { display: grid; grid-template-columns: 1.1fr .65fr .8fr .8fr; gap: 14px; margin: 18px 0; }
    .stat { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; }
    .stat-label { display: block; color: var(--muted); font-size: 12px; margin-bottom: 9px; }
    .stat-value { font-size: 21px; font-weight: 790; letter-spacing: -.025em; }
    .stat-context { color: var(--muted); font-size: 12px; margin-top: 8px; }
    .score-row { display: flex; gap: 14px; align-items: center; }
    .score-ring {
      --score: 0;
      width: 58px; height: 58px; border-radius: 50%;
      display: grid; place-items: center;
      background: conic-gradient(var(--accent) calc(var(--score) * 1%), var(--surface-2) 0);
      position: relative; flex: 0 0 auto;
    }
    .score-ring::before { content: ""; position: absolute; inset: 7px; border-radius: 50%; background: var(--surface); }
    .score-ring strong { position: relative; font-size: 14px; }
    .loop {
      display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px;
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px;
    }
    .loop-step { min-width: 0; padding: 13px 12px; background: var(--surface-2); border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center; position: relative; }
    .loop-step:not(:last-child)::after { content: "→"; position: absolute; right: -10px; top: 50%; transform: translateY(-50%); color: var(--accent); z-index: 2; }
    .tabs { display: flex; gap: 8px; margin: 20px 0 16px; flex-wrap: wrap; }
    .tab {
      border: 1px solid var(--line); background: var(--surface); color: var(--muted);
      padding: 9px 15px; border-radius: 999px; cursor: pointer;
    }
    .tab[aria-selected="true"] { background: var(--brand); border-color: var(--brand); color: var(--bg); }
    .panel { display: none; }
    .panel.is-active { display: block; }
    .grid-2 { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr); gap: 18px; }
    .section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; margin-bottom: 18px; box-shadow: 0 4px 18px rgba(17,58,74,.035); }
    .section-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 16px; }
    .section h2 { margin: 0; font-size: 18px; letter-spacing: -.025em; }
    .section-sub { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .table-wrap { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; font-size: 13px; }
    th { color: var(--muted); font-size: 11px; text-align: left; font-weight: 700; letter-spacing: .025em; }
    th, td { padding: 12px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
    tbody tr:last-child td { border-bottom: 0; }
    tbody tr:hover { background: color-mix(in srgb, var(--surface-2) 55%, transparent); }
    .status, .priority { display: inline-flex; align-items: center; white-space: nowrap; border-radius: 999px; padding: 4px 8px; font-size: 11px; font-weight: 750; }
    .status-positive { color: var(--good); background: var(--good-bg); }
    .status-active { color: var(--active); background: var(--active-bg); }
    .status-warning { color: var(--warn); background: var(--warn-bg); }
    .status-danger { color: var(--danger); background: var(--danger-bg); }
    .status-neutral { color: var(--neutral); background: var(--neutral-bg); }
    .priority-p0 { color: var(--danger); background: var(--danger-bg); }
    .priority-p1 { color: var(--warn); background: var(--warn-bg); }
    .source-link { font-size: 11px; white-space: nowrap; text-decoration: none; border-bottom: 1px solid currentColor; }
    .roadmap { position: relative; }
    .roadmap::before { content: ""; position: absolute; left: 8px; top: 14px; bottom: 14px; width: 2px; background: var(--line); }
    .roadmap-step { position: relative; display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 14px; padding-bottom: 19px; }
    .roadmap-step:last-child { padding-bottom: 0; }
    .roadmap-marker { width: 18px; height: 18px; border-radius: 50%; border: 4px solid var(--surface); background: var(--neutral); z-index: 1; box-shadow: 0 0 0 1px var(--line); }
    .roadmap-active .roadmap-marker { background: var(--active); }
    .roadmap-positive .roadmap-marker { background: var(--good); }
    .roadmap-danger .roadmap-marker { background: var(--danger); }
    .roadmap-top { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
    .roadmap-top h3 { margin: 0; font-size: 15px; }
    .roadmap-copy p { margin: 5px 0; font-size: 13px; }
    .roadmap-period { color: var(--muted); font-size: 11px !important; }
    .next-action { color: var(--brand-2); }
    .feedback-box { display: grid; gap: 10px; }
    .feedback-box select, .feedback-box textarea, .doc-search {
      width: 100%; border: 1px solid var(--line); background: var(--bg); color: var(--text);
      border-radius: 11px; padding: 10px 12px;
    }
    .feedback-box textarea { min-height: 96px; resize: vertical; }
    .button-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .button {
      border: 1px solid var(--brand); background: var(--brand); color: var(--bg);
      border-radius: 10px; padding: 9px 13px; cursor: pointer; font-weight: 700;
    }
    .button-secondary { background: transparent; color: var(--brand); }
    .copy-state { color: var(--muted); font-size: 12px; }
    .doc-head, .doc-row { display: grid; grid-template-columns: 210px minmax(220px, 1fr) 160px 130px; gap: 14px; align-items: center; }
    .doc-head { color: var(--muted); font-size: 11px; padding: 0 10px 8px; }
    .doc-row { color: var(--text); text-decoration: none; padding: 11px 10px; border-top: 1px solid var(--line); }
    .doc-row:hover { background: var(--surface-2); }
    .doc-name { color: var(--brand-2); font-family: Consolas, monospace; font-size: 12px; }
    .doc-title { font-weight: 700; }
    .doc-role, .doc-date { color: var(--muted); font-size: 12px; }
    .integrity { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .integrity-item { padding: 12px; background: var(--surface-2); border-radius: 12px; }
    .integrity-item small { display: block; color: var(--muted); margin-bottom: 5px; }
    .integrity-item code { font-size: 12px; overflow-wrap: anywhere; }
    .footer { display: flex; justify-content: space-between; gap: 18px; margin-top: 22px; color: var(--muted); font-size: 11px; }
    .stale { color: var(--danger); font-weight: 700; }

    @media (max-width: 1050px) {
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-2 { grid-template-columns: 1fr; }
      .doc-head, .doc-row { grid-template-columns: 180px minmax(220px, 1fr) 130px; }
      .doc-date { display: none; }
    }
    @media (max-width: 720px) {
      .shell { padding: 14px; }
      .hero { grid-template-columns: 1fr; padding: 24px; }
      .stats { grid-template-columns: 1fr; }
      .loop { grid-template-columns: 1fr; }
      .loop-step:not(:last-child)::after { content: "↓"; right: 50%; top: auto; bottom: -14px; transform: translateX(50%); }
      .topbar, .footer { align-items: flex-start; flex-direction: column; }
      .generated { text-align: left; }
      .section { padding: 17px; }
      .doc-head { display: none; }
      .doc-row { grid-template-columns: 1fr; gap: 3px; }
      .doc-date { display: block; }
      .integrity { grid-template-columns: 1fr; }
    }
    @media print {
      body { background: #fff; color: #111; }
      .tabs, .feedback-box, .doc-search { display: none !important; }
      .panel { display: block !important; }
      .section, .stat, .hero { box-shadow: none; break-inside: avoid; }
      .hero { background: #143e4b; }
      .shell { max-width: none; padding: 0; }
    }
  </style>
</head>
<body>
<main class="shell">
  <header class="topbar">
    <div class="brand-lockup"><span class="brand-mark">B</span><span>BIGSEE · Business OS</span></div>
    <div class="generated">MD 정본에서 자동 생성 · <span id="freshness">마지막 현황 {{UPDATED}}</span><br>생성 {{GENERATED}}</div>
  </header>

  <section class="hero" aria-labelledby="page-title">
    <div>
      <p class="eyebrow">Market intelligence to measurable commerce</p>
      <h1 id="page-title">조사에서 매출 증명까지</h1>
      <p class="hero-copy">{{LOOP}}</p>
    </div>
    <div class="hero-side">
      <div class="hero-status"><span class="hero-status-dot" aria-hidden="true"></span><span>{{PHASE}}</span></div>
      <p class="hero-gate">다음 게이트<br>{{NEXT_GATE}}</p>
      <p class="hero-note">HTML은 읽기 전용입니다. 내용 변경은 연결된 Markdown에 반영합니다.</p>
    </div>
  </section>

  <section class="stats" aria-label="핵심 현황">
    <article class="stat">
      <span class="stat-label">첫 고객과 판매 상황</span>
      <div class="stat-value">{{FIRST_CUSTOMER}}</div>
      <div class="stat-context">{{FIRST_JOB}}</div>
    </article>
    <article class="stat">
      <span class="stat-label">사업성 1차 평가</span>
      <div class="score-row">
        <div class="score-ring" style="--score: {{SCORE}}" role="img" aria-label="사업성 평가 {{SCORE}}점"><strong>{{SCORE}}</strong></div>
        <div><div class="stat-value">검증 전</div><div class="stat-context">공개 자료 기반</div></div>
      </div>
    </article>
    <article class="stat">
      <span class="stat-label">정본 컨텍스트</span>
      <div class="stat-value">{{DOC_COUNT}}개 MD</div>
      <div class="stat-context">전체 약 {{ALL_TOKENS}} 토큰 · 현황 약 {{STATUS_TOKENS}} 토큰</div>
    </article>
    <article class="stat">
      <span class="stat-label">선택적 로딩 절감 추정</span>
      <div class="stat-value">약 {{TOKEN_REDUCTION}}%</div>
      <div class="stat-context">현황 정본만 먼저 읽을 때의 단순 파일 크기 환산</div>
    </article>
  </section>

  <section class="loop" aria-label="제품 핵심 루프">
    <div class="loop-step">시장·키워드 조사</div>
    <div class="loop-step">콘텐츠 초안</div>
    <div class="loop-step">SKU·캠페인 연결</div>
    <div class="loop-step">구매·환불 측정</div>
    <div class="loop-step">다음 실행 추천</div>
  </section>

  <nav class="tabs" aria-label="대시보드 화면">
    <button class="tab" type="button" role="tab" aria-selected="true" aria-controls="overview-panel" data-tab="overview-panel">현재 현황</button>
    <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="validation-panel" data-tab="validation-panel">결정·검증</button>
    <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="knowledge-panel" data-tab="knowledge-panel">정본 문서</button>
  </nav>

  <section class="panel is-active" id="overview-panel" role="tabpanel">
    <div class="section">
      <div class="section-head"><div><h2>사업 영역별 상태</h2><p class="section-sub">점수 대신 확인된 근거와 다음 게이트를 표시합니다.</p></div></div>
      {{AREA_TABLE}}
    </div>
    <div class="grid-2">
      <div>
        <div class="section">
          <div class="section-head"><div><h2>90일 검증 로드맵</h2><p class="section-sub">선행 증거가 생겨야 다음 단계로 이동합니다.</p></div></div>
          <div class="roadmap">{{ROADMAP}}</div>
        </div>
        <div class="section">
          <div class="section-head"><div><h2>핵심 지표</h2><p class="section-sub">실측 전 수치를 0으로 표현하지 않습니다.</p></div></div>
          {{METRIC_TABLE}}
        </div>
      </div>
      <aside>
        <div class="section">
          <div class="section-head"><div><h2>지금 할 일</h2><p class="section-sub">전략 문서보다 먼저 실행할 순서입니다.</p></div></div>
          {{ACTION_TABLE}}
        </div>
        <div class="section">
          <div class="section-head"><div><h2>대시보드 피드백 준비</h2><p class="section-sub">항목을 선택하고 의견을 적은 뒤 복사해 대화에 붙여넣으세요.</p></div></div>
          <div class="feedback-box">
            <label for="feedback-item">피드백 대상</label>
            <select id="feedback-item">{{FEEDBACK_OPTIONS}}</select>
            <label for="feedback-note">의견 또는 새로운 정보</label>
            <textarea id="feedback-note" placeholder="예: 카페24를 쓰는 대행사 고객이 더 많음. 첫 연동 우선순위를 바꾸자."></textarea>
            <div class="button-row"><button class="button" type="button" id="copy-feedback">피드백 문장 복사</button><span class="copy-state" id="copy-state" aria-live="polite"></span></div>
          </div>
        </div>
      </aside>
    </div>
    <div class="section">
      <div class="section-head"><div><h2>상위 리스크</h2><p class="section-sub">P0가 해결되기 전 확장 투자와 가격 확정을 유보합니다.</p></div></div>
      {{RISK_TABLE}}
    </div>
  </section>

  <section class="panel" id="validation-panel" role="tabpanel">
    <div class="section">
      <div class="section-head"><div><h2>사업 가설</h2><p class="section-sub">의견보다 결제·반복 사용·실측 원가를 강한 증거로 봅니다.</p></div></div>
      {{HYPOTHESIS_TABLE}}
    </div>
    <div class="section">
      <div class="section-head"><div><h2>증거 기록</h2><p class="section-sub">새 고객 행동과 수치를 가설 ID에 연결합니다.</p></div></div>
      {{EVIDENCE_TABLE}}
    </div>
    <div class="section">
      <div class="section-head"><div><h2>채택한 결정</h2><p class="section-sub">바뀐 결정은 삭제하지 않고 새 기록으로 대체합니다.</p></div></div>
      {{DECISION_TABLE}}
    </div>
    <div class="grid-2">
      <div class="section">
        <div class="section-head"><div><h2>제안 상태 결정</h2><p class="section-sub">증거가 생기기 전 확정하지 않습니다.</p></div></div>
        {{PROPOSAL_TABLE}}
      </div>
      <div class="section">
        <div class="section-head"><div><h2>다음 의사결정</h2><p class="section-sub">결정 시점과 필요한 증거를 먼저 정합니다.</p></div></div>
        {{QUESTION_TABLE}}
      </div>
    </div>
  </section>

  <section class="panel" id="knowledge-panel" role="tabpanel">
    <div class="section">
      <div class="section-head"><div><h2>Markdown 정본</h2><p class="section-sub">질문과 직접 관련된 문서만 선택적으로 읽습니다.</p></div></div>
      <label for="doc-search">문서 찾기</label>
      <input class="doc-search" id="doc-search" type="search" placeholder="예: 가격, API, 경쟁사, 검증">
      <div class="doc-head" aria-hidden="true"><span>파일</span><span>제목</span><span>역할</span><span>최종 수정</span></div>
      <div id="document-list">{{DOCUMENT_LIST}}</div>
    </div>
    <div class="grid-2">
      <div class="section">
        <div class="section-head"><div><h2>컨텍스트 로딩 규칙</h2><p class="section-sub">토큰 절감은 HTML이 아니라 선택적 MD 로딩에서 발생합니다.</p></div></div>
        <ol>
          <li><a href="README.md">README.md</a>로 문서 지도를 확인합니다.</li>
          <li><a href="control/00_project_status.md">control/00_project_status.md</a>로 현재 상태를 확인합니다.</li>
          <li>질문과 연결된 상세 MD 1~2개만 읽습니다.</li>
          <li>변경 후 결정·검증 기록을 갱신하고 대시보드를 재생성합니다.</li>
        </ol>
      </div>
      <div class="section">
        <div class="section-head"><div><h2>생성 무결성</h2><p class="section-sub">이 화면은 아래 시점의 Markdown 스냅샷입니다.</p></div></div>
        <div class="integrity">
          <div class="integrity-item"><small>생성 시각</small><code>{{GENERATED}}</code></div>
          <div class="integrity-item"><small>소스 해시</small><code>{{SOURCE_HASH}}</code></div>
          <div class="integrity-item"><small>정본 수</small><code>{{DOC_COUNT}} Markdown</code></div>
        </div>
        <p class="section-sub">직접 편집 금지. <code>scripts/build-dashboard.ps1</code>로 다시 생성합니다.</p>
      </div>
    </div>
  </section>

  <footer class="footer"><span>Source of truth: Markdown · View: generated HTML</span><span>BIGSEE Business OS · {{SOURCE_HASH}}</span></footer>
</main>

<script>
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.panel')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === tab.dataset.tab));
    });
  });

  const search = document.getElementById('doc-search');
  const docs = [...document.querySelectorAll('[data-doc]')];
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    docs.forEach((doc) => { doc.hidden = query && !doc.dataset.doc.toLowerCase().includes(query); });
  });

  const feedbackItem = document.getElementById('feedback-item');
  const feedbackNote = document.getElementById('feedback-note');
  const copyState = document.getElementById('copy-state');
  document.getElementById('copy-feedback').addEventListener('click', async () => {
    const note = feedbackNote.value.trim() || '(의견을 여기에 입력)';
    const text = `마켓빅시 대시보드 피드백\n대상: ${feedbackItem.value}\n내용: ${note}\n이 내용을 정본 MD에 분류·반영하고 dashboard.html을 재생성해줘.`;
    try {
      await navigator.clipboard.writeText(text);
      copyState.textContent = '복사했습니다.';
    } catch (error) {
      feedbackNote.value = text;
      feedbackNote.select();
      copyState.textContent = '클립보드 권한이 없어 입력칸을 선택했습니다.';
    }
  });

  const freshness = document.getElementById('freshness');
  const updated = new Date('{{UPDATED}}T00:00:00+09:00');
  const ageDays = Math.floor((Date.now() - updated.getTime()) / 86400000);
  if (ageDays > 14) {
    freshness.classList.add('stale');
    freshness.textContent = `현황 갱신 후 ${ageDays}일 경과 · 재검토 필요`;
  }
</script>
</body>
</html>
'@

$replacements = [ordered]@{
    '{{UPDATED}}' = Encode-Html $overview['마지막 갱신']
    '{{GENERATED}}' = Encode-Html $generatedAt
    '{{LOOP}}' = Encode-Html $overview['핵심 루프']
    '{{PHASE}}' = Encode-Html $overview['사업 단계']
    '{{NEXT_GATE}}' = Encode-Html $overview['다음 사업 게이트']
    '{{FIRST_CUSTOMER}}' = Encode-Html $overview['첫 고객']
    '{{FIRST_JOB}}' = Encode-Html $overview['첫 판매 상황']
    '{{SCORE}}' = [string]$businessScore
    '{{DOC_COUNT}}' = [string]$markdownFiles.Count
    '{{ALL_TOKENS}}' = ('{0:N0}' -f $approxTokens)
    '{{STATUS_TOKENS}}' = ('{0:N0}' -f $statusApproxTokens)
    '{{TOKEN_REDUCTION}}' = [string]$tokenReduction
    '{{AREA_TABLE}}' = $areaTable
    '{{ROADMAP}}' = $roadmapBuilder.ToString()
    '{{METRIC_TABLE}}' = $metricTable
    '{{RISK_TABLE}}' = $riskTable
    '{{ACTION_TABLE}}' = $actionTable
    '{{HYPOTHESIS_TABLE}}' = $hypothesisTable
    '{{EVIDENCE_TABLE}}' = $evidenceTable
    '{{DECISION_TABLE}}' = $decisionTable
    '{{PROPOSAL_TABLE}}' = $proposalTable
    '{{QUESTION_TABLE}}' = $questionTable
    '{{DOCUMENT_LIST}}' = $documentBuilder.ToString()
    '{{FEEDBACK_OPTIONS}}' = $feedbackOptions.ToString()
    '{{SOURCE_HASH}}' = Encode-Html $sourceHash
}

$html = $template
foreach ($entry in $replacements.GetEnumerator()) {
    $html = $html.Replace($entry.Key, [string]$entry.Value)
}

if ($html -match '\{\{[A-Z_]+\}\}') {
    throw 'Dashboard generation left unresolved placeholders.'
}

Set-Content -LiteralPath $outputPath -Value $html -Encoding UTF8
Write-Output "Generated: $outputPath"
Write-Output "Markdown sources: $($markdownFiles.Count)"
Write-Output "Source hash: $sourceHash"
Write-Output "Approximate context: $approxTokens tokens; status-first: $statusApproxTokens tokens; reduction: $tokenReduction%"







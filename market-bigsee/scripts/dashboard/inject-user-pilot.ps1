$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$indexPath = Join-Path $projectRoot 'dashboard\index.html'
$controlPath = Join-Path $projectRoot 'control\15_execution_control.md'
$pilotPath = Join-Path $projectRoot 'personas\04_sales_marketing\reference\16_existing_user_measurement_ad_pilot.md'

foreach ($required in @($indexPath, $controlPath, $pilotPath)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Pilot source missing: $required" }
}

function Encode-Html {
    param([AllowEmptyString()][string]$Text)
    return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Get-SectionText {
    param([string]$Text, [string]$Heading)
    $pattern = '(?ms)^#{2,3}\s+' + [regex]::Escape($Heading) + '\s*\r?\n(.*?)(?=^#{2,3}\s+|\z)'
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
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows += [pscustomobject]$record
    }
    return $rows
}

$controlText = Get-Content -Raw -Encoding UTF8 -LiteralPath $controlPath
$pilotText = Get-Content -Raw -Encoding UTF8 -LiteralPath $pilotPath
$measureRows = @(Get-MarkdownTable -Text $controlText -Heading '기존 약 20명 계측')
$budgetRows = @(Get-MarkdownTable -Text $controlText -Heading '첫 광고 예산')
$scenarioRows = @(Get-MarkdownTable -Text $pilotText -Heading '결과 시나리오')

$measureBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $measureRows) {
    [void]$measureBuilder.Append('<div class="pilot-metric"><span>' + (Encode-Html $row.'측정') + '</span><strong>' + (Encode-Html $row.'현재') + '</strong><small>' + (Encode-Html $row.'정의') + '</small></div>')
}

$budgetBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $budgetRows) {
    [void]$budgetBuilder.Append('<div class="pilot-budget-row"><span class="pilot-order">' + (Encode-Html $row.'순서') + '</span><div><strong>' + (Encode-Html $row.'채널·용도') + '</strong><small>' + (Encode-Html $row.'기간') + ' · ' + (Encode-Html $row.'시작 조건') + '</small></div><b>' + (Encode-Html $row.'매체비 상한') + '</b></div>')
}

$scenarioBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $scenarioRows) {
    [void]$scenarioBuilder.Append('<div class="scenario-cell"><span>' + (Encode-Html $row.'시나리오') + '</span><strong>' + (Encode-Html $row.'첫 가치 사용자') + '</strong><small>첫 가치 CAC ' + (Encode-Html $row.'첫 가치 CAC') + ' · CPC ' + (Encode-Html $row.'CPC 가정') + '</small></div>')
}

$pilotHtml = @"
<div class="pilot-panel">
  <div class="pilot-title"><div><strong>기존 약 20명부터 측정</strong><small>등록 수가 아니라 실제·활성·첫 가치·반복·유료·팀 의도·원가를 구분</small></div><a href="../personas/04_sales_marketing/reference/16_existing_user_measurement_ad_pilot.md">개발 요청문</a></div>
  <div class="pilot-metrics">$($measureBuilder.ToString())</div>
</div>
<details class="item pilot-detail"><summary><span class="summary-copy"><strong>첫 4주 광고비 · 최대 150만원</strong><small>계측 3~7일 → 네이버 → Google → 승자 검색 → 조건부 Meta</small></span></summary><div class="item-body"><div class="pilot-budget-list">$($budgetBuilder.ToString())</div><div class="scenario-grid">$($scenarioBuilder.ToString())</div><p class="pilot-caveat">시나리오는 검색 매체비 120만원에 대한 계산 예시입니다. 실제 CPC·클릭은 집행 직전 네이버·Google 키워드 예상값으로 교체합니다.</p></div></details>
"@

$html = Get-Content -Raw -Encoding UTF8 -LiteralPath $indexPath
if ($html -notmatch 'pilot\.css') {
    $html = $html.Replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">' + [Environment]::NewLine + '  <link rel="stylesheet" href="pilot.css">')
}
$pattern = '(?s)(<details class="group" data-group="growth".*?<div class="plain-note">.*?</div>)<div class="budget".*?</div>'
$updated = [regex]::Replace($html, $pattern, ('$1' + $pilotHtml), 1)
if ($updated -eq $html) { throw 'Growth budget insertion point not found.' }
[System.IO.File]::WriteAllText($indexPath, $updated, [System.Text.UTF8Encoding]::new($false))

Write-Output "20-user pilot injected: $($measureRows.Count) metrics, $($budgetRows.Count) budget rows"
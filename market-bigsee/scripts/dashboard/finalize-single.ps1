$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$indexPath = Join-Path $dashboardRoot 'index.html'
$oldEvidencePath = Join-Path $dashboardRoot 'evidence.html'
$statusPath = Join-Path $projectRoot 'control\00_project_status.md'
$decisionPath = Join-Path $projectRoot 'control\08_decision_log.md'
$validationPath = Join-Path $projectRoot 'control\09_validation_board.md'

foreach ($required in @($indexPath, $statusPath, $decisionPath, $validationPath)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Unified dashboard source missing: $required" }
}

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

function Get-StatusClass {
    param([string]$Status)
    switch -Regex ($Status) {
        '완료|확정|통과|채택|통제 도입|대응 설계' { return 'done' }
        '진행|기획' { return 'progress' }
        'P0|주의|중단|미해결' { return 'stop' }
        '대기|입력 대기|협상 대기|준비 전|미시작|미측정|미검증|보류|증거 대기' { return 'wait' }
        default { return 'neutral' }
    }
}

function Render-Status {
    param([string]$Status)
    return '<span class="status status-' + (Get-StatusClass $Status) + '">' + (Encode-Html $Status) + '</span>'
}

function Render-Cell {
    param([string]$Value, [bool]$IsStatus, [bool]$IsPath)
    if ($IsStatus) { return Render-Status $Value }
    if ($IsPath -and $Value -match '^(?!.*\.\.)[0-9A-Za-z_./\-가-힣]+\.md$') {
        $target = Join-Path $projectRoot $Value
        if (Test-Path -LiteralPath $target) {
            return '<a class="path-link" href="../' + (Encode-Html $Value) + '">' + (Encode-Html $Value) + '</a>'
        }
    }
    return Encode-Html $Value
}

function Render-Table {
    param(
        [array]$Rows,
        [array]$Columns,
        [array]$StatusColumns = @(),
        [array]$PathColumns = @()
    )
    $builder = [System.Text.StringBuilder]::new()
    [void]$builder.Append('<div class="data-table-wrap"><table class="data-table"><thead><tr>')
    foreach ($column in $Columns) { [void]$builder.Append('<th>' + (Encode-Html $column) + '</th>') }
    [void]$builder.Append('</tr></thead><tbody>')
    foreach ($row in $Rows) {
        [void]$builder.Append('<tr>')
        foreach ($column in $Columns) {
            $value = [string]$row.$column
            $cell = Render-Cell -Value $value -IsStatus ($StatusColumns -contains $column) -IsPath ($PathColumns -contains $column)
            [void]$builder.Append('<td data-label="' + (Encode-Html $column) + '">' + $cell + '</td>')
        }
        [void]$builder.Append('</tr>')
    }
    [void]$builder.Append('</tbody></table></div>')
    return $builder.ToString()
}

function Render-FullGroup {
    param([string]$Id, [string]$Label, [string]$Meta, [string]$Content)
    return '<details class="group full-group" id="' + $Id + '"><summary><span>' + (Encode-Html $Label) + '</span><small>' + (Encode-Html $Meta) + '</small></summary><div class="group-body full-body">' + $Content + '</div></details>'
}

$statusText = Get-Content -Raw -Encoding UTF8 -LiteralPath $statusPath
$decisionText = Get-Content -Raw -Encoding UTF8 -LiteralPath $decisionPath
$validationText = Get-Content -Raw -Encoding UTF8 -LiteralPath $validationPath

$basicRows = @(Get-MarkdownTable -Text $statusText -Heading '기본 현황')
$areaRows = @(Get-MarkdownTable -Text $statusText -Heading '영역별 상태')
$roadmapRows = @(Get-MarkdownTable -Text $statusText -Heading '90일 단계')
$metricRows = @(Get-MarkdownTable -Text $statusText -Heading '핵심 지표')
$riskRows = @(Get-MarkdownTable -Text $statusText -Heading '상위 리스크')
$questionRows = @(Get-MarkdownTable -Text $statusText -Heading '다음 의사결정')
$actionRows = @(Get-MarkdownTable -Text $statusText -Heading '지금 할 일')
$decisionRows = @(Get-MarkdownTable -Text $decisionText -Heading '결정 목록')
$proposalRows = @(Get-MarkdownTable -Text $decisionText -Heading '제안 상태의 결정')
$hypothesisRows = @(Get-MarkdownTable -Text $validationText -Heading '핵심 가설')
$evidenceRows = @(Get-MarkdownTable -Text $validationText -Heading '증거 기록')

$basicBuilder = [System.Text.StringBuilder]::new()
foreach ($row in $basicRows) {
    [void]$basicBuilder.Append('<div class="fact-cell"><span>' + (Encode-Html $row.항목) + '</span><strong>' + (Encode-Html $row.값) + '</strong></div>')
}

$historyRoot = Join-Path $projectRoot '.history'
$markdownFiles = @(Get-ChildItem -LiteralPath $projectRoot -Filter '*.md' -Recurse | Where-Object {
    -not $_.FullName.StartsWith($historyRoot, [System.StringComparison]::OrdinalIgnoreCase)
} | Sort-Object FullName)
$documentBuilder = [System.Text.StringBuilder]::new()
foreach ($file in $markdownFiles) {
    $relative = $file.FullName.Substring($projectRoot.Length).TrimStart([char[]]'\/').Replace('\', '/')
    $titleLine = Get-Content -Encoding UTF8 -TotalCount 1 -LiteralPath $file.FullName
    $title = ([string]$titleLine) -replace '^#\s+', ''
    $owner = if ($relative.StartsWith('control/')) { '전사 통제' } elseif ($relative.StartsWith('system/')) { '운영 규칙' } elseif ($relative.StartsWith('personas/')) { '페르소나' } else { '진입' }
    [void]$documentBuilder.Append('<a class="document-row" href="../' + (Encode-Html $relative) + '"><span>' + (Encode-Html $relative) + '</span><strong>' + (Encode-Html $title) + '</strong><small>' + (Encode-Html $owner) + '</small></a>')
}

$fullBuilder = [System.Text.StringBuilder]::new()
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-facts' -Label '전체 현황' -Meta ($basicRows.Count.ToString() + '개 항목') -Content ('<div class="fact-grid">' + $basicBuilder.ToString() + '</div>')))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-areas' -Label '영역별 상태' -Meta ($areaRows.Count.ToString() + '개 영역') -Content (Render-Table -Rows $areaRows -Columns @('영역','상태','현재 근거','다음 게이트','정본') -StatusColumns @('상태') -PathColumns @('정본'))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-roadmap' -Label '90일 단계' -Meta ($roadmapRows.Count.ToString() + '개 구간') -Content (Render-Table -Rows $roadmapRows -Columns @('단계','상태','기간','완료 조건','바로 다음 행동','정본') -StatusColumns @('상태') -PathColumns @('정본'))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-metrics' -Label '핵심 지표' -Meta ($metricRows.Count.ToString() + '개 지표') -Content (Render-Table -Rows $metricRows -Columns @('지표','현재','90일 목표·통과 기준','측정 시작 조건','정본') -StatusColumns @('현재') -PathColumns @('정본'))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-risks' -Label '상위 리스크' -Meta ($riskRows.Count.ToString() + '건') -Content (Render-Table -Rows $riskRows -Columns @('등급','리스크','현재 영향','대응','상태','정본') -StatusColumns @('등급','상태') -PathColumns @('정본'))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-actions' -Label '전사 행동과 결정' -Meta (($actionRows.Count + $questionRows.Count).ToString() + '건') -Content ((Render-Table -Rows $actionRows -Columns @('우선순위','행동','완료 조건','상태') -StatusColumns @('상태')) + (Render-Table -Rows $questionRows -Columns @('ID','결정','필요한 증거','결정 시점','상태') -StatusColumns @('상태')))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-decisions' -Label '결정 기록' -Meta (($decisionRows.Count + $proposalRows.Count).ToString() + '건') -Content ((Render-Table -Rows $decisionRows -Columns @('ID','날짜','상태','결정','이유','주요 결과','대체') -StatusColumns @('상태')) + (Render-Table -Rows $proposalRows -Columns @('ID','제안','결정에 필요한 증거','담당','상태') -StatusColumns @('상태')))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-validation' -Label '가설과 증거' -Meta (($hypothesisRows.Count + $evidenceRows.Count).ToString() + '건') -Content ((Render-Table -Rows $hypothesisRows -Columns @('ID','우선순위','가설','시험','통과 기준','현재 증거','다음 행동','상태') -StatusColumns @('우선순위','상태')) + (Render-Table -Rows $evidenceRows -Columns @('날짜','가설 ID','증거 유형','관찰·수치','출처','신뢰도','판단 영향') -PathColumns @('출처')))))
[void]$fullBuilder.Append((Render-FullGroup -Id 'full-documents' -Label '문서 지도' -Meta ($markdownFiles.Count.ToString() + '개 MD') -Content ('<div class="document-list">' + $documentBuilder.ToString() + '</div>')))

$navigation = @'
<nav class="tag-nav" aria-label="대시보드 구역">
  <div class="tag-list">
    <a class="nav-tag" href="#now" data-nav-tag>지금</a>
    <a class="nav-tag" href="#stages" data-nav-tag>단계</a>
    <a class="nav-tag" href="#growth" data-nav-tag>광고</a>
    <a class="nav-tag" href="#partnership" data-nav-tag>협업</a>
    <a class="nav-tag" href="#decisions" data-nav-tag>결정</a>
    <a class="nav-tag" href="#roles" data-nav-tag>역할</a>
    <a class="nav-tag" href="#all" data-nav-tag>전체</a>
  </div>
</nav>
'@

$fullSection = '<section class="full-board" id="all" aria-label="전체 현황"><div class="section-strip"><span>전체</span><small>현황·지표·리스크·결정·가설·문서를 같은 화면에서 확인</small></div><div class="full-stack">' + $fullBuilder.ToString() + '</div></section>'

$html = Get-Content -Raw -Encoding UTF8 -LiteralPath $indexPath
$html = $html.Replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">' + [Environment]::NewLine + '  <link rel="stylesheet" href="unified.css">')
$html = $html.Replace('</header>', '</header>' + [Environment]::NewLine + $navigation)
$html = $html.Replace('<section class="now-card"', '<section class="now-card" id="now"')
$html = $html.Replace('data-group="stages"', 'data-group="stages" id="stages"')
$html = $html.Replace('data-group="growth"', 'data-group="growth" id="growth"')
$html = $html.Replace('data-group="partnership"', 'data-group="partnership" id="partnership"')
$html = $html.Replace('data-group="decisions"', 'data-group="decisions" id="decisions"')
$html = $html.Replace('data-group="roles"', 'data-group="roles" id="roles"')
$html = $html.Replace('<a class="small-button solid" href="evidence.html">상세 근거</a>', '')
$html = $html.Replace('상태 뜻과 상세 근거', '상태 뜻')
$html = $html.Replace('표시를 이해하거나 전체 표가 필요할 때', '상태 표시를 이해할 때')
$html = [regex]::Replace($html, '(?s)<div class="evidence-link">.*?<a class="small-button solid" href="evidence\.html">열기</a></div>', '')
$html = $html.Replace('    <footer class="footer">', '    ' + $fullSection + [Environment]::NewLine + '    <footer class="footer">')
$html = $html.Replace('<script src="app.js"></script>', '<script src="app.js"></script><script src="unified.js"></script>')
Set-Content -LiteralPath $indexPath -Value $html -Encoding UTF8

if (Test-Path -LiteralPath $oldEvidencePath) {
    Remove-Item -LiteralPath $oldEvidencePath
}

Write-Output "Single dashboard finalized: dashboard/index.html; $($markdownFiles.Count) Markdown sources"


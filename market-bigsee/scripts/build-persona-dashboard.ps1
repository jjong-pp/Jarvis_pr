$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$personaRoot = Join-Path $projectRoot 'personas'
$registryPath = Join-Path $personaRoot 'registry.md'
$dashboardPath = Join-Path $projectRoot 'dashboard.html'

foreach ($required in @($registryPath, $dashboardPath)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required source not found: $required"
    }
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
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows += [pscustomobject]$record
    }
    return $rows
}

function Get-KeyValueTable {
    param([string]$Path, [string]$Heading)
    $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
    $rows = Get-MarkdownTable -Text $text -Heading $Heading
    $values = @{}
    foreach ($row in $rows) { $values[[string]$row.항목] = [string]$row.값 }
    return $values
}

function Get-StatusClass {
    param([string]$Status)
    switch -Regex ($Status) {
        '확정|완료|채택|통과' { return 'positive' }
        '진행|기획|대응 설계' { return 'active' }
        '주의|P0|미해결' { return 'danger' }
        'P1|미검증|미측정|입력 대기' { return 'warning' }
        '보류|대기|미시작' { return 'neutral' }
        default { return 'neutral' }
    }
}

$registryText = Get-Content -Raw -Encoding UTF8 -LiteralPath $registryPath
$personas = Get-MarkdownTable -Text $registryText -Heading 'Persona Registry'
$cardBuilder = [System.Text.StringBuilder]::new()
$optionBuilder = [System.Text.StringBuilder]::new()

foreach ($persona in $personas) {
    if ([string]$persona.Directory -notmatch '^[0-9]{2}_[a-z_]+$') {
        throw "Invalid persona directory in registry: $($persona.Directory)"
    }

    $directory = Join-Path $personaRoot ([string]$persona.Directory)
    $requiredFiles = @('inbox.md','state.md','research.md','output.md')
    foreach ($name in $requiredFiles) {
        $path = Join-Path $directory $name
        if (-not (Test-Path -LiteralPath $path)) {
            throw "Persona contract file missing: $path"
        }
    }

    $state = Get-KeyValueTable -Path (Join-Path $directory 'state.md') -Heading 'Harness State'
    $output = Get-KeyValueTable -Path (Join-Path $directory 'output.md') -Heading 'Dashboard Output'
    $status = [string]$state['상태']
    $statusClass = Get-StatusClass $status
    $relativeState = 'personas/' + $persona.Directory + '/state.md'
    $relativeOutput = 'personas/' + $persona.Directory + '/output.md'

    [void]$cardBuilder.Append(@"
<article class="persona-card">
  <div class="persona-card-head">
    <div><span class="persona-id">$(Encode-Html $persona.ID)</span><h3>$(Encode-Html $persona.페르소나)</h3></div>
    <span class="status status-$statusClass">$(Encode-Html $status)</span>
  </div>
  <p class="persona-task"><strong>현재 과업</strong> $(Encode-Html $state['현재 과업'])</p>
  <dl class="persona-output">
    <div><dt>결론</dt><dd>$(Encode-Html $output['결론'])</dd></div>
    <div><dt>근거</dt><dd>$(Encode-Html $output['근거'])</dd></div>
    <div><dt>한계</dt><dd>$(Encode-Html $output['가설·한계'])</dd></div>
    <div><dt>제안</dt><dd>$(Encode-Html $output['제안'])</dd></div>
    <div><dt>결정 요청</dt><dd>$(Encode-Html $output['의사결정 요청'])</dd></div>
    <div><dt>다음 전달</dt><dd>$(Encode-Html $output['다음 전달'])</dd></div>
  </dl>
  <div class="persona-links"><a href="$(Encode-Html $relativeState)">상태 열기</a><a href="$(Encode-Html $relativeOutput)">출력 열기</a></div>
</article>
"@)
    [void]$optionBuilder.Append('<option value="' + (Encode-Html ('[' + $persona.ID + '] ' + $persona.페르소나)) + '">' + (Encode-Html ($persona.페르소나 + ' · ' + $state['현재 과업'])) + '</option>')
}

$personaPanel = @"
  <section class="panel" id="persona-panel" role="tabpanel">
    <div class="section">
      <div class="section-head"><div><h2>페르소나 하네스</h2><p class="section-sub">각 역할은 분리된 상태와 근거를 유지하고 표준 출력만 이 화면에 전달합니다.</p></div><span class="status status-active">$($personas.Count)개 역할</span></div>
      <div class="persona-grid">$($cardBuilder.ToString())</div>
    </div>
    <div class="grid-2">
      <div class="section">
        <div class="section-head"><div><h2>작업 계약</h2><p class="section-sub">입력부터 정본 승격까지 같은 파일 계약을 사용합니다.</p></div></div>
        <div class="harness-flow"><span>inbox</span><b>→</b><span>research</span><b>→</b><span>state</span><b>+</b><span>output</span><b>→</b><span>root SSOT</span><b>→</b><span>dashboard</span></div>
        <p><a href="system/12_persona_harness.md">전체 하네스 규약</a> · <a href="personas/registry.md">페르소나 등록부</a> · <a href="personas/START_HERE.md">역할 작업 시작</a></p>
      </div>
      <div class="section">
        <div class="section-head"><div><h2>역할 지정 피드백</h2><p class="section-sub">담당 역할을 선택해 다음 작업 입력을 복사합니다.</p></div></div>
        <div class="feedback-box">
          <label for="persona-feedback-item">담당 페르소나</label>
          <select id="persona-feedback-item">$($optionBuilder.ToString())</select>
          <label for="persona-feedback-note">새 사실·질문·우선순위</label>
          <textarea id="persona-feedback-note" placeholder="예: 대행사 인터뷰에서 카페24 고객 비중이 높았음. 연동 우선순위를 검토해줘."></textarea>
          <div class="button-row"><button class="button" type="button" id="copy-persona-feedback">페르소나 작업 문장 복사</button><span class="copy-state" id="persona-copy-state" aria-live="polite"></span></div>
        </div>
      </div>
    </div>
  </section>
"@

$personaCss = @'
    .persona-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .persona-card { border: 1px solid var(--line); border-radius: 15px; background: var(--bg); padding: 17px; }
    .persona-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .persona-card h3 { display: inline; margin: 0 0 0 8px; font-size: 16px; }
    .persona-id { color: var(--accent); font: 750 11px Consolas, monospace; }
    .persona-task { margin: 13px 0; padding: 10px 12px; border-radius: 10px; background: var(--surface-2); font-size: 13px; }
    .persona-task strong { color: var(--muted); margin-right: 7px; font-size: 11px; }
    .persona-output { margin: 0; }
    .persona-output div { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--line); }
    .persona-output div:last-child { border-bottom: 0; }
    .persona-output dt { color: var(--muted); font-size: 11px; font-weight: 750; }
    .persona-output dd { margin: 0; font-size: 12px; }
    .persona-links { display: flex; gap: 12px; margin-top: 12px; font-size: 11px; }
    .harness-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .harness-flow span { padding: 7px 9px; border-radius: 9px; background: var(--surface-2); font: 700 11px Consolas, monospace; }
    .harness-flow b { color: var(--accent); }
    @media (max-width: 900px) { .persona-grid { grid-template-columns: 1fr; } }
'@

$personaScript = @'
  const personaFeedbackItem = document.getElementById('persona-feedback-item');
  const personaFeedbackNote = document.getElementById('persona-feedback-note');
  const personaCopyState = document.getElementById('persona-copy-state');
  document.getElementById('copy-persona-feedback').addEventListener('click', async () => {
    const note = personaFeedbackNote.value.trim() || '(새 정보 또는 질문을 여기에 입력)';
    const text = `마켓빅시 페르소나 작업 요청\n담당: ${personaFeedbackItem.value}\n입력: ${note}\n해당 폴더의 inbox → research → state → output을 갱신하고, 필요한 결론만 루트 정본에 승격한 뒤 dashboard.html을 재생성해줘.`;
    try {
      await navigator.clipboard.writeText(text);
      personaCopyState.textContent = '복사했습니다.';
    } catch (error) {
      personaFeedbackNote.value = text;
      personaFeedbackNote.select();
      personaCopyState.textContent = '클립보드 권한이 없어 입력칸을 선택했습니다.';
    }
  });
'@

$html = Get-Content -Raw -Encoding UTF8 -LiteralPath $dashboardPath
$personaTab = '    <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="persona-panel" data-tab="persona-panel">페르소나 하네스</button>'
$html = $html.Replace('  </nav>', $personaTab + [Environment]::NewLine + '  </nav>')
$html = $html.Replace('  <section class="panel" id="knowledge-panel"', $personaPanel + [Environment]::NewLine + '  <section class="panel" id="knowledge-panel"')
$html = $html.Replace('  </style>', $personaCss + [Environment]::NewLine + '  </style>')
$html = $html.Replace('</script>', $personaScript + [Environment]::NewLine + '</script>')

$allMarkdown = @(Get-ChildItem -LiteralPath $projectRoot -Filter '*.md' -Recurse | Where-Object { $_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)
$hashSource = [System.Text.StringBuilder]::new()
foreach ($file in $allMarkdown) {
    [void]$hashSource.AppendLine($file.FullName.Substring($projectRoot.Length))
    [void]$hashSource.AppendLine((Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName))
}
$sha = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($hashSource.ToString()))
$fullHash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant().Substring(0, 16)
$currentHashMatch = [regex]::Match($html, 'BIGSEE Business OS · ([0-9a-f]{16})')
if (-not $currentHashMatch.Success) { throw 'Core source hash not found in dashboard.' }
$html = $html.Replace($currentHashMatch.Groups[1].Value, $fullHash)

$totalBytes = ($allMarkdown | Measure-Object Length -Sum).Sum
$approxTokens = [math]::Round($totalBytes / 3.2)
$statusBytes = (Get-Item -LiteralPath (Join-Path $projectRoot 'control/00_project_status.md')).Length
$statusTokens = [math]::Round($statusBytes / 3.2)
$reduction = [math]::Round((1 - ($statusTokens / $approxTokens)) * 100)
$html = [regex]::Replace($html, '<div class="stat-value">\d+개 MD</div>', '<div class="stat-value">' + $allMarkdown.Count + '개 MD</div>', 1)
$html = [regex]::Replace($html, '<div class="stat-context">전체 약 [^<]+</div>', '<div class="stat-context">전체 약 ' + ('{0:N0}' -f $approxTokens) + ' 토큰 · 현황 약 ' + ('{0:N0}' -f $statusTokens) + ' 토큰</div>', 1)
$html = [regex]::Replace($html, '<div class="stat-value">약 \d+%</div>', '<div class="stat-value">약 ' + $reduction + '%</div>', 1)
$html = [regex]::Replace($html, '<code>\d+ Markdown</code>', '<code>' + $allMarkdown.Count + ' Markdown</code>', 1)

if ($html -match '\{\{[A-Z_]+\}\}') { throw 'Unresolved dashboard placeholder found.' }
Set-Content -LiteralPath $dashboardPath -Value $html -Encoding UTF8

Write-Output "Generated: $dashboardPath"
Write-Output "Persona outputs: $($personas.Count)"
Write-Output "Markdown sources: $($allMarkdown.Count)"
Write-Output "Source hash: $fullHash"
Write-Output "Approximate context: $approxTokens tokens; status-first: $statusTokens tokens; reduction: $reduction%"




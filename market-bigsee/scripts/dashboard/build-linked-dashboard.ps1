$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$pagesRoot = Join-Path $dashboardRoot 'pages'
$assetsRoot = Join-Path $dashboardRoot 'assets'

foreach ($directory in @($dashboardRoot, $pagesRoot, $assetsRoot)) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }
}

function Convert-InlineMarkdown {
    param([string]$Text)

    $value = [System.Net.WebUtility]::HtmlEncode($Text)
    $value = [regex]::Replace($value, '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    $value = [regex]::Replace($value, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
    $value = [regex]::Replace($value, '`([^`]+)`', '<code>$1</code>')
    return $value
}

function Convert-MarkdownToHtml {
    param([string]$Markdown)

    $lines = $Markdown -split "`r?`n"
    $html = [System.Text.StringBuilder]::new()
    $paragraph = [System.Collections.Generic.List[string]]::new()
    $listType = $null
    $detailsOpen = $false
    $inCode = $false
    $code = [System.Collections.Generic.List[string]]::new()

    function Flush-Paragraph {
        if ($paragraph.Count -gt 0) {
            $joined = ($paragraph -join ' ').Trim()
            [void]$html.AppendLine("<p>$(Convert-InlineMarkdown $joined)</p>")
            $paragraph.Clear()
        }
    }

    function Close-List {
        if ($null -ne $listType) {
            [void]$html.AppendLine("</$listType>")
            Set-Variable -Name listType -Value $null -Scope 1
        }
    }

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        if ($line -match '^```') {
            Flush-Paragraph
            Close-List
            if ($inCode) {
                $escapedCode = [System.Net.WebUtility]::HtmlEncode($code -join "`n")
                [void]$html.AppendLine("<pre><code>$escapedCode</code></pre>")
                $code.Clear()
                $inCode = $false
            }
            else {
                $inCode = $true
            }
            continue
        }

        if ($inCode) {
            $code.Add($line)
            continue
        }

        if ($line -match '^#\s+') {
            continue
        }

        if ($line -match '^##\s+(.+)$') {
            Flush-Paragraph
            Close-List
            if ($detailsOpen) {
                [void]$html.AppendLine('</div></details>')
            }
            $heading = Convert-InlineMarkdown $Matches[1]
            [void]$html.AppendLine(('<details class="section" open><summary><h2>{0}</h2><span class="chevron">⌄</span></summary><div class="section-body">' -f $heading))
            $detailsOpen = $true
            continue
        }

        if ($line -match '^###\s+(.+)$') {
            Flush-Paragraph
            Close-List
            [void]$html.AppendLine("<h3>$(Convert-InlineMarkdown $Matches[1])</h3>")
            continue
        }

        if ($line -match '^####\s+(.+)$') {
            Flush-Paragraph
            Close-List
            [void]$html.AppendLine("<h4>$(Convert-InlineMarkdown $Matches[1])</h4>")
            continue
        }

        if (($line -match '^\|.*\|\s*$') -and ($i + 1 -lt $lines.Count) -and ($lines[$i + 1] -match '^\|?\s*:?-{3,}')) {
            Flush-Paragraph
            Close-List
            $headers = $line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
            $i++
            [void]$html.AppendLine('<div class="table-wrap"><table><thead><tr>')
            foreach ($header in $headers) {
                [void]$html.AppendLine("<th>$(Convert-InlineMarkdown $header)</th>")
            }
            [void]$html.AppendLine('</tr></thead><tbody>')
            while (($i + 1 -lt $lines.Count) -and ($lines[$i + 1] -match '^\|.*\|\s*$')) {
                $i++
                $cells = $lines[$i].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
                [void]$html.AppendLine('<tr>')
                foreach ($cell in $cells) {
                    [void]$html.AppendLine("<td>$(Convert-InlineMarkdown $cell)</td>")
                }
                [void]$html.AppendLine('</tr>')
            }
            [void]$html.AppendLine('</tbody></table></div>')
            continue
        }

        if ($line -match '^[-*]\s+(.+)$') {
            Flush-Paragraph
            if ($listType -ne 'ul') {
                Close-List
                [void]$html.AppendLine('<ul>')
                $listType = 'ul'
            }
            [void]$html.AppendLine("<li>$(Convert-InlineMarkdown $Matches[1])</li>")
            continue
        }

        if ($line -match '^\d+\.\s+(.+)$') {
            Flush-Paragraph
            if ($listType -ne 'ol') {
                Close-List
                [void]$html.AppendLine('<ol>')
                $listType = 'ol'
            }
            [void]$html.AppendLine("<li>$(Convert-InlineMarkdown $Matches[1])</li>")
            continue
        }

        if ($line -match '^>\s*(.+)$') {
            Flush-Paragraph
            Close-List
            [void]$html.AppendLine("<blockquote>$(Convert-InlineMarkdown $Matches[1])</blockquote>")
            continue
        }

        if ([string]::IsNullOrWhiteSpace($line)) {
            Flush-Paragraph
            Close-List
            continue
        }

        $paragraph.Add($line.Trim())
    }

    Flush-Paragraph
    Close-List
    if ($inCode) {
        $escapedCode = [System.Net.WebUtility]::HtmlEncode($code -join "`n")
        [void]$html.AppendLine("<pre><code>$escapedCode</code></pre>")
    }
    if ($detailsOpen) {
        [void]$html.AppendLine('</div></details>')
    }
    return $html.ToString()
}

function Get-SourceBundle {
    param([string[]]$Sources)

    $chunks = [System.Collections.Generic.List[string]]::new()
    $display = [System.Collections.Generic.List[string]]::new()
    foreach ($relativePath in $Sources) {
        $fullPath = Join-Path $projectRoot $relativePath
        if (-not (Test-Path -LiteralPath $fullPath)) {
            throw "Dashboard source not found: $relativePath"
        }
        $chunks.Add([System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8))
        $display.Add($relativePath.Replace('\', '/'))
    }
    $content = $chunks -join "`n`n"
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = [BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($content))).Replace('-', '').Substring(0, 12).ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
    return @{
        Content = $content
        Display = ($display -join ' + ')
        Hash = $hash
    }
}

$navItems = @(
    @{ Id = 'overview'; Label = '개요'; File = 'index.html' },
    @{ Id = 'personas'; Label = '타깃'; File = 'personas.html' },
    @{ Id = 'launch'; Label = '시장진입'; File = 'launch.html' },
    @{ Id = 'product'; Label = '제품'; File = 'product.html' },
    @{ Id = 'operations'; Label = '운영'; File = 'operations.html' },
    @{ Id = 'decisions'; Label = '결정'; File = 'decisions.html' }
)

$pageConfigs = @(
    @{ Id = 'overview'; Title = '시장진입과 제품을 다시 맞춥니다'; Eyebrow = 'BIGSEE REPLAN'; Lede = '누구에게 무엇을 팔지부터 기능·측정·개발 순서까지, 지금 바꾸는 내용을 한 장에서 봅니다.'; Output = (Join-Path $dashboardRoot 'index.html'); Sources = @('control\16_replanning_brief.md'); IsRoot = $true },
    @{ Id = 'personas'; Title = '업무가 있는 사람만 타깃으로 잡습니다'; Eyebrow = 'TARGET PERSONAS'; Lede = '대행사, 인하우스, 활성 셀러의 실제 구매 순간과 제외 대상을 분리합니다.'; Output = (Join-Path $pagesRoot 'personas.html'); Sources = @('personas\02_customer_market\reference\19_target_personas_channel_map.md'); IsRoot = $false },
    @{ Id = 'launch'; Title = '커뮤니티와 Meta를 같은 14일에 봅니다'; Eyebrow = 'COMMUNITY × META'; Lede = '동일한 제안과 측정 기준으로 채널이 아니라 유료 고객군을 찾습니다.'; Output = (Join-Path $pagesRoot 'launch.html'); Sources = @('personas\04_sales_marketing\reference\20_community_meta_parallel_launch.md'); IsRoot = $false },
    @{ Id = 'product'; Title = '조사에서 판매 운영까지 한 흐름으로 만듭니다'; Eyebrow = 'PRODUCT SYSTEM'; Lede = '워크스페이스, SKU, 콘텐츠, 캠페인, CRM, 원가, API를 개발 순서대로 구체화했습니다.'; Output = (Join-Path $pagesRoot 'product.html'); Sources = @('personas\03_product_growth\reference\21_product_system_replan.md'); IsRoot = $false },
    @{ Id = 'operations'; Title = '이번 주 행동과 통과 조건을 관리합니다'; Eyebrow = 'OPERATING CONTROL'; Lede = '광고 집행표가 아니라 고객·현금·개발 협업과 30일 결과물을 관리합니다.'; Output = (Join-Path $pagesRoot 'operations.html'); Sources = @('control\15_execution_control.md'); IsRoot = $false },
    @{ Id = 'decisions'; Title = '결정과 가설을 삭제하지 않고 추적합니다'; Eyebrow = 'DECISIONS & TESTS'; Lede = '바뀐 결정을 대체 관계로 남기고, 의견을 실제 고객 행동으로 검증합니다.'; Output = (Join-Path $pagesRoot 'decisions.html'); Sources = @('control\08_decision_log.md', 'control\09_validation_board.md'); IsRoot = $false }
)

$generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss K')

foreach ($page in $pageConfigs) {
    $bundle = Get-SourceBundle $page.Sources
    $bodyHtml = Convert-MarkdownToHtml $bundle.Content
    $assetPrefix = if ($page.IsRoot) { 'assets/' } else { '../assets/' }
    $navHtml = [System.Text.StringBuilder]::new()
    foreach ($item in $navItems) {
        if ($page.IsRoot) {
            $href = if ($item.Id -eq 'overview') { 'index.html' } else { "pages/$($item.File)" }
        }
        else {
            $href = if ($item.Id -eq 'overview') { '../index.html' } else { $item.File }
        }
        $current = if ($item.Id -eq $page.Id) { ' aria-current="page"' } else { '' }
        [void]$navHtml.AppendLine(('<a href="{0}"{1}>{2}</a>' -f $href, $current, $item.Label))
    }

    $document = @"
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="$($page.Lede)">
  <title>$($page.Title) · BIGSEE</title>
  <link rel="stylesheet" href="${assetPrefix}styles.css">
</head>
<body data-page="$($page.Id)">
  <header class="site-header">
    <a class="brand" href="$(if ($page.IsRoot) { 'index.html' } else { '../index.html' })"><span>BIG</span>SEE <small>사업 운영판</small></a>
    <nav class="site-nav" aria-label="주요 화면">
      $($navHtml.ToString())
    </nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">$($page.Eyebrow)</p>
        <h1>$($page.Title)</h1>
        <p class="lede">$($page.Lede)</p>
      </div>
      <div class="hero-actions">
        <button type="button" data-expand-all>전체 펼치기</button>
        <button type="button" data-collapse-all>전체 접기</button>
      </div>
    </section>
    <section class="content" data-dashboard-content>
      $bodyHtml
    </section>
  </main>
  <footer>
    <span>정본: <code>$([System.Net.WebUtility]::HtmlEncode($bundle.Display))</code></span>
    <span>생성: $generatedAt</span>
    <span>소스 해시: <code>$($bundle.Hash)</code></span>
  </footer>
  <script src="${assetPrefix}app.js"></script>
</body>
</html>
"@
    [System.IO.File]::WriteAllText($page.Output, $document, $utf8NoBom)
}

$requiredOutputs = $pageConfigs | ForEach-Object { $_.Output }
foreach ($output in $requiredOutputs) {
    if (-not (Test-Path -LiteralPath $output)) {
        throw "Dashboard output missing: $output"
    }
    $html = [System.IO.File]::ReadAllText($output, [System.Text.Encoding]::UTF8)
    if (($html | Select-String -Pattern '<nav class="site-nav"' -AllMatches).Matches.Count -ne 1) {
        throw "Navigation validation failed: $output"
    }
    foreach ($label in $navItems.Label) {
        if ($html -notmatch ">$([regex]::Escape($label))</a>") {
            throw "Navigation item '$label' missing: $output"
        }
    }
    if ($html -notmatch '소스 해시:') {
        throw "Source hash missing: $output"
    }
}

Write-Output "Linked dashboard generated: $($requiredOutputs.Count) pages"


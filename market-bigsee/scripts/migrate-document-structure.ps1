$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$resolvedRoot = (Resolve-Path -LiteralPath $projectRoot).Path

$documentMap = [ordered]@{
    '00_project_status.md' = 'control/00_project_status.md'
    '01_service_current_state.md' = 'personas/01_strategy_ceo/reference/01_service_current_state.md'
    '02_sales_management_strategy.md' = 'personas/01_strategy_ceo/reference/02_sales_management_strategy.md'
    '03_ecommerce_marketing_sales_flow.md' = 'personas/04_sales_marketing/reference/03_ecommerce_marketing_sales_flow.md'
    '04_feature_expansion_plan.md' = 'personas/03_product_growth/reference/04_feature_expansion_plan.md'
    '05_data_api_architecture.md' = 'personas/06_technology_data/reference/05_data_api_architecture.md'
    '06_competitor_benchmark.md' = 'personas/02_customer_market/reference/06_competitor_benchmark.md'
    '07_competitor_strategy_actions.md' = 'personas/01_strategy_ceo/reference/07_competitor_strategy_actions.md'
    '08_decision_log.md' = 'control/08_decision_log.md'
    '09_validation_board.md' = 'control/09_validation_board.md'
    '10_operating_manual.md' = 'system/10_operating_manual.md'
    '11_operating_system_research.md' = 'system/11_operating_system_research.md'
    '12_persona_harness.md' = 'system/12_persona_harness.md'
    '13_it_saas_gtm_paid_acquisition.md' = 'personas/04_sales_marketing/reference/13_it_saas_gtm_paid_acquisition.md'
    '14_gtm_compensation_partnership_framework.md' = 'personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md'
    '15_execution_control.md' = 'control/15_execution_control.md'
}

function Assert-InProject {
    param([string]$Path)
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    if (-not $fullPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path escaped project root: $fullPath"
    }
    return $fullPath
}

function Get-RelativeFilePath {
    param([string]$FromDirectory, [string]$ToFile)
    $fromFull = [System.IO.Path]::GetFullPath($FromDirectory).TrimEnd('\') + '\'
    $toFull = [System.IO.Path]::GetFullPath($ToFile)
    $fromUri = [System.Uri]::new($fromFull)
    $toUri = [System.Uri]::new($toFull)
    return [System.Uri]::UnescapeDataString($fromUri.MakeRelativeUri($toUri).ToString())
}

function Set-Utf8Text {
    param([string]$Path, [string]$Text)
    Set-Content -LiteralPath $Path -Value $Text -Encoding UTF8
}

# Move each promoted document to the folder owned by its control area or persona.
foreach ($entry in $documentMap.GetEnumerator()) {
    $source = Assert-InProject (Join-Path $resolvedRoot $entry.Key)
    $target = Assert-InProject (Join-Path $resolvedRoot $entry.Value)
    $targetDirectory = Split-Path -Parent $target
    New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null

    if ((Test-Path -LiteralPath $source) -and (Test-Path -LiteralPath $target)) {
        throw "Both source and target exist: $($entry.Key)"
    }
    if (Test-Path -LiteralPath $source) {
        Move-Item -LiteralPath $source -Destination $target
    }
    if (-not (Test-Path -LiteralPath $target)) {
        throw "Document missing after move: $target"
    }
}

$historyRoot = Join-Path $resolvedRoot '.history'
$managedFiles = @(Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File | Where-Object {
    ($_.Extension -in @('.md', '.ps1')) -and
    (-not $_.FullName.StartsWith($historyRoot, [System.StringComparison]::OrdinalIgnoreCase)) -and
    ($_.FullName -ne $PSCommandPath)
})

# Rewrite every old basename once. Paths in control tables and build scripts are
# repository-root relative; narrative documents use paths relative to themselves.
foreach ($file in $managedFiles) {
    $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
    $original = $content
    $isBuildScript = $file.Extension -eq '.ps1'
    $isControlDocument = $file.FullName.StartsWith((Join-Path $resolvedRoot 'control'), [System.StringComparison]::OrdinalIgnoreCase)

    foreach ($entry in $documentMap.GetEnumerator()) {
        $target = Join-Path $resolvedRoot $entry.Value
        $replacement = if ($isBuildScript -or $isControlDocument) {
            $entry.Value.Replace('\', '/')
        } else {
            Get-RelativeFilePath -FromDirectory $file.DirectoryName -ToFile $target
        }
        $oldPattern = '(?<![0-9A-Za-z_./-])(?:(?:\.\./)+)?' + [regex]::Escape($entry.Key)
        $content = [regex]::Replace($content, $oldPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
    }

    if ($content -ne $original) {
        Set-Utf8Text -Path $file.FullName -Text $content
    }
}

$coreBuilder = Join-Path $resolvedRoot 'scripts/build-dashboard-core.ps1'
$coreText = Get-Content -Raw -Encoding UTF8 -LiteralPath $coreBuilder
$coreText = $coreText.Replace(
    "if (`$FileName -match '^[0-9A-Za-z_\-가-힣]+\.md$' -and (Test-Path -LiteralPath (Join-Path `$projectRoot `$FileName))) {",
    "if (`$FileName -match '^(?!.*\.\.)[0-9A-Za-z_./\-가-힣]+\.md$' -and (Test-Path -LiteralPath (Join-Path `$projectRoot `$FileName))) {"
)
$coreText = $coreText.Replace(
    "`$markdownFiles = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' | Sort-Object Name)",
    "`$markdownFiles = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' -Recurse | Where-Object { `$_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)"
)
$coreText = $coreText.Replace(
    '[void]$allMarkdown.AppendLine($file.Name)',
    '[void]$allMarkdown.AppendLine($file.FullName.Substring($projectRoot.Length))'
)
Set-Utf8Text -Path $coreBuilder -Text $coreText

$personaBuilder = Join-Path $resolvedRoot 'scripts/build-persona-dashboard.ps1'
$personaText = Get-Content -Raw -Encoding UTF8 -LiteralPath $personaBuilder
$personaText = $personaText.Replace(
    "`$allMarkdown = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' -Recurse | Sort-Object FullName)",
    "`$allMarkdown = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' -Recurse | Where-Object { `$_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)"
)
Set-Utf8Text -Path $personaBuilder -Text $personaText

$pageBuilder = Join-Path $resolvedRoot 'scripts/build-dashboard-pages.ps1'
$pageText = Get-Content -Raw -Encoding UTF8 -LiteralPath $pageBuilder
$pageText = $pageText.Replace(
    "`$allMarkdown = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' -Recurse | Sort-Object FullName)",
    "`$allMarkdown = @(Get-ChildItem -LiteralPath `$projectRoot -Filter '*.md' -Recurse | Where-Object { `$_.FullName -notmatch '[\\/]\.history[\\/]' } | Sort-Object FullName)"
)
$pageText = $pageText.Replace(
    'href="personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md"',
    'href="../personas/01_strategy_ceo/reference/14_gtm_compensation_partnership_framework.md"'
)
Set-Utf8Text -Path $pageBuilder -Text $pageText

Write-Output 'Document structure migrated.'
foreach ($entry in $documentMap.GetEnumerator()) {
    Write-Output ('  ' + $entry.Value)
}


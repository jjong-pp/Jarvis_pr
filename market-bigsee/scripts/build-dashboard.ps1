$ErrorActionPreference = 'Stop'

$coreBuilder = Join-Path $PSScriptRoot 'build-dashboard-core.ps1'
$personaBuilder = Join-Path $PSScriptRoot 'build-persona-dashboard.ps1'
$pageBuilder = Join-Path $PSScriptRoot 'build-dashboard-pages.ps1'
$singleFinalizer = Join-Path $PSScriptRoot 'dashboard\finalize-single.ps1'
$languageCleaner = Join-Path $PSScriptRoot 'dashboard\clean-language.ps1'

foreach ($required in @($coreBuilder, $personaBuilder, $pageBuilder, $singleFinalizer, $languageCleaner)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Dashboard build stage not found: $required"
    }
}

& $coreBuilder | Out-Null
& $personaBuilder | Out-Null
& $pageBuilder | Out-Null
& $singleFinalizer | Out-Null
& $languageCleaner

Write-Output 'Single dashboard generated: dashboard/index.html'


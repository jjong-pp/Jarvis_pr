$ErrorActionPreference = 'Stop'

$coreBuilder = Join-Path $PSScriptRoot 'build-dashboard-core.ps1'
$personaBuilder = Join-Path $PSScriptRoot 'build-persona-dashboard.ps1'
$pageBuilder = Join-Path $PSScriptRoot 'build-dashboard-pages.ps1'

foreach ($required in @($coreBuilder, $personaBuilder, $pageBuilder)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Dashboard build stage not found: $required"
    }
}

& $coreBuilder | Out-Null
& $personaBuilder | Out-Null
& $pageBuilder


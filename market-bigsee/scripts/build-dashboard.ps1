$ErrorActionPreference = 'Stop'

$builders = @(
    (Join-Path $PSScriptRoot 'dashboard\build-data-catalog.ps1'),
    (Join-Path $PSScriptRoot 'dashboard\build-linked-dashboard.ps1')
)

foreach ($builder in $builders) {
    if (-not (Test-Path -LiteralPath $builder)) {
        throw "Dashboard builder not found: $builder"
    }

    # Windows PowerShell 5.1 reads UTF-8 files without BOM as the active ANSI code page.
    # Read each implementation explicitly as UTF-8 so Korean labels remain portable.
    $builderSource = Get-Content -LiteralPath $builder -Raw -Encoding UTF8
    $builderScript = [scriptblock]::Create($builderSource)
    & $builderScript -DashboardScriptRoot (Split-Path -Parent $builder)
}


$ErrorActionPreference = 'Stop'

$builder = Join-Path $PSScriptRoot 'dashboard\build-linked-dashboard.ps1'
if (-not (Test-Path -LiteralPath $builder)) {
    throw "Dashboard builder not found: $builder"
}

& $builder


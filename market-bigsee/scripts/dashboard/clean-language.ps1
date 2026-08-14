$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$indexPath = Join-Path $projectRoot 'dashboard\index.html'
if (-not (Test-Path -LiteralPath $indexPath)) { throw "Dashboard not found: $indexPath" }

$html = Get-Content -Raw -Encoding UTF8 -LiteralPath $indexPath
$html = $html.Replace(
    'BIGSEE 사업의 현재 행동과 상세 근거를 한 화면에서 접어 보는 로컬 대시보드',
    'BIGSEE 사업의 현재 행동과 전체 현황을 한 화면에서 나누어 보는 로컬 대시보드'
)
Set-Content -LiteralPath $indexPath -Value $html -Encoding UTF8


param(
    [string]$Python = 'C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
)
$ErrorActionPreference = 'Stop'
& $Python (Join-Path $PSScriptRoot 'build_resume.py')
if ($LASTEXITCODE -ne 0) { throw 'Word build failed' }
& (Join-Path $PSScriptRoot 'export_pdf.ps1')
Write-Output '출력 완료. output의 PDF 전체 페이지를 확인한 뒤 사용하세요.'

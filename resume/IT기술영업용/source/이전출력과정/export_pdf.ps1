$ErrorActionPreference = 'Stop'
$taskBase = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskDocx = Join-Path $taskBase 'output\박종혁_기술영업_이력서.docx'
$taskPdf = Join-Path $taskBase 'output\박종혁_기술영업_이력서.pdf'
$taskApp = $null
$taskDoc = $null
try {
    $taskApp = New-Object -ComObject Word.Application
    $taskApp.Visible = $false
    $taskApp.DisplayAlerts = 0
    $taskDoc = $taskApp.Documents.Open($taskDocx, $false, $false)
    $null = $taskDoc.Fields.Update()
    $taskDoc.Repaginate()
    $taskPages = $taskDoc.ComputeStatistics(2)
    $taskDoc.Save()
    $taskDoc.ExportAsFixedFormat($taskPdf, 17)
    $taskManifestPath = Join-Path $taskBase 'source\build_manifest.json'
    $taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw | ConvertFrom-Json
    $taskManifest.pdf_status = 'exported_pending_visual_review'
    $taskManifest | Add-Member -NotePropertyName pages -NotePropertyValue $taskPages -Force
    $taskManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $taskManifestPath -Encoding utf8
    Write-Output ('PDF exported; pages=' + $taskPages)
} finally {
    if ($null -ne $taskDoc) { $taskDoc.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($taskDoc) }
    if ($null -ne $taskApp) { $taskApp.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($taskApp) }
}

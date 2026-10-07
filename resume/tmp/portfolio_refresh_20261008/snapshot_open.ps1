$ErrorActionPreference='Stop'
$app=New-Object -ComObject PowerPoint.Application
$target='C:\MyMain\main\resume\PM용\기본틀_PM_포트폴리오.pptx'
foreach($p in $app.Presentations){
  if($p.FullName -eq $target){
    $p.SaveCopyAs('C:\MyMain\main\resume\tmp\portfolio_refresh_20261008\open_working_copy.pptx',24)
    Write-Output "Open presentation copied without saving original; slides=$($p.Slides.Count)"
  }
}

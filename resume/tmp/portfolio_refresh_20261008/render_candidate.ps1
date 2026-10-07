$ErrorActionPreference='Stop'
$taskDir='C:\MyMain\main\resume\tmp\portfolio_refresh_20261008'
$app=New-Object -ComObject PowerPoint.Application
$deck=$app.Presentations.Open('C:\MyMain\main\resume\PM용\기본틀_PM_포트폴리오_SCM대시보드.pptx',$true,$false,$false)
$overflow=@()
for($i=1;$i -le $deck.Slides.Count;$i++){
  $slide=$deck.Slides.Item($i)
  $slide.Export((Join-Path "$taskDir\final_render" ('slide_{0:D2}.png' -f $i)),'PNG',1600,900)
  foreach($shape in $slide.Shapes){
    if($shape.HasTextFrame -and $shape.TextFrame.HasText){
      $tr=$shape.TextFrame.TextRange
      if($tr.BoundHeight -gt $shape.Height+2 -or $tr.BoundWidth -gt $shape.Width+2){
        $overflow+=@{slide=$i;id=$shape.Id;text=$tr.Text;box=@($shape.Left,$shape.Top,$shape.Width,$shape.Height);bound=@($tr.BoundWidth,$tr.BoundHeight)}
      }
    }
  }
}
$overflow | ConvertTo-Json -Depth 5 | Set-Content "$taskDir\overflow.json" -Encoding utf8
$deck.Close()
Write-Output "Rendered 24 slides; text overflow flags=$($overflow.Count)"

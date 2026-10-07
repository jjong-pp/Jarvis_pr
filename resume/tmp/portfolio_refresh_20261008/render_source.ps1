$ErrorActionPreference='Stop'
$taskDir='C:\MyMain\main\resume\tmp\portfolio_refresh_20261008'
$app=New-Object -ComObject PowerPoint.Application
$open=@()
foreach($p in $app.Presentations){$open+=@{name=$p.Name;path=$p.FullName;saved=[bool]$p.Saved}}
$open | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath "$taskDir\open_presentations.json" -Encoding utf8
$deck=$app.Presentations.Open("$taskDir\source.pptx",$true,$false,$false)
$out=@()
for($i=1;$i -le $deck.Slides.Count;$i++){
  $slide=$deck.Slides.Item($i)
  $slide.Export((Join-Path "$taskDir\source_render" ('slide_{0:D2}.png' -f $i)),'PNG',1600,900)
  $shapes=@()
  foreach($shape in $slide.Shapes){
    $text='';$font='';$size=0
    if($shape.HasTextFrame -and $shape.TextFrame.HasText){$text=$shape.TextFrame.TextRange.Text;$font=$shape.TextFrame.TextRange.Font.Name;$size=$shape.TextFrame.TextRange.Font.Size}
    $shapes+=@{id=$shape.Id;name=$shape.Name;type=$shape.Type;text=$text;left=$shape.Left;top=$shape.Top;width=$shape.Width;height=$shape.Height;font=$font;fontSize=$size}
  }
  $out+=@{slide=$i;shapes=$shapes}
}
@{width=$deck.PageSetup.SlideWidth;height=$deck.PageSetup.SlideHeight;slides=$out} | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath "$taskDir\source_com.json" -Encoding utf8
$deck.Close()
Write-Output "Rendered $($out.Count) slides"

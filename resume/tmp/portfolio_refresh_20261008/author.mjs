import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const dir='C:/MyMain/main/resume/tmp/portfolio_refresh_20261008';
const m=JSON.parse(await fs.readFile(dir+'/content.json','utf8'));
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const layouts=JSON.parse(await fs.readFile(dir+'/source_layouts.json','utf8'));
let count=0;
for(const [s,changes] of Object.entries(m.shapes)){
 for(const [id,txt] of Object.entries(changes)){
  const el=layouts[Number(s)-1].elements.find(e=>e.id===id);
  if(!el)throw new Error(`Missing shape ${s}/${id}`);
  p.resolve(el.aid).text=txt; count++;
 }
}
for(const [s,tables] of Object.entries(m.tables))for(const [id,rows] of Object.entries(tables)){
 const tableAnchors={'12/15':'tb/pk3y1ovi','13/40':'tb/gbi9sr2h','16/24':'tb/18nehone','17/13':'tb/jet0vi5k','17/15':'tb/idkzmd4z'};
 const el=layouts[Number(s)-1].elements.find(e=>e.aid===tableAnchors[s+'/'+id]);
 if(!el)throw new Error(`Missing table ${s}/${id}`);
 const table=p.resolve(el.aid);
 rows.forEach((row,r)=>row.forEach((value,c)=>table.cells.set(r,c,value)));
}
for(const [s,positions] of Object.entries(m.position))for(const [id,a] of Object.entries(positions)){
 const el=layouts[Number(s)-1].elements.find(e=>e.id===id);
 p.resolve(el.aid).position={left:a[0]*4/3,top:a[1]*4/3,width:a[2]*4/3,height:a[3]*4/3};
}
for(const im of m.images){
 const [x,y,w,h]=im.sourceCrop; const [left,top,width,height]=im.position.map(v=>v*4/3);
 p.slides.items[im.slide-1].images.add({blob:new Uint8Array(await fs.readFile(dir+'/'+im.file)),contentType:'image/jpeg',alt:im.alt,fit:'contain',position:{left,top,width,height},crop:{left:x/1307,top:y/1230,right:1-(x+w)/1307,bottom:1-(y+h)/1230}});
}
await (await PresentationFile.exportPptx(p)).save(dir+'/artifact_authored.pptx');
await fs.writeFile(dir+'/authored_inspect.ndjson',(await p.inspect({kind:'slide,textbox,table,image',maxChars:200000})).ndjson);
console.log(JSON.stringify({editedShapes:count,slides:p.slides.items.length,output:'artifact_authored.pptx'}));

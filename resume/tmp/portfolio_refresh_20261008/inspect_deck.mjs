import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from 'file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const dir='C:/MyMain/main/resume/tmp/portfolio_refresh_20261008';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const snapshot=await p.inspect({kind:'deck,slide,textbox,shape,image,table,chart,notes,layout',maxChars:500000});
await fs.writeFile(dir+'/source_inspect.ndjson',snapshot.ndjson);
const layouts=[];
for(let i=0;i<p.slides.items.length;i++){
  const blob=await p.slides.items[i].export({format:'layout'});
  layouts.push(JSON.parse(await blob.text()));
}
await fs.writeFile(dir+'/source_layouts.json',JSON.stringify(layouts,null,2));
console.log(JSON.stringify({slides:p.slides.items.length,inspect:dir+'/source_inspect.ndjson'}));

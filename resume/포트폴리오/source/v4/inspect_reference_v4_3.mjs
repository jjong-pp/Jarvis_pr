import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip/lib/index.js';
import { FileBlob, PresentationFile } from 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const src='C:/MyMain/resume/박종혁_PM_포트폴리오_정렬수정.pptx';
const out='C:/MyMain/resume/포트폴리오/.build/v4_3';
await fs.mkdir(out,{recursive:true});
const zip=await JSZip.loadAsync(await fs.readFile(src));
const fonts=new Map();
for(const [n,f] of Object.entries(zip.files)) if(/^ppt\/slides\/slide\d+\.xml$/.test(n)) {
 const t=await f.async('string');
 for(const m of t.matchAll(/typeface="([^"]+)"/g)) fonts.set(m[1],(fonts.get(m[1])||0)+1);
}
console.log('fonts',Object.fromEntries(fonts));
console.log((await zip.file('ppt/presentation.xml').async('string')).match(/<p:sldSz[^>]+>/)?.[0]);
const p=await PresentationFile.importPptx(await FileBlob.load(src));
const snap=await p.inspect({kind:'slide,textbox,image,table,layout',maxChars:500000});
await fs.writeFile(path.join(out,'reference.inspect.ndjson'),snap.ndjson);
console.log('masters',p.masters.items.length,'layouts',p.layouts.items.length,'slides',p.slides.items.length);
for (const l of p.layouts.items) console.log('layout',l.id,l.placeholders.summary());
for(const i of [0,1,2,8,21]) {
 const s=p.slides.items[i];
 const rows=[];
 for(const sh of s.shapes.items) rows.push({id:sh.id,text:sh.text.toString(),pos:sh.position,style:sh.text.style});
 await fs.writeFile(path.join(out,`reference-slide-${i+1}.json`),JSON.stringify(rows,null,2));
 console.log('slide',i+1,JSON.stringify(rows.map(r=>({id:r.id,text:r.text}))).slice(0,15000));
}
await fs.writeFile(path.join(out,'reference.layout.json'),await (await p.slides.items[0].export({format:'layout'})).text());

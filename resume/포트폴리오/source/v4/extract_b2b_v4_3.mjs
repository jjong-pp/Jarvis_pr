import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const sharp = require('sharp');
const htmlPath = 'C:/MyMain/산후조리원/산후조리원몰_과업내역_처리결과.html';
const outputDir = 'C:/MyMain/resume/포트폴리오/.build/v4_3/b2b_raw';
const wanted = new Set([6,10,15,18,19,20,21,38,63,64,65,66,72,73,75,76,80]);
const html = await fs.readFile(htmlPath, 'utf8');
const images = [...html.matchAll(/<img\b[^>]*\bsrc=["'](data:image\/(?:png|jpeg|jpg);base64,([^"']+))["'][^>]*>/gi)];
await fs.mkdir(outputDir, { recursive: true });
const manifest = [];
for (let i = 0; i < images.length; i++) {
  if (!wanted.has(i)) continue;
  const match = images[i];
  const extension = match[1].startsWith('data:image/png') ? 'png' : 'jpeg';
  const bytes = Buffer.from(match[2], 'base64');
  const filePath = path.join(outputDir, `img-${i}.${extension}`);
  await fs.writeFile(filePath, bytes);
  const info = await sharp(bytes).metadata();
  const sourceLine = html.slice(0, match.index).split('\n').length;
  const item = { index: i, sourceLine, path: filePath, width: info.width, height: info.height, format: info.format };
  manifest.push(item);
  console.log(JSON.stringify(item));
}
if (manifest.length !== wanted.size) throw new Error(`Expected ${wanted.size} images, got ${manifest.length}`);
await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify({source: htmlPath, usage: 'INTERNAL RAW EVIDENCE: inspect and crop or mask before portfolio use', images:manifest}, null, 2));

// Crops preserve source pixels. No generated content or replacement text is used.
// The chosen rectangles exclude account names, prices, bank accounts and order IDs.
const crops = [
  { index:6, name:'policy-matrix', left:225, top:382, width:1245, height:363, note:'Grade-by-category policy table; excludes authenticated admin header and older explanatory footer.' },
  { index:6, name:'policy-details', left:225, top:453, width:1245, height:190, note:'First two grade rows enlarged; member and product counts redacted below.' },
  { index:10, name:'fixed-address', left:15, top:90, width:590, height:285, note:'Fixed delivery address notice and masked phone; excludes obsolete message field.' },
  { index:15, name:'point-insufficient', left:15, top:58, width:590, height:246, note:'Insufficient point warning and disabled payment button; excludes point amount.' },
  { index:18, name:'cart-categories', left:30, top:413, width:805, height:320, note:'Category grouping and test products only; excludes amount columns. Source includes uncategorized test product.' },
  { index:19, name:'mixed-order-modal', left:542, top:411, width:416, height:271, note:'Mixed-category order blocking modal only; source includes category-unspecified fallback.' },
  { index:20, name:'mypage-menu-before', left:25, top:200, width:280, height:550, note:'Left menu only; no test account banner or balance.' },
  { index:21, name:'mypage-menu-after', left:25, top:276, width:280, height:550, note:'Left menu only; no test account banner or balance.' },
  { index:20, name:'mypage-detail-before', left:25, top:506, width:280, height:244, note:'Benefit and member-info menu area; no test account banner or balance.' },
  { index:21, name:'mypage-detail-after', left:25, top:582, width:280, height:244, note:'Benefit and member-info menu area; no test account banner or balance.' },
  { index:38, name:'point-safety-note', left:225, top:1040, width:1245, height:65, note:'Execution caution and repeat-run safeguard text only; excludes all account and balance rows.' },
  { index:63, name:'statement-before', left:1085, top:56, width:342, height:297, note:'Order status and former confirmation/review area only; prices and order IDs excluded.' },
  { index:64, name:'statement-after', left:1085, top:56, width:342, height:297, note:'Order status and statement action area only; cancelled orders have no statement button.' },
  { index:65, name:'shipping-message-before', left:0, top:45, width:1380, height:344, note:'Shipping section including masked phone; pricing section excluded.' },
  { index:66, name:'shipping-message-after', left:0, top:45, width:1380, height:344, note:'Shipping section including masked phone and restored message field; pricing excluded.' },
  { index:72, name:'home-desktop-safe', left:0, top:0, width:1500, height:953, note:'Safe top portion. Do not use as hero: carousel is mid-transition.' },
  { index:73, name:'home-mobile-safe', left:0, top:0, width:620, height:1040, note:'Safe top portion. Do not use as hero: carousel is mid-transition.' },
  { index:75, name:'report-filter-all', left:218, top:27, width:1258, height:287, note:'Filters and report title only; contains test-inclusive source counts, not achievement metrics.' },
  { index:76, name:'report-filter-selected', left:243, top:20, width:1247, height:236, note:'Filters and explanatory labels only; excludes customer rows and prices. Counts are test-inclusive.' },
  { index:80, name:'postpaid-status', left:1052, top:73, width:128, height:205, note:'Payment-method and payment-state columns only; prices, customer names and order IDs excluded.' },
];
for (const crop of crops) {
  const input = manifest.find(item => item.index === crop.index);
  const {left,top,width,height} = crop;
  const filePath=path.join(outputDir, `safe-${crop.name}.png`);
  let pixels=sharp(input.path).extract({left,top,width,height});
  if(crop.name==='policy-details'){
    const redaction=Buffer.from('<svg width="1245" height="190"><rect x="208" y="64" width="1037" height="22" fill="#F7F7FB"/><rect x="6" y="113" width="194" height="20" fill="#F1F0F6"/><rect x="6" y="162" width="194" height="20" fill="#F1F0F6"/></svg>');
    pixels=pixels.composite([{input:redaction,left:0,top:0}]);
  }
  await pixels.png().toFile(filePath);
  crop.path = filePath;
}
await fs.writeFile(path.join(outputDir, 'safe-crop-manifest.json'), JSON.stringify({source:htmlPath,label:'개발사 처리결과 문서의 기능 화면 발췌',crops},null,2));
console.log(`Created ${crops.length} source-pixel crop candidates.`);

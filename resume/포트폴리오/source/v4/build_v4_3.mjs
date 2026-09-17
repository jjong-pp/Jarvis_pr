import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import JSZip from 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip/lib/index.js';
import {Presentation, PresentationFile} from 'file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const ROOT='C:/MyMain/resume/포트폴리오';
const BUILD=path.join(ROOT,'.build/v4_3');
const SKILL='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.22227/skills/presentations';
const REFERENCE='C:/MyMain/resume/박종혁_PM_포트폴리오_정렬수정.pptx';
const FONT='Noto Sans KR';
const REV=process.env.PORTFOLIO_REV||'제출본';
process.env.RUNTIME_NODE_MODULES='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
await fs.mkdir(BUILD,{recursive:true});
await fs.mkdir(path.join(ROOT,'output'),{recursive:true});
const P=Presentation.create({slideSize:{width:1280,height:720}});
const C={ink:'#1A1A1A',body:'#4E4E53',gray:'#77777E',muted:'#92929A',line:'#D9D9E0',soft:'#F4F4F6',blue:'#21549B',blueDark:'#19457E',blueTint:'#E9F1FC',blueSoft:'#A4C7EE',green:'#206D4A',greenDark:'#19583C',greenTint:'#E7F4ED',greenSoft:'#A6D5BC',amber:'#9C650A',amberTint:'#FFF6E5',red:'#A83C35',redTint:'#FBEDEC',white:'#FFFFFF'};
const tableOwners=[];
const sources=[];
function txt(s,text,x,y,w,h,size=16,color=C.body,bold=false,align='left',valign='top'){
 const q=s.shapes.add({name:`text-${s.shapes.items.length}`,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=text;q.text.style={typeface:FONT,fontSize:size,color,bold,alignment:align,verticalAlignment:valign,autoFit:'none',wrap:'square',insets:{top:0,right:0,bottom:0,left:0},lineSpacing:1.25};return q;
}
function box(s,x,y,w,h,fill=C.white,line=C.line,r=5){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1},borderRadius:r});}
function rule(s,x,y,w,color=C.line){s.shapes.add({geometry:'line',position:{left:x,top:y,width:w,height:0},line:{fill:color,width:.8}});}
function label(s,t,x,y,w,h,fill,color=C.ink,size=15,bold=true){const q=box(s,x,y,w,h,fill,'none',5);q.text=t;q.text.style={typeface:FONT,fontSize:size,color,bold,alignment:'center',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{top:5,right:12,bottom:5,left:12},lineSpacing:1.18};return q;}
function cell(s,t,x,y,w,h,opts={}){const q=box(s,x,y,w,h,opts.fill||C.white,opts.line||C.line,opts.radius??5);q.text=t;q.text.style={typeface:FONT,fontSize:opts.size||15,color:opts.color||C.body,bold:opts.bold||false,alignment:opts.align||'center',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{top:8,right:12,bottom:8,left:12},lineSpacing:1.2};return q;}
function footer(s,n,color=C.muted){txt(s,`${String(n).padStart(2,'0')} / 22`,1143,30,73,18,10.5,color,false,'right');}
function newSlide(){const s=P.slides.add();s.background.fill=C.white;return s;}
function header(s,n,step,title,sub,color=C.blue){footer(s,n);txt(s,step,64,78,41,35,26,color,true);txt(s,title,108,78,1080,40,26,C.ink,true);if(sub)txt(s,sub,64,125,1152,31,14,C.gray);}
function subhead(s,t,x,y,w,color=C.blue){txt(s,t,x,y,w,30,18,color,true);}
function takeaway(s,t,y,color=C.blue,tint=false){label(s,t,64,y,1152,48,tint?(color===C.green?C.greenTint:C.blueTint):color,tint?color:C.white,17,true);}
function caption(s,t,x,y,w){txt(s,t,x,y,w,28,13.5,C.gray,false,'left');}
function notes(s,refs,extra=''){s.speakerNotes.textFrame.setText(`근거: ${refs}\n${extra}`);sources.push({slide:P.slides.items.length,refs,extra});}
function arrow(s,x,y,w=22,color=C.muted){txt(s,'›',x,y,w,28,21,color,false,'center','middle');}
async function image(s,file,x,y,w,h,alt){s.images.add({blob:await fs.readFile(file),contentType:file.endsWith('.png')?'image/png':'image/jpeg',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function table(s,values,x,y,widths,rowHeights,accent=C.blue,highlight=-1,fsz=14.5){
 const rows=values.length,cols=values[0].length;
 const tb=s.tables.add({rows,columns:cols,left:x,top:y,width:widths.reduce((a,b)=>a+b,0),height:rowHeights.reduce((a,b)=>a+b,0),columnWidths:widths,values});
 for(let r=0;r<rows;r++){tb.rows[r].height=rowHeights[r];for(let c=0;c<cols;c++){const z=tb.getCell(r,c);z.fill=r===highlight?(accent===C.green?C.greenTint:C.blueTint):C.white;z.text.style={typeface:FONT,fontSize:fsz,color:r===0?C.gray:(r===highlight||c===0?accent:C.body),bold:r===0||c===0||r===highlight,verticalAlignment:'middle',alignment:'left',insets:{left:10,right:10,top:6,bottom:6},lineSpacing:1.22};}}
 tb.cells.block({row:0,column:0,rowCount:rows,columnCount:cols}).assign({margins:{left:10,right:10,top:6,bottom:6},anchor:'center'});
 tb.borders.assign({fill:C.line,width:.7,style:'solid'});tableOwners.push(P.slides.items.length);return tb;
}
function listRow(s,k,t,x,y,w,color=C.blue){txt(s,k,x,y,36,26,15,color,true);txt(s,t,x+40,y,w-40,54,15,C.body);}
function smallStep(s,k,t,x,y,w,color=C.blue){box(s,x,y,w,74);txt(s,k,x+14,y+12,w-28,25,16,C.ink,true);txt(s,t,x+14,y+40,w-28,25,12.5,C.gray);}
const B2B=path.join(BUILD,'b2b_raw');
const SAFE=B2B;
const evidenceFiles={'policy-settings.png':'safe-policy-details.png','mixed-modal.png':'safe-mixed-order-modal.png','mypage-before.png':'safe-mypage-detail-before.png','mypage-after.png':'safe-mypage-detail-after.png','statement-before.png':'safe-statement-before.png','statement-after.png':'safe-statement-after.png','delivery-message.png':'safe-shipping-message-after.png'};
async function evidence(s,name,x,y,w,h,alt){await image(s,path.join(SAFE,evidenceFiles[name]||name),x,y,w,h,alt);}

// 01. Reference cover composition, original rectangular portrait and typography.
{
 const s=newSlide();box(s,812,0,468,720,C.soft,'none',0);
 txt(s,'현장에서 겪은 운영 문제를\n정책과 데이터 구조로 바꿔 실제로 돌아가게 만듭니다.',54,70,720,77,25.5,C.ink,true);
 txt(s,'아이베 SCM팀에서 수입·물류 실무를 하며 반복되는 오류와 병목을 직접 겪었습니다.\n관세청 연동에서는 주문과 통관 데이터를 연결하는 기준을,\nB2B 전용몰에서는 계약별 주문·결제 정책과 운영 검수 기준을 정했습니다.\n개발사와 현업이 같은 결과를 확인할 수 있도록 문서와 검증 흐름을 만들었습니다.',54,170,718,136,15,C.body);
 txt(s,'박종혁  /  PM 포트폴리오',54,323,700,27,15,C.blue,true);
 txt(s,'강점',64,383,650,22,13,C.gray,true);
 const cols=[['01','현장 구조화','반복 문의와 운영 예외를\n정책과 요구사항으로 정리','B2B · 계정별 주문 기준'],['02','이해관계자 조율','원천 데이터와 처리 책임을\n개발사별로 구체화','관세청 · 주문과 포장 분리'],['03','운영 검증','배포 후 고객 화면과\n오류 복구까지 확인','공통 · 기대 결과로 검수']];
 cols.forEach((a,i)=>{const x=64+i*248;txt(s,a[0],x,418,200,22,14,'#3483E8',true);txt(s,a[1],x,451,218,30,20,C.ink,true);txt(s,a[2],x,492,218,55,13.5,C.gray);txt(s,a[3],x,551,218,25,11.5,'#3483E8',true);});
 cell(s,'01   관세청 통관 연동\n다자간 데이터 계약과 오류 복구',64,603,345,68,{align:'left',size:14.5,bold:true,color:C.blue});
 cell(s,'02   산후조리원 전용 B2B 몰\n계정 정책과 고객·운영 흐름',429,603,345,68,{align:'left',size:14.5,bold:true,color:C.green});
 await image(s,path.join(ROOT,'assets/portrait/_photo.png'),846,87,171,223,'박종혁 프로필 사진');
 txt(s,'경력',1060,97,166,22,14,C.blue,true);txt(s,'아이베 SCM팀',1060,126,166,24,14,C.ink,true);txt(s,'2025-09-08 ~ 재직 중\nSCM 실무·프로젝트 PM',1060,154,166,51,12,C.gray);
 txt(s,'학력',1060,221,165,22,14,C.blue,true);txt(s,'고려사이버대학교\nAI·데이터과학부 재학\n2025-02 편입',1060,250,166,64,11.7,C.gray);txt(s,'부천대 컴퓨터소프트웨어과\n2019-03 ~ 2024-02 졸업',1060,326,166,48,11.7,C.gray);
 txt(s,'SKILL',859,404,334,30,18,C.blue,true);
 label(s,'기획',859,447,66,24,C.blueTint,C.blue,12);txt(s,'요구사항 정의, 정책 설계, 데이터 흐름, QA',859,485,345,45,13,C.body);
 label(s,'기술',859,539,66,24,C.blueTint,C.blue,12);txt(s,'Python, SQL, REST API, Git',859,577,345,28,13,C.body);
 label(s,'운영',859,624,66,24,C.blueTint,C.blue,12);txt(s,'개발사 조율, 운영 피드백, 지표와 검수 기준',859,661,345,29,13,C.body);
 notes(s,'경력 사실 원장 C-002·003·010a·025·039·077~087·126.');
}
// 02. Reference index composition, reduced to the two selected projects.
{
 const s=newSlide();footer(s,2);txt(s,'Portfolio',64,278,300,25,16,C.gray);txt(s,'Project',64,313,340,70,46,C.ink,true);
 const rows=[{y:178,no:'01',color:C.blue,type:'규제 대응',title:'관세청 통관 연동',range:'03–11',body:'주문·포장·통관 데이터를 연결하는 기준과 오류 복구',meta:'2026-02 시작 / 2026-08-28 운영 전환',tag:'데이터 계약 · 의사결정 · 운영 검증'}, {y:412,no:'02',color:C.green,type:'운영 디지털화',title:'산후조리원 전용 B2B 몰',range:'12–21',body:'계정별 정책과 주문 예외를 시스템의 규칙으로 전환',meta:'2026-06 기획 / 2026-07-16 핵심 흐름 가동',tag:'문제 정의 · 범위 결정 · 운영 개선'}];
 rows.forEach(a=>{txt(s,a.no,460,a.y-4,91,69,44,'#E9E9EE',true);label(s,'',558,a.y+3,10,10,a.color,a.color,10);rule(s,563,a.y+24,1,C.line);txt(s,a.type,604,a.y-7,425,25,15,a.color,true);txt(s,a.title,604,a.y+25,570,38,25,C.ink,true);txt(s,`p ${a.range}   ${a.body}`,604,a.y+78,582,49,14.5,C.body);txt(s,a.meta,604,a.y+132,580,25,12.5,C.gray);txt(s,a.tag,604,a.y+166,580,26,13.5,a.color);});
 notes(s,'경력 사실 원장 C-021·022·025·031·039.');
}
function projectCover(s,n,isB2b){
 const a=isB2b?C.green:C.blue, dark=isB2b?C.greenDark:C.blueDark,light=isB2b?C.greenSoft:C.blueSoft;
 s.background.fill=a;footer(s,n,light);txt(s,isB2b?'Project 02.  운영 디지털화':'Project 01.  규제 대응',64,76,1130,34,19,C.white,true);
 label(s,isB2b?'B2B':'KCS',64,168,93,92,C.white,a,24);
 txt(s,isB2b?'산후조리원 전용 B2B 몰 구축':'관세청 통관 연동과 운영 전환',184,176,601,46,27,C.white,true);
 txt(s,isB2b?'계약별 주문·결제·포인트 규칙을\n운영자가 설정하고 확인하는 구조로 바꿨습니다.':'여러 시스템에 나뉜 주문과 물류 데이터를\n같은 기준으로 확인할 수 있도록 연결했습니다.',184,225,597,71,17,light);
 const details=isB2b?[['문제','계정별 상품·결제 조건을 사람이 매번 다시 판단'],['대상','계약 조리원 담당자, 내부 운영팀, 공급사'],['목표','오출고 예방과 주문 확인 부담 감소']]:[['문제','시스템마다 다른 주문 단위와 완료 기준'],['대상','해외직구 고객과 주문·출고·통관 운영팀'],['목표','누락을 발견하고 오류를 수정·재제출할 수 있는 흐름']];
 details.forEach((r,i)=>{txt(s,r[0],184,318+i*79,90,24,15,light,true);txt(s,r[1],184,348+i*79,604,37,15.5,C.white);});
 box(s,812,168,404,319,dark,'none',11);txt(s,isB2b?'운영 예외를 정책으로 정리':'데이터를 나눠 가진 주체',842,193,343,25,14,light,true);
 const rr=isB2b?[['회원 등급','상품·결제수단 분기'],['혼합주문','분유와 물품 분리 주문'],['포인트 정리','담당자 확인 후 실행'],['운영 QA','고객 화면에서 기대 결과 확인']]:[['자사몰','주문·결제·고객'],['본인확인기관','개인통관고유부호 검증'],['ERP·WMS','상품·포장·운송장'],['통관대행사','데이터 병합·수입신고']];
 rr.forEach((r,i)=>{box(s,844,230+i*60,340,54,a,'none',6);txt(s,r[0],864,236+i*60,298,22,14,C.white,true);txt(s,r[1],864,259+i*60,298,18,11.5,light);});
 rule(s,64,542,1152,light);
 const meta=isB2b?[['기간','2026-06 기획 / 07-02 개발 착수 / 07-16 핵심 흐름 가동 / 08-31 최종 검수'],['역할','문제 정의, 정책·요구사항 작성, 외주 개발사 조율, 운영 QA'],['협업','커머스 솔루션 개발사, 내부 운영팀, 영업매니저, 공급사'],['산출물','요구사항 대장, 계정 정책표, 사용자 흐름, QA 시나리오, 운영 안내'],['규모','계약 조리원 약 140개소 / 물품 지원 계약 약 77개소 / 공급사 5곳']]:[['기간','2026-02 기획 시작 / 2026-08-28 운영 전환 / 이후 운영 보완'],['역할','프로젝트 PM: 정책·데이터 계약 정의, API 요건 조율, 오류 복구와 운영 검증'],['협업','자사몰 개발사, ERP 개발사, 물류 개발사, 통관대행사, 본인확인기관'],['산출물','통합 기획서, 필드 매핑, 리스크·질의대장, 정책 결정 이력, QA 시나리오'],['범위','기획·조율·검증 담당 / 각 시스템 구현은 해당 개발사 담당']];
 meta.forEach((r,i)=>{txt(s,r[0],64,566+i*29,75,24,12.5,light,true);txt(s,r[1],149,566+i*29,1058,25,12.5,C.white);});
}
// 03. Original blue project opening.
{const s=newSlide();projectCover(s,3,false);notes(s,'경력 사실 원장 C-020~028·101·126. 운영 시작과 전체 자동화 완료는 구분.');}
// 04. Problem and source responsibilities.
{
 const s=newSlide();header(s,4,'01','배경과 문제 정의','주문 한 건이 통관·출고로 이어지는 과정에서 데이터와 책임이 갈라져 있었습니다.');
 subhead(s,'데이터는 각 시스템에, 판단은 담당자에게',64,176,555);
 const rows=[['자사몰','주문·결제·고객 정보'],['본인확인기관','개인통관고유부호 검증'],['ERP·WMS','상품·포장·운송장'],['통관대행사','병합·수입신고·통관 상태']];
 rows.forEach((r,i)=>{box(s,64,217+i*64,552,49);txt(s,r[0],84,231+i*64,168,24,16,C.ink,true);txt(s,r[1],258,231+i*64,335,26,14.5,C.gray);});
 subhead(s,'수기 전송만으로 남는 운영 공백',656,176,552);
 listRow(s,'01','주문번호와 포장번호가 달라 같은 주문을 대조하기 어려움',656,226,538);
 listRow(s,'02','접수 응답과 통관 완료를 같은 상태로 오인할 수 있음',656,307,538);
 listRow(s,'03','오류가 났을 때 수정할 원천과 재처리 담당이 불명확함',656,388,538);
 box(s,64,523,1152,113,C.blueTint,'none',6);txt(s,'문제 정의',84,541,134,26,15,C.blue,true);txt(s,'누가 어떤 데이터를 책임지고,\n어느 상태를 근거로 다음 작업을 진행할 것인가',228,542,960,71,23,C.blue,true);
 caption(s,'관세청 통관 연동 기획서의 데이터 책임·운영 기준을 재구성',64,658,1152);
 notes(s,'경력 사실 원장 C-025·028·101·126. planning_v7.html 4·8·9절. 원본은 내부 문서로 도표를 일반화해 재구성.');
}
// 05. Original comparison and responsibility layout.
{
 const s=newSlide();header(s,5,'02','대안 비교와 책임 분담','신고 판단과 상태 관리의 통제점을 국내 자사몰 DB에 두었습니다.');
 table(s,[['대안','활용할 수 있는 점','제약과 판단','선택'],['해외 ERP 중심','상품·포장 원천과 가까움','국내 인증정보 처리와 제출 상태 통제가 어려움','제외'],['수기 제출 유지','장애 시 즉시 대응 가능','상태 이력·재처리·채널 확장의 운영 부담','비상 대응'],['국내 DB 중심','제출 상태를 관리하고 원천별 책임 분리','회사 간 데이터 계약과 인터페이스 조율 필요','채택']],64,184,[218,280,490,164],[36,65,65,65],C.blue,3,14.5);
 label(s,'판단 기준  ① 개인정보 최소화    ② 제출 상태 통제    ③ 원천별 책임    ④ 개발 난이도',64,430,1152,40,C.soft,C.ink,14);
 subhead(s,'결정 이후의 책임 경계',64,495,1140);
 const rr=[['자사몰 개발사','주문·인증·제출 상태'],['ERP·물류 개발사','상품·포장·운송장 원천'],['통관대행사','데이터 병합·신고 결과'],['본인 역할','필드·흐름·검수 기준 조율']];
 rr.forEach((a,i)=>{const x=64+292*i;cell(s,a[0],x,541,276,44,i===3?{fill:C.blue,color:C.white,bold:true}:{fill:C.blueTint,color:C.blue,bold:true});txt(s,a[1],x+5,602,266,43,14.5,C.body,false,'center');});
 notes(s,'경력 사실 원장 C-025·028·126. 기준 디자인 원본 5장 대안 비교·책임 분담. 각 개발사의 실제 구현을 본인의 단독 개발로 표현하지 않음.');
}
// 06. Native swimlane following original E2E frame.
{
 const s=newSlide();header(s,6,'03','주문부터 통관까지의 업무 흐름','단계별 입력·처리 주체·완료 근거를 맞추고, 미완료 상태의 다음 단계 진입을 구분했습니다.');
 const heads=['단계','자사몰·국내 DB','본인확인기관','ERP·WMS','통관 시스템'];
 heads.forEach((h,i)=>label(s,h,64+[0,136,390,644,898][i],183,[124,242,242,242,254][i],32,i?C.ink:C.blueTint,i?C.white:C.blue,14.5));
 const rr=[['주문·검증','주문·실수하인 확인','통관정보 검증','—','—'],['포장 준비','원주문번호 유지','—','포장·운송장 확정','—'],['정보 제출','거래정보·인증정보','—','물류 스냅샷','접수 상태 확인'],['병합·대사','주문별 제출 이력','—','누락 포장 재확인','병합·통관 결과'],['오류 복구','오류 원천 분류','인증정보 보완','상품·포장정보 보완','결과 조회·재처리']];
 rr.forEach((r,ri)=>{let x=64;r.forEach((t,ci)=>{const w=[124,242,242,242,254][ci];cell(s,t,x,228+ri*71,w,58,{fill:ci===0?C.blueTint:C.white,color:ci===0?C.blue:C.body,bold:ci===0,size:14});x+=w+12;});});
 takeaway(s,'같은 주문번호·포장번호와 완료 근거를 공유해, 담당자 간 인계 기준을 문서로 고정했습니다.',613,C.blue);
 caption(s,'현재 정책 구조를 요약한 흐름도 · 개별 분기의 구현 완료나 자동화율을 나타내지 않음',64,671,1152);
 notes(s,'경력 사실 원장 C-025·028·101·128. planning_v7.html 4·8·9절. 재구성 흐름도.');
}
// 07. Policy-based simulation, traceable identifiers.
{
 const s=newSlide();header(s,7,'04','주문번호와 포장번호를 분리','주문 추적 기준을 유지하면서 분할 출고와 합배송을 설명할 수 있도록 관계를 정의했습니다.');
 subhead(s,'분할 출고',64,179,549);subhead(s,'합배송',660,179,548);
 box(s,64,221,552,282,C.blueTint,'none',7);box(s,660,221,556,282,C.soft,'none',7);
 cell(s,'원주문 A',89,306,171,54,{color:C.blue,bold:true});
 cell(s,'포장 A-1\n운송장 1',345,247,233,82,{color:C.blue,bold:true,size:17});
 cell(s,'포장 A-2\n운송장 2',345,349,233,82,{color:C.blue,bold:true,size:17});
 rule(s,260,333,40,C.blue);s.shapes.add({geometry:'line',position:{left:300,top:288,width:0,height:102},line:{fill:C.blue,width:1.2}});rule(s,300,288,30,C.blue);rule(s,300,390,30,C.blue);arrow(s,326,274,18,C.blue);arrow(s,326,376,18,C.blue);
 txt(s,'외부에 보내는 원주문번호는 A로 유지',91,450,487,33,15.5,C.blue,true,'center');
 cell(s,'원주문 B',689,256,206,61,{bold:true,size:17});cell(s,'원주문 C',689,350,206,61,{bold:true,size:17});
 rule(s,895,287,33,C.blue);rule(s,895,381,33,C.blue);s.shapes.add({geometry:'line',position:{left:928,top:287,width:0,height:94},line:{fill:C.blue,width:1.2}});rule(s,928,340,24,C.blue);arrow(s,949,326,18,C.blue);cell(s,'운송장 3\n주문별 거래정보 2건',969,280,208,121,{color:C.blue,bold:true,size:17});
 txt(s,'운송장 하나에 묶여도 거래정보는 주문별 유지',690,451,490,33,15.5,C.blue,true,'center');
 table(s,[['보존할 기준','설계 의미'],['원주문번호','판매 채널의 원주문번호를 전 구간에서 유지'],['포장번호·운송장','물류 처리 단위를 별도 보존하고 원주문과 연결'],['병합키','운송장 + 원주문번호가 양쪽 데이터에서 일치']],64,523,[262,890],[31,35,35,35],C.blue,-1,13.5);
 caption(s,'정책 기반 재구성 · A/B/C와 운송장 번호는 가상 예시',64,683,1152);
 notes(s,'경력 사실 원장 C-029. planning_v7.html 8절 공통 식별자. orderNo는 원주문번호, erpPackageOrderNo는 ERP 포장번호, 병합키는 hwbNo+orderNo. 시뮬레이션은 실제 주문·운영 로그가 아님.');
}
// 08. Actual PM tradeoff, dated decision story.
{
 const s=newSlide();header(s,8,'05','혼재 주문의 선출고 요청을 조정','2026-08-26 협의 사례: 국내 상품과 해외직구 상품이 섞인 주문의 처리 단위를 맞췄습니다.');
 const rows=[['처음 요청','국내 상품은 통관과 무관하므로 먼저 출고'],['확인한 제약','ERP는 원주문 단위로 삭제·재생성\n부분 재처리 시 내수 주문의 중복 위험'],['최종 결정','내수 선출고 요청을 철회\n해외직구 신고가 확정될 때까지 함께 보류']];
 rows.forEach((r,i)=>{const x=64+i*394;label(s,r[0],x,182,370,41,i===2?C.blue:C.soft,i===2?C.white:C.blue,16);box(s,x,237,370,132,i===2?C.blueTint:C.white,i===2?'none':C.line,6);txt(s,r[1],x+22,245,326,116,17,i===2?C.blue:C.body,i===2,'left','middle');if(i<2)arrow(s,x+374,285,17,C.blue);});
 subhead(s,'대안의 이익과 감수할 영향',64,406,1152);
 table(s,[['대안','얻는 것','위험·수용한 영향'],['내수 먼저 출고','국내 상품의 배송 지연 최소화','부분 삭제·재생성이 어려워 중복 처리 위험'],['혼재 주문 함께 보류','원주문 단위의 처리 일관성','국내 상품도 신고 확정까지 동반 지연']],64,449,[257,350,545],[37,64,64],C.blue,2,15);
 takeaway(s,'배송 속도와 중복 위험을 비교하고, 시스템 제약을 운영 기준으로 합의했습니다.',638,C.blue);
 notes(s,'경력 사실 원장 C-127. 리스크·질의대장 2026-08-26 협의 이력(572·622행). 실제 당시 의사결정 사례이며 현재 모든 채널에 적용되는 일괄 정책으로 확대하지 않음.');
}
// 09. State transition simulation and document functions.
{
 const s=newSlide();header(s,9,'06','접수 이후의 상태와 오류 복구','접수, 상대 데이터 대기, 병합, 통관 결과를 서로 다른 근거로 판단하도록 설계했습니다.');
 subhead(s,'같은 주문이 두 시스템에서 도착하는 상황',64,178,1144);
 const st=[['01  접수','물류 데이터 도착','HTTP 202 응답\n접수 사실만 확인'],['02  대기','짝이 되는 정보 미도착','상태 조회로\n대기와 검증 실패 구분'],['03  병합','주문·운송장 기준 일치','병합 결과를 확인\n통관 완료와 구분'],['04  결과','신고·통관 상태 조회','최종 결과를 근거로\n후속 운영 판단']];
 st.forEach((a,i)=>{const x=64+i*292;label(s,a[0],x,223,276,39,i===3?C.blue:C.ink,C.white,15);cell(s,a[1],x,274,276,56,{bold:true,color:C.blue});txt(s,a[2],x+16,347,244,68,15,C.body,false,'center');if(i<3)arrow(s,x+275,289,19,C.blue);});
 rule(s,64,438,1152);subhead(s,'오류가 확인되면 원천과 재처리 기준을 먼저 구분',64,464,1152);
 const rr=[['원천 확인','고객·인증 / 상품·포장 / 제출 필드를 구분'],['보완과 재처리','제공자별 식별자와 공식 처리 규칙 적용'],['다시 확인','응답 원문·제출 이력·최종 상태를 대사']];
 rr.forEach((a,i)=>{const x=64+i*394;label(s,a[0],x,507,370,36,C.blueTint,C.blue,15);txt(s,a[1],x+14,558,342,67,14.5,C.body);});
 takeaway(s,'필드 매핑표는 값의 계약, 상태 정의는 다음 작업을 시작할 조건이 됐습니다.',637,C.blue);
 caption(s,'정책 기반 시뮬레이션 · 실제 운영 로그를 재현한 화면이 아님',64,691,1152);
 notes(s,'경력 사실 원장 C-128. planning_v7.html 9절 상태와 재시도. merged는 통관 완료가 아니며 pending은 대기와 검증 실패를 조회로 구분. 구현 완료 상태는 주장하지 않음.');
}
// 10. Test evidence, no invented allocation.
{
 const s=newSlide();header(s,10,'07','정상 경로와 오류 복구 검증','운영 환경에서 정상 접수, 의도 오류 반환, 수정 후 재제출을 함께 확인했습니다.');
 subhead(s,'운영 환경에서 확인한 세 가지 목적',64,178,711);
 const rr=[['정상 접수','정상 데이터를 제출하고 접수 결과를 확인'],['의도 오류','오류가 있는 입력에 예상한 오류 응답이 오는지 확인'],['수정 재제출','원천 데이터를 보완한 뒤 정상 접수로 전환되는지 확인']];
 rr.forEach((a,i)=>{box(s,64,222+i*103,733,84);label(s,String(i+1).padStart(2,'0'),83,244+i*103,49,34,C.blue,C.white,13);txt(s,a[0],152,237+i*103,592,29,19,C.ink,true);txt(s,a[1],152,274+i*103,592,29,14.5,C.gray);});
 box(s,837,222,379,290,C.blueTint,'none',7);txt(s,'30건',857,250,339,78,57,C.blue,true,'center');txt(s,'테스트 목적 30/30 통과',857,346,339,43,21,C.blue,true,'center');txt(s,'정상 접수와 오류 반환·수정 복구를\n함께 포함한 검증 결과',861,410,331,55,14.5,C.body,false,'center');
 subhead(s,'검증의 범위',64,564,1100);txt(s,'정상 접수·오류 반환·수정 복구를 포함한 30건의 검증입니다.\n운영 전체의 자동 처리율과는 별개이며, 시나리오별 개별 건수는 미확인입니다.',64,605,1116,57,16,C.body);
 notes(s,'경력 사실 원장 C-027. 2026-08-28 사용자 직접 확인: 운영 환경 30건 검증, 테스트 목적 30/30 통과. 유형별 건수와 오류코드는 원본 로그가 없어 기재하지 않음.');
}
// 11. Operations and next problem with clear status.
{
 const s=newSlide();header(s,11,'08','운영 결과와 후속 과제','신규 연동과 기존 방식을 병행해 집계 대상 주문의 통관 완료를 확인했습니다.');
 txt(s,'일평균 약',64,199,386,31,19,C.gray);txt(s,'300건',64,243,486,92,66,C.blue,true);txt(s,'자사몰 약 230건 / 기타 약 70건',64,355,519,39,20,C.ink,true);txt(s,'집계기간 2026-08-28 ~ 2026-09-15\n집계 대상 주문 전체 통관 완료',64,415,529,62,16,C.body);
 box(s,649,191,567,305,C.soft,'none',7);subhead(s,'결과를 해석한 범위',674,215,514);txt(s,'신규 신고 경로와 기존 방식이 함께 쓰인 운영 결과입니다.\n자동 처리율·신규 경로 비중·처리 시간은 별도 계측하지 않았습니다.',674,261,510,83,17,C.body);rule(s,674,368,510);txt(s,'운영에서 남은 수기 보완을 다음 개선 과제로 연결',674,399,510,55,18,C.blue,true);
 subhead(s,'후속 기획: 고객 통관정보 보완',64,538,887);label(s,'기획 중 · 미배포',1030,536,186,30,C.blueTint,C.blue,12);
 const rr=[['고객 연락','정보 보완 필요 안내'],['주문 확인','대상 주문과 고객 확인'],['정보 보완','누락된 통관정보 수집'],['검증·재투입','운영자가 검증 후 처리']];rr.forEach((a,i)=>smallStep(s,a[0],a[1],64+i*292,586,276,C.blue));
 notes(s,'경력 사실 원장 C-100·101·102·103. 2026-09-15 사용자 확인 운영 집계. 후속 통관정보 보완 웹서비스는 기획 중이며 배포나 효과 검증 완료가 아님.');
}
// 12. Original green project opening.
{const s=newSlide();projectCover(s,12,true);notes(s,'경력 사실 원장 C-030~039·076. 사업 규모와 확정 일정. 계약 항목 전체 완료와 핵심 서비스 가동을 구분.');}
// 13. Original AS-IS and pain layout.
{
 const s=newSlide();header(s,13,'01','배경과 AS-IS 업무 흐름','같은 주문을 여러 곳에 옮겨 적고, 계약 조건을 사람이 다시 확인하는 일이 반복됐습니다.',C.green);
 const steps=[['구글 폼 주문','조리원 담당자 작성'],['시트 취합','운영팀 수기 정리'],['입금 대조','계좌와 주문 확인'],['거래명세서','건별 메일 발송'],['ERP 등록','주문 재입력'],['월말 정산','자료 대조']];
 steps.forEach((a,i)=>{smallStep(s,a[0],a[1],64+i*195,179,181,C.green);if(i<5)arrow(s,245+i*195,202,13);});
 subhead(s,'운영에서 확인한 부담',64,300,552,C.green);
 const metrics=[['매일 입금 대조','15~30분','입금자명·금액을 주문과 확인'],['오출고','월 2~3건','직전 6개월 월평균'],['CS 문의','2주 환산 32건','2026-01~06 인입 이력 기준']];
 metrics.forEach((a,i)=>{box(s,64,344+i*74,552,58,C.soft,'none',5);txt(s,a[0],82,359+i*74,177,25,14.5,C.ink,true);txt(s,a[1],268,359+i*74,141,27,17,C.green,true);txt(s,a[2],431,352+i*74,168,40,11,C.gray,false,'left','middle');});
 caption(s,'입금 대조는 도입 전 소요시간 / 오출고·문의는 운영팀 출고·CS 이력',64,573,554);
 subhead(s,'문제 정의',657,300,552,C.green);box(s,657,344,559,106,C.greenTint,'none',7);txt(s,'계약·결제·주문 상태를\n사람의 기억으로 매번 판단하는 구조',682,365,510,67,22,C.green,true);
 listRow(s,'01','등급별 상품과 결제 조건이 화면·서버에서 일치해야 함',657,479,548,C.green);listRow(s,'02','잘못된 조합은 주문 전에 막고 고객이 다음 행동을 알 수 있어야 함',657,557,548,C.green);
 takeaway(s,'우선 해결할 문제를 주문 오류 예방과 반복 확인 업무의 감소로 정했습니다.',644,C.green);
 notes(s,'경력 사실 원장 C-030·035·040·042·043. 기준 디자인 원본 10장 업무 흐름. 초기 오출고 전체 측정 범위와 문의 환산 기준은 결과 장에 명시.');
}
// 14. Alternatives and scope, same frame as original.
{
 const s=newSlide();header(s,14,'02','대안 비교와 오픈 범위','운영팀이 익숙한 플랫폼 위에 계약별 정책을 추가하는 방식을 선택했습니다.',C.green);
 table(s,[['대안','장점','판단한 제약','결정'],['맞춤형 웹서비스 개발','요구사항을 자유롭게 구현','서버 운영과 유지보수 책임이 내부로 확대','제외'],['다른 쇼핑몰 솔루션','기본 기능을 빠르게 활용','운영팀이 새 환경을 학습하고 기존 인프라와 이원화','제외'],['기존 솔루션 + 정책 맞춤','기존 인프라와 운영 방식 유지','정책 예외를 구체화하고 별도 개발 범위를 관리','채택']],64,178,[235,258,492,167],[36,66,66,66],C.green,3,14.2);
 label(s,'결정 기준  ① 운영팀 학습 부담    ② 기존 인프라    ③ 유지보수 책임    ④ 구축비용',64,431,1152,39,C.soft,C.ink,14);
 subhead(s,'범위에서 뺀 기능과 이유',64,509,1152,C.green);
 const rr=[['PG 결제','B2B 마진 대비 수수료 부담'],['견적서 신규 개발','기존 거래명세서로 대체'],['포인트 완전 자동화','계약 변경과 비가역 차감 위험\n담당자 확인 후 실행']];
 rr.forEach((a,i)=>{const x=64+i*394;label(s,a[0],x,553,370,38,C.amberTint,C.amber,16);txt(s,a[1],x+14,608,342,57,15,C.body,false,'center');});
 notes(s,'경력 사실 원장 C-035·036·130. 대안 비교와 범위 제외 근거. 공급사 직접 입력·입금자동매칭은 구현 증빙 수준이 달라 핵심 성과에서 제외.');
}
// 15. Editable current policy table and actual source crop.
{
 const s=newSlide();header(s,15,'03','계정 정책을 설정표로 고정','회원 등급과 상품 카테고리를 조합해, 고객 화면과 서버가 같은 결제 규칙을 쓰도록 했습니다.',C.green);
 subhead(s,'회원 등급 × 상품 카테고리',64,178,734,C.green);
 table(s,[['회원 등급','분유','물품','미분류'],['물품계약(선불)','무통장 입금','포인트','무통장 입금'],['물품계약(후불)','후불(선출고)','포인트','무통장 입금'],['선불입금','무통장 입금','무통장 입금','무통장 입금'],['후불입금','후불(선출고)','후불(선출고)','무통장 입금']],64,221,[236,188,171,175],[36,45,45,45,45],C.green,-1,14.5);
 box(s,969,221,247,216,C.greenTint,'none',6);txt(s,'설계한 규칙',991,238,203,29,17,C.green,true);txt(s,'새 등급·카테고리 설정\n\n미분류 상품의 기본값 관리\n\n서버에서 결제수단 재검증',991,284,204,137,14.5,C.body);
 subhead(s,'운영자가 직접 수정하는 설정 화면 · 핵심 2개 등급 발췌',64,464,1152,C.green);
 await evidence(s,'policy-settings.png',64,508,1152,172,'개발사 처리결과 문서의 등급별 결제수단 설정 영역. 회원수와 상품수 제거');
 caption(s,'개발사 처리결과 문서 캡처 · 실제 운영 화면 직접 캡처 아님 · 회원 수·상품 수 제거',64,687,1152);
 notes(s,'경력 사실 원장 C-033·129. 산후조리원몰_과업내역_처리결과.html 과업1, 228~250행. 수치가 포함된 계정·상품 데이터는 캡처에서 제외.');
}
// 16. Customer/operator lanes and real customer-facing evidence.
{
 const s=newSlide();header(s,16,'04','사용자 여정과 운영의 연결','고객의 주문·확인 행동과 운영팀의 설정·검수 행동을 같은 흐름에 배치했습니다.',C.green);
 const x=[64,210,461,712,963],w=[134,239,239,239,253];
 ['역할','주문','결제·접수','주문 확인','출고 이후'].forEach((t,i)=>label(s,t,x[i],181,w[i],34,i?C.ink:C.greenTint,i?C.white:C.green,14.5));
 const rows=[['조리원 담당자','허용 상품 확인\n분류별로 주문','계정 정책에 맞는\n결제수단 선택','마이페이지에서\n진행 상태 조회','거래명세서 출력\n배송 요청 확인'],['내부 운영팀','계약별 계정·\n정책 값 설정','입금·후불 상태를\n구분해 확인','운영 화면과\n예외 주문 점검','포인트 정리\n운영 피드백 반영']];
 rows.forEach((rr,ri)=>rr.forEach((t,ci)=>cell(s,t,x[ci],230+ri*96,w[ci],81,{fill:ci?C.white:C.greenTint,color:ci?C.body:C.green,bold:ci===0,size:14.5})));
 subhead(s,'고객에게 보이는 운영 안내',64,462,555,C.green);
 await image(s,path.join(ROOT,'evidence/b2b/submission_safe/home_feature_banner.png'),64,509,552,122,'실제 운영 홈의 거래명세서·마감시간·배송조회 안내');
 subhead(s,'고객이 직접 확인하는 주문 상태',660,462,556,C.green);
 await image(s,path.join(ROOT,'evidence/b2b/submission_safe/mypage_order_status.png'),660,511,556,119,'개인정보와 상태별 건수를 제외한 마이페이지 주문상태 화면');
 caption(s,'실제 운영 화면 발췌 · 2026-08-28 · 고객정보·가격·주문번호·상태 건수 제거',64,665,1152);
 notes(s,'경력 사실 원장 C-047·048·131·132. 실제 운영 홈·마이페이지 캡처. 업무 흐름은 현재 정책 기반 재구성. 공급사별 권한·송장입력은 증거 부족으로 제외.');
}
// 17. Concrete exception: mixed categories using same payment method.
{
 const s=newSlide();header(s,17,'05','결제방식이 같아도 혼합주문을 차단','결제방식이 같은 경우에도 분유와 물품은 나눠 주문해야 한다는 운영 규칙을 반영했습니다.',C.green);
 label(s,'가상 예시: 선불입금 회원',64,180,549,35,C.greenTint,C.green,15);
 cell(s,'분유\n무통장 입금',64,234,253,79,{bold:true,color:C.green,size:18});txt(s,'+',326,252,36,34,26,C.gray,false,'center');cell(s,'물품\n무통장 입금',370,234,243,79,{bold:true,color:C.green,size:18});
 table(s,[['판단 기준','처리 결과'],['이전: 결제방식 비교','둘 다 무통장이므로 혼합주문 통과'],['보완: 카테고리 비교','분류가 다르면 차단하고 분리 주문 안내']],64,356,[220,393],[34,58,68],C.green,2,14.5);
 subhead(s,'고객에게 보여준 다음 행동',656,180,560,C.green);
 await evidence(s,'mixed-modal.png',715,228,425,244,'혼합 주문을 막고 분류별 주문을 안내하는 모달');
 txt(s,'막힌 이유와 분류별 주문 방법을 함께 안내',656,501,560,45,17,C.green,true,'center');
 takeaway(s,'정책의 기준을 결제수단에서 상품 분류로 옮겨, 같은 결제수단의 예외까지 막았습니다.',595,C.green);
 caption(s,'좌측: 정책 기반 가상 예시 / 우측: 개발사 문서 캡처(분유·미지정 테스트 상품) · 실운영 직접 캡처 아님',64,661,1152);
 notes(s,'경력 사실 원장 C-034. 산후조리원몰_과업내역_처리결과.html 322~327행. 실제 주문을 재현한 로그가 아닌 정책 설명 시뮬레이션.');
}
// 18. Point deletion safety through a sequence and decision table.
{
 const s=newSlide();header(s,18,'06','포인트 정리의 실행 안전장치','월 1회 발생하는 비가역 작업이어서, 대상과 차감 결과를 확인한 뒤 실행하도록 범위를 조정했습니다.',C.green);
 const st=[['미리보기','현재·차감·잔여 확인'],['대상 선택','처리할 회원 선택'],['최종 확인','대상과 합계를 재확인'],['실행·기록','현재 상태 재검증']];
 st.forEach((a,i)=>{smallStep(s,a[0],a[1],64+i*292,182,276,C.green);if(i<3)arrow(s,341+i*292,204,14,C.green);});
 subhead(s,'조회한 뒤 회원 상태가 바뀐다면',64,305,1152,C.green);
 table(s,[['가상 대상','조회 후 상황','실행 시 처리','막으려는 문제'],['회원 A','상태 변동 없음','선택한 대상만 정리','대상 외 회원의 임의 차감'],['회원 B','포인트 사용 또는 등급 변경','변경 회원 자동 제외','오래된 화면 값으로 과다 차감'],['같은 조건 재실행','운영자가 실행을 다시 누름','추가 차감하지 않음','중복 실행으로 반복 차감']],64,350,[160,320,320,352],[38,64,64,64],C.green,2,14.5);
 box(s,64,615,1152,51,C.greenTint,'none',6);txt(s,'판단',82,629,73,25,15,C.green,true);txt(s,'정기 자동 실행의 추가 운영 부담과 잘못된 회수 위험을 비교해, 담당자 확인 방식으로 조정했습니다.',166,628,1024,31,15.5,C.green,true);
 caption(s,'정책 기반 시뮬레이션 · 회원 A/B는 가상 예시이며 포인트 금액·고객정보는 포함하지 않음',64,682,1152);
 notes(s,'경력 사실 원장 C-036·130. 산후조리원몰_과업내역_처리결과.html 452~477행. 자동 실행 대신 담당자 확인 후 실행 결정과 안전장치 근거.');
}
// 19. QA case, proof and acceptance criteria.
{
 const s=newSlide();header(s,19,'07','완료 통보를 운영 검수 기준으로 바꿈','정보 수정 화면에 들어갈 수 없었던 사례에서, 배포와 기능 동작을 따로 확인했습니다.',C.green);
 const rr=[['현상','마이페이지의 정보 수정에 진입 불가'],['확인','운영 서버 미반영과 이전 차단 로직 잔존'],['검수 기준','메뉴 노출·실제 진입·수정 가능한 항목을 확인']];
 rr.forEach((a,i)=>{label(s,a[0],64,183+i*95,118,61,i===2?C.green:C.greenTint,i===2?C.white:C.green,15);txt(s,a[1],207,193+i*95,485,65,17,i===2?C.green:C.body,i===2);});
 subhead(s,'정보 수정 메뉴의 추가 여부를 확인',745,179,471,C.green);
 await evidence(s,'mypage-before.png',745,232,228,238,'정보수정 메뉴가 없는 기능 화면의 메뉴 영역 확대');
 await evidence(s,'mypage-after.png',989,232,228,238,'정보수정 메뉴가 추가된 기능 화면의 메뉴 영역 확대');
 label(s,'확인 전',760,482,200,28,C.soft,C.gray,12);label(s,'반영 후',1003,482,200,28,C.greenTint,C.green,12);
 subhead(s,'같은 기능을 다른 조건에서도 확인',64,518,1100,C.green);
 table(s,[['조건','사용자 행동','기대 결과'],['운영 서버·실제 계정','정보 수정 메뉴 클릭','비밀번호 확인 후 화면 진입'],['고정 항목과 변경 가능 항목','아이디·주소 / 연락처 확인','고정값은 보호, 허용 항목만 수정']],64,559,[300,398,454],[32,44,44],C.green,-1,14);
 caption(s,'개발사 처리결과 문서 캡처 · 실제 운영 화면 직접 캡처 아님 · 고객정보 영역 제외',64,687,1152);
 notes(s,'경력 사실 원장 C-038·046. 산후조리원몰_과업내역_처리결과.html 329~344행. 수용 기준은 실제 문제·요구사항을 바탕으로 재구성.');
}
// 20. Iteration through real feedback and visual evidence.
{
 const s=newSlide();header(s,20,'08','운영 피드백으로 화면을 다시 조정','2026-08-13 운영 반영: 반복해서 하는 행동과 누락된 현장 요청을 화면에 반영했습니다.',C.green);
 subhead(s,'거래명세서를 주문내역에서 바로 출력',64,180,552,C.green);
 await evidence(s,'statement-before.png',64,230,248,161,'거래명세서 접근 개선 전 확인리뷰 버튼 영역');
 await evidence(s,'statement-after.png',366,230,248,161,'거래명세서 버튼을 주문내역에 배치한 화면');
 arrow(s,325,291,28,C.green);caption(s,'요청 전',64,403,248);caption(s,'반영 후',366,403,248);
 txt(s,'주문당 버튼 1개, 취소·환불 주문은 제외\n구매확정·리뷰 기능은 주문상세에 유지',64,454,552,61,16,C.body);
 subhead(s,'삭제했던 배송 메시지 입력칸 복원',658,180,558,C.green);
 await evidence(s,'delivery-message.png',658,230,558,174,'배송 시 요청사항을 입력하도록 복원한 배송 메시지 영역');
 txt(s,'1차 QA에서 제거했던 입력칸을\n배송 시 요청을 받는 용도로 다시 반영',658,454,558,61,16,C.body);
 box(s,64,559,1152,103,C.greenTint,'none',7);txt(s,'운영에서 확인한 것',86,578,224,27,16,C.green,true);txt(s,'화면을 단순하게 만드는 것만으로 업무가 끝나지 않았습니다.\n자주 쓰는 행동은 앞에 두고, 실제로 필요한 입력은 다시 남겼습니다.',331,577,863,65,19,C.green,true);
 caption(s,'개발사 처리결과 문서 캡처 · 실제 운영 화면 직접 캡처 아님 · 고객정보·주문·가격 영역 제외',64,681,1152);
 notes(s,'경력 사실 원장 C-131. 산후조리원몰_과업내역_처리결과.html 695~721행. 2026-08-13 운영 반영 및 고객 화면 확인 명시. 개발사 구현과 본인 요구·운영 검수 역할을 구분.');
}
// 21. Results and scope boundary.
{
 const s=newSlide();header(s,21,'09','초기 운영 결과와 측정 범위','출고·문의 지표의 초기 관찰과, 계약상 전체 개발요구의 검수를 구분했습니다.',C.green);
 subhead(s,'오출고',64,184,552,C.green);txt(s,'월평균 2~3건',64,229,319,40,25,C.gray);txt(s,'0건',408,222,192,71,52,C.green,true,'right');rule(s,64,314,552);
 txt(s,'직전 6개월 월평균과 2026-07-16 전체 가동 후\n약 1개월을 비교한 전체 측정 범위의 관찰값',64,338,552,71,15,C.body);
 subhead(s,'CS 문의',664,184,552,C.green);txt(s,'2주 32건',664,229,279,40,25,C.gray);txt(s,'2주 19건',959,228,257,55,34,C.green,true,'right');rule(s,664,314,552);
 txt(s,'2026-01~06 CS 인입의 2주 환산치와\n2026-07~08 배포 구간 2주 집계를 비교',664,338,552,71,15,C.body);
 box(s,64,459,1152,141,C.soft,'none',6);txt(s,'운영과 검수의 경계',85,478,299,29,17,C.green,true);txt(s,'핵심 흐름은 2026-07-16 가동 후 약 1개월 관찰\n계약상 기본 개발요구 22건은 2026-08-31 최종검수까지 운영 QA 지속',364,477,826,60,15.5,C.body);txt(s,'2026-08-13 검수 기록: 배포·QA 필요 17건 / 부분·수정·구현변경 후 QA 각 1건 / 진행 중 계약 항목 2건',85,557,1103,28,12,C.gray);
 takeaway(s,'다음 측정은 입금 대조 시간과 오출고·CS 문의의 장기 추이입니다.',632,C.green);
 caption(s,'원천: 운영팀 출고·CS 이력과 사용자 확인 · 초기 관찰이며 장기 지속 효과와 단독 인과는 미검증',64,686,1152);
 notes(s,'경력 사실 원장 C-031·040·042·043·044. 정산시간 C-041은 비교 월 미확인으로 제외. 입금자동매칭 완료·서비스 밖 문의 개선을 주장하지 않음.');
}
// 22. Original closing composition.
{
 const s=newSlide();box(s,871,0,409,720,C.soft,'none',0);
 txt(s,'현장의 문제를 구조로 바꾸고,\n운영에서 확인하는 PM입니다.',64,92,741,79,28,C.ink,true);
 txt(s,'두 프로젝트에서 만든 업무 방식',104,253,697,36,19,C.blue,true);
 const rr=[['01','정책의 기준을 구체적인 예외까지 내려 씁니다','주문과 포장을 구분하고, 같은 결제수단의 혼합주문 예외를 확인했습니다.'],['02','시스템 제약과 운영 영향을 함께 판단합니다','혼재 주문의 내수 지연을 수용하고, 포인트 정리에 담당자 확인을 남겼습니다.'],['03','완료는 실제 운영의 기대 결과로 판단합니다','관세청 오류 수정·재제출과 B2B 고객 화면을 검증하고 초기 결과를 관찰했습니다.']];
 rr.forEach((a,i)=>{txt(s,a[0],64,331+i*108,37,26,14,'#3483E8',true);txt(s,a[1],104,327+i*108,709,33,18,C.ink,true);txt(s,a[2],104,373+i*108,711,53,13.5,C.gray);});
 txt(s,'박종혁',892,317,354,54,31,C.ink,true,'center');txt(s,'PM PORTFOLIO',893,382,353,26,15,C.blue,true,'center');txt(s,'감사합니다',894,445,352,37,24,C.ink,true,'center');
 notes(s,'경력 사실 원장 C-025·027·029·034·038·040·042·126~131.');
}

// Export fully editable reconstruction in the exact reference canvas/font family.
const candidate=path.join(BUILD,`candidate-${REV}.pptx`);
await (await PresentationFile.exportPptx(P)).save(candidate);
const zip=await JSZip.loadAsync(await fs.readFile(candidate));
// Horizontal-only table rules match the reference; normalize all cells' anchors and fonts.
for(const [name,f] of Object.entries(zip.files)) if(/^ppt\/slides\/slide\d+\.xml$/.test(name)){
 let x=await f.async('string');
 x=x.replace(/<a:tbl>[\s\S]*?<\/a:tbl>/g,t=>t.replace(/<a:tcPr\b([^>]*)>([\s\S]*?)<\/a:tcPr>/g,(_m,attrs,body)=>{
   const clean=body.replace(/<a:ln([LRTB])\b[^>]*>[\s\S]*?<\/a:ln\1>/g,'');
   const borders=['L','R','T'].map(side=>`<a:ln${side} w="0"><a:noFill/></a:ln${side}>`).join('')+'<a:lnB w="6350"><a:solidFill><a:srgbClr val="D9D9E0"/></a:solidFill><a:prstDash val="solid"/></a:lnB>';
   return `<a:tcPr${attrs.replace(/anchor="[^"]*"/g,'anchor="ctr"')}>${borders}${clean}</a:tcPr>`;
 }));
 zip.file(name,x);
}
const core=zip.file('docProps/core.xml');if(core){let x=await core.async('string');x=x.replace(/<dc:creator>[\s\S]*?<\/dc:creator>/,'<dc:creator>박종혁</dc:creator>').replace(/<dc:title>[\s\S]*?<\/dc:title>/,'<dc:title>박종혁 PM 포트폴리오 v4.3</dc:title>').replace(/<cp:lastModifiedBy>[\s\S]*?<\/cp:lastModifiedBy>/,'<cp:lastModifiedBy>박종혁</cp:lastModifiedBy>');zip.file('docProps/core.xml',x);}
await fs.writeFile(candidate,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
await fs.writeFile(path.join(BUILD,`sources-${REV}.json`),JSON.stringify(sources,null,2));
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const finalPath=path.join(ROOT,'output',`박종혁_PM_포트폴리오_v4.3_${REV}.pptx`);
const result=await finalizePresentation({explicitTotalSlideCount:22,requiredNativeTableOwnerSlides:[...new Set(tableOwners)],requiredNativeChartOwnerSlides:[],workspaceDir:ROOT,candidatePath:candidate,finalPath,pythonExecutable:'C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit',...[...new Set(tableOwners)].flatMap(n=>['--require-native-table-slide',String(n)])],fontPolicy:{basis:'reference',families:[FONT],referencePath:REFERENCE,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(REFERENCE)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(BUILD,`validation-${REV}.json`)});
console.log(JSON.stringify({finalPath,result},null,2));

"""Apply authored content to original OOXML runs to retain exact template typography.
The Artifact Tool draft is also exported; this fidelity pass preserves masters,
untouched slides, native tables, fonts, pictures and user's open working changes.
No python-pptx is used.
"""
from pathlib import Path
from copy import deepcopy
import zipfile,json,posixpath
from lxml import etree as E
from PIL import Image
D=Path(__file__).parent
M=json.loads((D/'content.json').read_text('utf-8'))
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL='http://schemas.openxmlformats.org/package/2006/relationships'
def tag(k):
 pre,n=k.split(':');return '{'+NS[pre]+'}'+n
def serial(r):return E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
def set_text(body,text):
 ps=body.findall('a:p',NS);template=ps[0] if ps else E.Element(tag('a:p'))
 rp=template.find('.//a:rPr',NS)
 if rp is None:rp=template.find('a:endParaRPr',NS)
 pp=template.find('a:pPr',NS)
 for old in ps:body.remove(old)
 for line in text.split('\n'):
  p=E.SubElement(body,tag('a:p'))
  if pp is not None:p.append(deepcopy(pp))
  run=E.SubElement(p,tag('a:r'))
  if rp is not None:
   style=deepcopy(rp);style.tag=tag('a:rPr');run.append(style)
  E.SubElement(run,tag('a:t')).text=line
def find_obj(root,ident):
 for obj in root.find('p:cSld/p:spTree',NS):
  cv=obj.find('.//p:cNvPr',NS)
  if cv is not None and cv.get('id')==str(ident):return obj
 raise ValueError(ident)
with zipfile.ZipFile(D/'source.pptx') as z: parts={n:z.read(n) for n in z.namelist()}
edited=set(map(int,M['shapes']))|set(map(int,M['tables']))|set(map(int,M['remove']))
for s in edited:
 name=f'ppt/slides/slide{s}.xml';root=E.fromstring(parts[name]);key=str(s)
 for ident,text in M['shapes'].get(key,{}).items():set_text(find_obj(root,ident).find('p:txBody',NS),text)
 for ident,rows in M['tables'].get(key,{}).items():
  obj=find_obj(root,ident);trs=obj.findall('.//a:tr',NS)
  assert len(rows)==len(trs),(s,ident)
  for tr,row in zip(trs,rows):
   cells=tr.findall('a:tc',NS);assert len(row)==len(cells)
   for cell,text in zip(cells,row):set_text(cell.find('a:txBody',NS),text)
 for ident in M['remove'].get(key,[]):
  obj=find_obj(root,ident);obj.getparent().remove(obj)
 for ident,box in M['position'].get(key,{}).items():
  obj=find_obj(root,ident);xf=obj.find('p:spPr/a:xfrm',NS)
  off=xf.find('a:off',NS);ext=xf.find('a:ext',NS)
  for el,attrs,vals in [(off,['x','y'],box[:2]),(ext,['cx','cy'],box[2:])]:
   for a,v in zip(attrs,vals):el.set(a,str(round(v*12700)))
 for img in [i for i in M['images'] if i['slide']==s]:
  relname=f'ppt/slides/_rels/slide{s}.xml.rels';rels=E.fromstring(parts[relname]);rid='rIdPortfolioScreenshot'
  media=f'portfolio_scm_{s}.jpg';parts['ppt/media/'+media]=(D/img['file']).read_bytes()
  E.SubElement(rels,'{'+REL+'}Relationship',Id=rid,Type=NS['r']+'/image',Target='../media/'+media)
  parts[relname]=serial(rels)
  pic=E.Element(tag('p:pic'));nv=E.SubElement(pic,tag('p:nvPicPr'))
  E.SubElement(nv,tag('p:cNvPr'),id='1001',name=f'SCM sample screenshot {s}',descr=img['alt'])
  lock=E.SubElement(nv,tag('p:cNvPicPr'));E.SubElement(lock,tag('a:picLocks'),noChangeAspect='1');E.SubElement(nv,tag('p:nvPr'))
  fill=E.SubElement(pic,tag('p:blipFill'));E.SubElement(fill,tag('a:blip'),{tag('r:embed'):rid})
  iw,ih=Image.open(D/img['file']).size;x,y,w,h=img['sourceCrop']
  E.SubElement(fill,tag('a:srcRect'),l=str(round(x/iw*100000)),t=str(round(y/ih*100000)),r=str(round((iw-x-w)/iw*100000)),b=str(round((ih-y-h)/ih*100000)))
  stretch=E.SubElement(fill,tag('a:stretch'));E.SubElement(stretch,tag('a:fillRect'))
  sp=E.SubElement(pic,tag('p:spPr'));xf=E.SubElement(sp,tag('a:xfrm'));x,y,w,h=img['position']
  E.SubElement(xf,tag('a:off'),x=str(round(x*12700)),y=str(round(y*12700)))
  E.SubElement(xf,tag('a:ext'),cx=str(round(w*12700)),cy=str(round(h*12700)))
  geom=E.SubElement(sp,tag('a:prstGeom'),prst='rect');E.SubElement(geom,tag('a:avLst'))
  root.find('p:cSld/p:spTree',NS).append(pic)
 parts[name]=serial(root)
 # Revised speaker notes provide sources and distinguish screenshots from outcomes.
 rels=E.fromstring(parts[f'ppt/slides/_rels/slide{s}.xml.rels'])
 nr=next((r for r in rels if r.get('Type','').endswith('/notesSlide')),None)
 if nr is not None:
  note_path=posixpath.normpath('ppt/slides/'+nr.get('Target'));notes=E.fromstring(parts[note_path])
  body=notes.find('.//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]/p:txBody',NS) if False else None
  for sp in notes.findall('.//p:sp',NS):
   ph=sp.find('p:nvSpPr/p:nvPr/p:ph',NS)
   if ph is not None and ph.get('type')=='body':body=sp.find('p:txBody',NS);break
  if body is not None:
   if 11<=s<=17:
    txt='출처: 2026-10-08 사용자 제공 이력. 공통자료/SCM_업무성과.md C-080, C-081, C-094, C-095, C-104, C-113. 구현 참조: C:/MyMain/Eibe/SCM-Dashboard/app 및 web.\n성과는 사용자 확인과 업무 기록 기준. 자료 업로드·결과 검토 1시간 이내, 도입 후 약 3개월 취합 과정 오류 0건. 원천 자료 오류 및 발주 판단·승인 시간과 구분. 월간 발주 검토 2026-04~08 5회.'
    if s in [14,15]:txt+='\n샘플 화면: 실제 v1 앱을 격리 복제해 합성 SKU·창고·재고로 실행. 운영 DB는 사용하지 않음. 시연용 inventory.html에서 초기 배열·필터 로드 순서, 창고 ID 타입, product_code 매핑을 보정함. 원본 코드와 디자인은 변경하지 않음. 표시 수량·금액·날짜는 합성값이며 성과의 증거가 아님. /order-plan은 전체 품목(요약) 화면이며 가중치 가정에 따른 시나리오.\n화면 제작 기록: resume/tmp/portfolio_dashboard_20261008/DEMO_README.md'
   elif s in [18,23]:txt='출처: 2026-10-08 사용자 제공 이력; 공통자료/PM_프로젝트성과.md C-021, C-022, C-027, C-100, C-102. 프로젝트 기간 2026-02~2026-08-28. 운영환경 시나리오 30건 기대 결과 확인. 2026-08-28~09-15 집계 일평균 약 300건(자사몰230+외부70), 신규와 기존 통관 방식 병행 집계. 전 채널 신규 API 완료나 무인 자동화 실적으로 해석하지 않음. 참조: 관세청/planning/planning_v7.html 및 관세청_PM_운영_인수인계_20261004.md.'
   elif s==3:txt='출처: 2026-10-08 사용자 제공 이력과 공통자료/PM_프로젝트성과.md. B2B 2026-06~08, 핵심 흐름 2026-07-16 가동, 08-31 후속 최종 검수. 정책·요구사항·개발사 조율·운영 QA는 본인, 구현은 개발사. 공급사 수는 외부 공개 내용에서 제외.'
   else:txt='2026-10-08 기본 포트폴리오 갱신. B2B 주문몰, SCM 대시보드, ERP·통관 연동의 세 사례로 구성. 사용자 제공 이력과 공통자료/SCM_업무성과.md, 공통자료/PM_프로젝트성과.md 기준. 기존 양식의 글꼴·색·레이아웃과 열린 파일의 사용자 편집을 보존. 원본은 저장되지 않은 상태로 열려 있어 별도 수정본으로 제공.'
   set_text(body,txt);parts[note_path]=serial(notes)
# Ensure JPEG content type exists.
ct=E.fromstring(parts['[Content_Types].xml']);cns='http://schemas.openxmlformats.org/package/2006/content-types'
if not any(e.get('Extension')=='jpg' for e in ct):E.SubElement(ct,'{'+cns+'}Default',Extension='jpg',ContentType='image/jpeg')
parts['[Content_Types].xml']=serial(ct)
if 'docProps/core.xml' in parts:
 core=E.fromstring(parts['docProps/core.xml'])
 for e in core:
  if e.text and any(t in e.text.lower() for t in ['bigsee','마켓빅시','market-bigsee']):
   e.text='PM 포트폴리오: B2B 주문몰 · SCM 대시보드 · ERP·통관 연동'
 parts['docProps/core.xml']=serial(core)
with zipfile.ZipFile(D/'candidate.pptx','w',zipfile.ZIP_DEFLATED) as z:
 for n,data in parts.items():z.writestr(n,data)
print(json.dumps({'edited_slides':sorted(edited),'candidate':str(D/'candidate.pptx')},ensure_ascii=False))

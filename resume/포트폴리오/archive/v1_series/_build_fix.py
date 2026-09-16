# -*- coding: utf-8 -*-
"""v1.1 포트폴리오의 2장(목차)·9장(B2B 표지)을 교체한다.
v1은 전 슬라이드가 통이미지이므로 같은 디자인으로 2장을 만들어 PNG로 렌더한 뒤
ppt/media/image2.png · image9.png 를 갈아 끼운다.

수정 사유 (career_facts 10절 · 메타 감사)
- 2장 목차: `로그인 확인 180명`·`회수 기준 산정` 폐기 수치 / B2B 일정 오기 / `02 / 23` 페이지수 / 오출고 측정범위 누락 / 강점 라벨 불일치
- 9장 표지: `개발 착수 07.13 · 전체 적용 07.14` 폐기 일정
"""
import os
from pptx import Presentation
from pptx.util import Inches as I, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HERE = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(HERE, "_fix_tmp.pptx")

F = "Malgun Gothic"
INK, SUB, LINE, WHITE = "1A1A1A", "6E6E73", "D6D6DB", "FFFFFF"
KCS, KCS_D, KCS_L = "1B4F9C", "16437F", "D2DFF1"
B2B, B2B_D, B2B_L = "1E6B45", "17563A", "CDEAD9"
MB,  MB_D,  MB_L = "B34700", "8F3900", "E8C4A4"
GRAY_N = "D6D6DB"

ML, CW, RGT = 0.667, 11.995, 12.662


def C(h): return RGBColor.from_string(h)


def tb(sl, x, y, w, h, size=11, color=INK, bold=False,
       align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.0):
    s = sl.shapes.add_textbox(I(x), I(y), I(w), I(h))
    tf = s.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    p.line_spacing = spacing
    s._d = (size, color, bold)
    return s


def put(sh, t, size=None, color=None, bold=None, spacing=None):
    tf = sh.text_frame
    first = (len(tf.paragraphs) == 1 and not tf.paragraphs[0].runs)
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    if spacing is not None: p.line_spacing = spacing
    p.alignment = tf.paragraphs[0].alignment
    r = p.add_run(); r.text = t
    ds, dc, db = sh._d
    r.font.name = F
    r.font.size = Pt(size if size is not None else ds)
    r.font.bold = db if bold is None else bold
    r.font.color.rgb = C(color if color is not None else dc)
    return p


def text(sl, x, y, w, h, t, size=11, color=INK, bold=False,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.0):
    sh = tb(sl, x, y, w, h, size, color, bold, align, anchor, spacing)
    put(sh, t)
    return sh


def rrect(sl, x, y, w, h, fill=None, line=None, radius=0.10, shape=MSO_SHAPE.ROUNDED_RECTANGLE):
    s = sl.shapes.add_shape(shape, I(x), I(y), I(w), I(h))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        try: s.adjustments[0] = min(0.5, radius / min(w, h))
        except Exception: pass
    if fill: s.fill.solid(); s.fill.fore_color.rgb = C(fill)
    else: s.fill.background()
    if line: s.line.color.rgb = C(line); s.line.width = Pt(0.75)
    else: s.line.fill.background()
    s.shadow.inherit = False
    tf = s.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = I(0.10)
    tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    return s


p = Presentation()
p.slide_width, p.slide_height = I(13.3333), I(7.5)

# ══════════════ 2장 — 목차
s = p.slides.add_slide(p.slide_layouts[6])
rrect(s, -0.2, -0.2, 13.8, 8.0, WHITE, radius=0, shape=MSO_SHAPE.RECTANGLE)
text(s, 10.462, 0.330, 2.200, 0.260, "02 / 22", 11, SUB, False, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE)

text(s, ML, 3.150, 3.000, 0.280, "Portfolio", 13, SUB)
text(s, ML, 3.480, 4.000, 0.800, "Project", 46, INK, True)

LX = 5.850                      # 세로선
CXN, CXB = 4.930, 6.270         # 큰 번호 / 본문
rrect(s, LX, 1.760, 0.022, 4.760, GRAY_N, radius=0, shape=MSO_SHAPE.RECTANGLE)

rows = [
    ("01", KCS, KCS_D, "규제 대응", "강점 · 이해관계 조율",
     "관세청 사전 거래정보 신고(TRA) 연동",
     "p 03 ~ 08  |  전체 구매 여정 및 로직 기획",
     "2026.02 ~ 08 · 개발비 약 4,000만원 · 데이터 4개 주체 · 조율 5개사"),
    ("02", B2B, B2B_D, "운영 디지털화", "강점 · 현장 구조화",
     "B2B 산후조리원 전용몰 구축",
     "p 09 ~ 14  |  기획·QA 총괄",
     "2026.06 기획 ~ 08.31 최종 검수 · 계약처 약 140개소 · 공급사 5곳"),
    ("03", MB, MB_D, "제품 기획", "강점 · 운영 안착",
     "마켓빅시 BIGSEE 리서치 SaaS",
     "p 15 ~ 21  |  제품·사업 기획 (개발 구현은 동료 전담)",
     "진행 중 · 등록 사용자 약 20명 (활성·유료 미확인)"),
]

y = 1.760
for num, col, cold, cat, tag, title, meta1, meta2 in rows:
    text(s, CXN, y - 0.180, 1.000, 0.700, num, 40, "E7E7EA", True, PP_ALIGN.RIGHT)
    d = rrect(s, LX - 0.058, y + 0.055, 0.138, 0.138, col, radius=0.069)
    text(s, CXB, y - 0.020, 2.400, 0.260, cat, 11.5, col, True, anchor=MSO_ANCHOR.MIDDLE)
    text(s, CXB + 2.500, y - 0.020, 3.000, 0.260, tag, 10.5, SUB, False, anchor=MSO_ANCHOR.MIDDLE)
    text(s, CXB, y + 0.290, 6.400, 0.380, title, 21, INK, True, anchor=MSO_ANCHOR.MIDDLE)
    text(s, CXB, y + 0.740, 6.400, 0.260, meta1, 11.5, SUB, anchor=MSO_ANCHOR.MIDDLE)
    text(s, CXB, y + 1.030, 6.400, 0.260, meta2, 10.5, "9A9AA0", anchor=MSO_ANCHOR.MIDDLE)
    y += 1.640

text(s, ML, 6.780, CW, 0.280,
     "성과 수치는 각 프로젝트 장에서 측정 기간·모수·원천과 함께 제시합니다.", 10, SUB)

# ══════════════ 9장 — B2B 표지
s = p.slides.add_slide(p.slide_layouts[6])
rrect(s, -0.2, -0.2, 13.8, 8.0, B2B, radius=0, shape=MSO_SHAPE.RECTANGLE)
text(s, 10.462, 0.330, 2.200, 0.260, "01 / 06", 11, B2B_L, False, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE)
text(s, ML, 0.840, 11.500, 0.320,
     "Project 02.   운영 디지털화 — 수기 운영을 설정형 시스템으로", 15, WHITE, True, anchor=MSO_ANCHOR.MIDDLE)

rrect(s, ML, 1.750, 0.950, 0.953, WHITE, radius=0.10)
text(s, ML, 1.750, 0.950, 0.620, "B2B", 20, B2B, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
text(s, ML, 2.360, 0.950, 0.300, "회원제 폐쇄몰", 8, B2B, False, PP_ALIGN.CENTER)

text(s, 1.900, 1.780, 6.450, 0.380, "산후조리원 전용 B2B 폐쇄몰 구축", 21.5, WHITE, True, anchor=MSO_ANCHOR.MIDDLE)
lede = tb(s, 1.900, 2.230, 6.450, 0.620, 13, B2B_L, spacing=1.48)
put(lede, "계약마다 달라지는 상품·단가·결제·포인트 규칙을")
put(lede, "운영자가 직접 설정하는 정책 구조로 바꿨습니다.")

for ly, k, vy, lines in [
    (2.990, "Concept", 3.290, ["계약 예외를 코드가 아니라 관리자 설정값으로 분해"]),
    (3.650, "Main Target", 3.900, ["계약 조리원 담당자 · 내부 운영팀 · 공급사 5곳"]),
    (4.310, "Project Goal", 4.560, ["오출고 제거 · 입금 대조 자동화 · 신규 계약을 개발 없이 처리"]),
]:
    text(s, 1.900, ly, 6.450, 0.250, k, 12, "9ED4B6", True, anchor=MSO_ANCHOR.MIDDLE)
    b = tb(s, 1.900, vy, 6.550, 0.520, 12.8, WHITE, spacing=1.45)
    for ln in lines: put(b, ln)

pan = rrect(s, 8.458, 1.750, 4.203, 3.391, B2B_D, radius=0.11)
text(s, 8.758, 1.980, 3.600, 0.260, "30개소에서 되던 것이 140개소에서 깨졌다", 12, B2B_L, True, anchor=MSO_ANCHOR.MIDDLE)
ry = 2.430
for a, bv in [("매일 입금 대조", "15~30분"), ("월말 정산", "2명 × 약 7시간"),
              ("오출고", "월 2~3건"), ("발주량 취합", "수기 시트")]:
    rrect(s, 8.758, ry, 3.603, 0.470, B2B, radius=0.07)
    text(s, 8.958, ry, 2.150, 0.470, a, 12.5, WHITE, True, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 11.111, ry, 1.050, 0.470, bv, 11, B2B_L, False, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE)
    ry += 0.640

ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, I(ML), I(5.470), I(CW), Pt(0.9))
ln.fill.solid(); ln.fill.fore_color.rgb = C("4E9370"); ln.line.fill.background(); ln.shadow.inherit = False

meta = [("기간", "2026.06 기획 → 07.02 개발 착수 → 07.16 핵심 서비스 전체 가동 → 08.06~08.13 운영 고도화·QA → 08.31 최종 검수"),
        ("Role", "문제 정의 / 플랫폼 대안 검토 / 서비스 정책·요구사항 정의 / 외주 개발 조율 / QA·UAT / 운영 정책 설계"),
        ("협업", "커머스 솔루션 구축사 · 내부 운영팀 · 영업 · 공급사 5곳"),
        ("산출물", "요구사항 대장 · 과업지시서 · 4계정 정책 매트릭스 · 권한표 · UAT 시나리오 · 운영 매뉴얼"),
        ("규모", "계약 조리원 약 140개소 · 물품 지원 계약 약 77개소 · 공급사 5곳")]
my = 5.840
for k, v in meta:
    text(s, ML, my, 0.900, 0.260, k, 10.5, "9ED4B6", True, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 1.600, my, RGT - 1.600, 0.260, v, 10.2, "E1F3E9", anchor=MSO_ANCHOR.MIDDLE)
    my += 0.280

p.save(TMP)
print("tmp saved:", TMP)

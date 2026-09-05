from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


APP_DIR = Path(__file__).resolve().parent
RESUME_ROOT = APP_DIR.parents[1]
OUTPUT_PATH = RESUME_ROOT / "output" / "pdf" / "박종혁_비나우_구매수요예측_SOP_지원서.pdf"
PHOTO_PATH = RESUME_ROOT / "_photo.png"
RESUME_MD = APP_DIR / "이력서.md"
COVER_MD = APP_DIR / "자기소개서.md"

PAGE_W, PAGE_H = A4
NAVY = colors.HexColor("#172033")
TEXT = colors.HexColor("#202534")
MUTED = colors.HexColor("#667085")
LINE = colors.HexColor("#D9DFEA")
PALE = colors.HexColor("#F7F9FC")
BLUE = colors.HexColor("#3366E8")
BLUE_PALE = colors.HexColor("#F3F6FF")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Malgun", r"C:\Windows\Fonts\malgun.ttf"))
    pdfmetrics.registerFont(TTFont("MalgunBold", r"C:\Windows\Fonts\malgunbd.ttf"))


def safe(text: str) -> str:
    return html.escape(text.strip()).replace("\n", "<br/>")


def section(text: str, start: str, end: str | None = None) -> str:
    start_marker = f"## {start}"
    start_pos = text.index(start_marker) + len(start_marker)
    if end is None:
        return text[start_pos:].strip()
    end_pos = text.index(f"## {end}", start_pos)
    return text[start_pos:end_pos].strip()


def split_paragraphs(block: str) -> list[str]:
    return [p.strip() for p in re.split(r"\n\s*\n", block.strip()) if p.strip()]


def split_subsections(block: str, level: int = 4) -> list[tuple[str, str]]:
    marker = "#" * level
    pattern = re.compile(rf"^{marker}\s+(.+?)\s*$", re.MULTILINE)
    matches = list(pattern.finditer(block))
    result: list[tuple[str, str]] = []
    for idx, match in enumerate(matches):
        body_start = match.end()
        body_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(block)
        result.append((match.group(1).strip(), block[body_start:body_end].strip()))
    return result


def bullet_items(block: str) -> list[str]:
    return [line[2:].strip() for line in block.splitlines() if line.startswith("- ")]


class TagCloud(Flowable):
    def __init__(self, tags: list[str], width: float):
        super().__init__()
        self.tags = tags
        self.width = width
        self.row_h = 23
        self.padding_x = 9
        self.gap = 7
        self.rows: list[list[tuple[str, float]]] = []
        current: list[tuple[str, float]] = []
        used = 0.0
        for tag in tags:
            cell_w = pdfmetrics.stringWidth(tag, "Malgun", 8.6) + self.padding_x * 2
            if current and used + self.gap + cell_w > width:
                self.rows.append(current)
                current = []
                used = 0.0
            current.append((tag, cell_w))
            used += cell_w + (self.gap if len(current) > 1 else 0)
        if current:
            self.rows.append(current)
        self.height = max(1, len(self.rows)) * self.row_h

    def wrap(self, avail_width, avail_height):
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        y = self.height - 17
        for row in self.rows:
            x = 0
            for label, cell_w in row:
                canvas.setFillColor(BLUE_PALE)
                canvas.setStrokeColor(colors.HexColor("#BFD0FF"))
                canvas.roundRect(x, y - 2, cell_w, 19, 9.5, fill=1, stroke=1)
                canvas.setFillColor(NAVY)
                canvas.setFont("Malgun", 8.6)
                canvas.drawCentredString(x + cell_w / 2, y + 4.3, label)
                x += cell_w + self.gap
            y -= self.row_h


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "name", parent=styles["Normal"], fontName="MalgunBold", fontSize=22,
            leading=27, textColor=NAVY, spaceAfter=3,
        ),
        "role": ParagraphStyle(
            "role", parent=styles["Normal"], fontName="Malgun", fontSize=9.5,
            leading=14, textColor=BLUE, alignment=TA_RIGHT,
        ),
        "meta": ParagraphStyle(
            "meta", parent=styles["Normal"], fontName="Malgun", fontSize=8.9,
            leading=14, textColor=MUTED,
        ),
        "card_label": ParagraphStyle(
            "card_label", parent=styles["Normal"], fontName="Malgun", fontSize=8,
            leading=11, textColor=MUTED,
        ),
        "card_main": ParagraphStyle(
            "card_main", parent=styles["Normal"], fontName="MalgunBold", fontSize=9.5,
            leading=13, textColor=NAVY,
        ),
        "section": ParagraphStyle(
            "section", parent=styles["Heading2"], fontName="MalgunBold", fontSize=15,
            leading=20, textColor=NAVY, spaceBefore=8, spaceAfter=9,
        ),
        "sub": ParagraphStyle(
            "sub", parent=styles["Heading3"], fontName="MalgunBold", fontSize=10.8,
            leading=16, textColor=NAVY, spaceBefore=5, spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body", parent=styles["BodyText"], fontName="Malgun", fontSize=9.2,
            leading=15.3, textColor=TEXT, wordWrap="CJK", spaceAfter=8,
        ),
        "body_tight": ParagraphStyle(
            "body_tight", parent=styles["BodyText"], fontName="Malgun", fontSize=8.8,
            leading=14.2, textColor=TEXT, wordWrap="CJK", spaceAfter=5,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=styles["BodyText"], fontName="Malgun", fontSize=8.75,
            leading=13.8, leftIndent=10, firstLineIndent=-7, bulletIndent=1,
            bulletFontName="Malgun", bulletFontSize=8.75,
            textColor=TEXT, wordWrap="CJK", spaceAfter=4,
        ),
        "duty_bullet": ParagraphStyle(
            "duty_bullet", parent=styles["BodyText"], fontName="Malgun", fontSize=8.15,
            leading=11.35, leftIndent=9, firstLineIndent=-6.5, bulletIndent=1,
            bulletFontName="Malgun", bulletFontSize=8.15,
            textColor=TEXT, wordWrap="CJK", spaceAfter=2,
        ),
        "project_title": ParagraphStyle(
            "project_title", parent=styles["Heading3"], fontName="MalgunBold", fontSize=8.9,
            leading=12, textColor=NAVY, spaceBefore=1, spaceAfter=2,
        ),
        "project_bullet": ParagraphStyle(
            "project_bullet", parent=styles["BodyText"], fontName="Malgun", fontSize=7.7,
            leading=10.35, leftIndent=8, firstLineIndent=-6, bulletIndent=1,
            bulletFontName="Malgun", bulletFontSize=7.7,
            textColor=TEXT, wordWrap="CJK", spaceAfter=1,
        ),
        "rail": ParagraphStyle(
            "rail", parent=styles["Heading2"], fontName="MalgunBold", fontSize=13.2,
            leading=17, textColor=NAVY,
        ),
        "question": ParagraphStyle(
            "question", parent=styles["Heading2"], fontName="MalgunBold", fontSize=13.2,
            leading=20, textColor=NAVY, spaceBefore=5, spaceAfter=14,
        ),
        "footer": ParagraphStyle(
            "footer", parent=styles["Normal"], fontName="Malgun", fontSize=7.5,
            textColor=MUTED, alignment=TA_CENTER,
        ),
    }


def divider() -> Table:
    table = Table([[""]], colWidths=[PAGE_W - 32 * mm], rowHeights=[1])
    table.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.7, LINE)]))
    return table


def first_page_header(styles) -> list:
    photo = Image(str(PHOTO_PATH), width=31 * mm, height=42 * mm)
    title = Table(
        [[Paragraph("박종혁", styles["name"]), Paragraph("비나우 | 구매 수요예측(S&amp;OP)", styles["role"])],
         [Paragraph("남 · 2000년생", styles["meta"]), ""],
         [Paragraph("이메일  parkjonghyeok2000@gmail.com    |    휴대폰  010-7449-6865", styles["meta"]), ""],
         [Paragraph("주소  (05671) 서울 송파구 가락로28길", styles["meta"]), ""]],
        colWidths=[120 * mm, 42 * mm],
    )
    title.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("SPAN", (0, 2), (1, 2)),
        ("SPAN", (0, 3), (1, 3)),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    head = Table([[title, photo]], colWidths=[164 * mm, 31 * mm])
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))

    cards = [
        ("경력", "아이베 재직 중", "2025.09.08~"),
        ("학력", "고려사이버대학교", "AI·데이터과학부 재학"),
        ("희망연봉", "회사내규에 따름", ""),
        ("포트폴리오", "별도 제출", ""),
    ]
    card_cells = []
    for label, main, sub in cards:
        bits = [Paragraph(label, styles["card_label"]), Spacer(1, 4), Paragraph(main, styles["card_main"])]
        if sub:
            bits.extend([Spacer(1, 2), Paragraph(sub, styles["card_label"])])
        card_cells.append(bits)
    card_table = Table([card_cells], colWidths=[47.5 * mm] * 4, rowHeights=[34 * mm])
    card_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return [head, Spacer(1, 12), divider(), Spacer(1, 13), card_table, Spacer(1, 8)]


def add_section_title(story, title: str, styles):
    story.extend([Spacer(1, 2), divider(), Paragraph(safe(title), styles["section"])])


def add_bullets(story, items: list[str], styles):
    for item in items:
        story.append(Paragraph(safe(item), styles["bullet"], bulletText="•"))


def career_history_table(title: str, body: str, styles) -> Table:
    title_parts = [part.strip() for part in title.split("|", 1)]
    company = title_parts[0]
    role = title_parts[1] if len(title_parts) > 1 else ""
    date_text = split_paragraphs(body)[0]
    table = Table(
        [[
            [Paragraph(safe(date_text), styles["body_tight"])],
            [Paragraph(safe(company), styles["sub"]), Paragraph(safe(role), styles["meta"])],
        ]],
        colWidths=[38 * mm, 152 * mm],
    )
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def career_details_table(block: str, styles) -> Table:
    group_match = re.search(r"^###\s+(.+?)\s*$", block, re.MULTILINE)
    group_title = group_match.group(1).strip() if group_match else "주요 프로젝트"
    rows = [[Paragraph("경력사항", styles["rail"]), Paragraph(safe(group_title), styles["sub"])]]
    for title, body in split_subsections(block, 4):
        content = [Paragraph(safe(title), styles["project_title"])]
        for item in bullet_items(body):
            content.append(Paragraph(safe(item), styles["project_bullet"], bulletText="•"))
        rows.append(["", content])
    table = Table(rows, colWidths=[34 * mm, 156 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return table


def education_table(block: str, styles) -> Table:
    rows = []
    for title, body in split_subsections(block, 3):
        meta_parts = [part.strip() for part in split_paragraphs(body)[0].split("·")]
        left = [Paragraph(safe(meta_parts[0]), styles["body_tight"])]
        if len(meta_parts) > 1:
            left.append(Paragraph(safe(meta_parts[1]), styles["meta"]))
        right = [Paragraph(safe(title), styles["sub"])]
        if len(meta_parts) > 2:
            right.append(Paragraph(f"학점 {safe(meta_parts[2])}", styles["meta"]))
        rows.append([left, right])
    table = Table(rows, colWidths=[38 * mm, 152 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def credentials_table(language: str, awards: str, styles) -> Table:
    language_parts = [part.strip() for part in language.split(":", 1)]
    award_items = bullet_items(awards)
    first_award = award_items[0] if award_items else ""
    award_parts = first_award.split(" ", 1)
    award_date = award_parts[0] if award_parts else ""
    award_title = award_parts[1] if len(award_parts) > 1 else ""
    work_title = award_items[1] if len(award_items) > 1 else ""
    rows = [
        [Paragraph(safe(language_parts[0]), styles["body_tight"]), Paragraph(safe(language_parts[1] if len(language_parts) > 1 else ""), styles["body_tight"])],
        [Paragraph(safe(award_date), styles["body_tight"]), [Paragraph(safe(award_title), styles["sub"]), Paragraph(safe(work_title), styles["meta"])]]
    ]
    table = Table(rows, colWidths=[38 * mm, 152 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def page_decor(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(16 * mm, 13 * mm, PAGE_W - 16 * mm, 13 * mm)
    canvas.setFont("Malgun", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(16 * mm, 8.5 * mm, "박종혁 | 비나우 구매 수요예측(S&OP) 지원서")
    canvas.drawRightString(PAGE_W - 16 * mm, 8.5 * mm, f"{doc.page}")
    canvas.restoreState()


def build() -> Path:
    register_fonts()
    styles = build_styles()
    resume_text = RESUME_MD.read_text(encoding="utf-8")
    cover_text = COVER_MD.read_text(encoding="utf-8")

    summary = section(resume_text, "간략 소개", "핵심 역량")
    skills = section(resume_text, "핵심 역량", "이력사항")
    career_history = section(resume_text, "이력사항", "담당 업무")
    duties = section(resume_text, "담당 업무", "경력사항")
    career_details = section(resume_text, "경력사항", "학력")
    education = section(resume_text, "학력", "어학")
    language = section(resume_text, "어학", "수상")
    awards = section(resume_text, "수상")

    q1 = section(cover_text, "1. 본인이 어떤 사람인지 소개하고 비나우에 지원한 동기를 설명해주세요.", "2. 가장 치열하게 노력했던 성공 또는 실패 경험과 그 과정에서 배운 점을 소개해주세요.")
    q2 = section(cover_text, "2. 가장 치열하게 노력했던 성공 또는 실패 경험과 그 과정에서 배운 점을 소개해주세요.")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH), pagesize=A4, rightMargin=16 * mm, leftMargin=16 * mm,
        topMargin=15 * mm, bottomMargin=18 * mm,
        title="박종혁 비나우 구매 수요예측(S&OP) 지원서",
        author="박종혁",
        subject="비나우 구매 수요예측(S&OP) 지원",
    )

    story: list = []
    story.extend(first_page_header(styles))

    story.append(Paragraph("간략 소개", styles["section"]))
    for para in split_paragraphs(summary):
        story.append(Paragraph(safe(para), styles["body"]))

    story.extend([divider(), Paragraph("핵심 역량", styles["section"])])
    tags = re.findall(r"`([^`]+)`", skills)
    story.extend([TagCloud(tags, PAGE_W - 32 * mm), Spacer(1, 4)])

    add_section_title(story, "이력사항", styles)
    history_title, history_body = split_subsections(career_history, 3)[0]
    story.append(career_history_table(history_title, history_body, styles))

    story.append(PageBreak())
    for item in bullet_items(duties):
        story.append(Paragraph(safe(item), styles["duty_bullet"], bulletText="•"))
    story.extend([Spacer(1, 4), divider(), Spacer(1, 7)])
    story.append(career_details_table(career_details, styles))

    add_section_title(story, "학력", styles)
    story.append(education_table(education, styles))

    add_section_title(story, "자격/어학/수상", styles)
    story.append(credentials_table(language, awards, styles))

    story.append(PageBreak())
    story.append(Paragraph("자기소개서", styles["section"]))
    story.append(Paragraph("1. 본인이 어떤 사람인지 소개하고 비나우에 지원한 동기를 설명해주세요.", styles["question"]))
    for para in split_paragraphs(q1):
        story.append(Paragraph(safe(para), styles["body"]))

    story.append(PageBreak())
    story.append(Paragraph("자기소개서", styles["section"]))
    story.append(Paragraph("2. 가장 치열하게 노력했던 성공 또는 실패 경험과 그 과정에서 배운 점을 소개해주세요.", styles["question"]))
    for para in split_paragraphs(q2):
        story.append(Paragraph(safe(para), styles["body"]))

    doc.build(story, onFirstPage=page_decor, onLaterPages=page_decor)
    return OUTPUT_PATH


if __name__ == "__main__":
    print(build())

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip/lib/index.js";
import { Presentation, PresentationFile } from "file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workspaceDir = "C:/MyMain/main/resume/포트폴리오";
const buildDir = path.join(workspaceDir, ".build", "v4");
const outputDir = path.join(workspaceDir, "output");
const skillDir = "C:/Users/ParkJongHyeok/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.22227/skills/presentations";
const pythonExecutable = "C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const finalPath = path.join(outputDir, "박종혁_PM_포트폴리오_v4.pptx");
const portraitPath = path.join(workspaceDir, "assets", "portrait", "_photo.png");
const font = "Malgun Gothic";

const C = {
  ink: "#1A1A1A",
  gray: "#6E6E73",
  mid: "#9A9AA0",
  line: "#D6D6DB",
  soft: "#F4F4F6",
  white: "#FFFFFF",
  blue: "#1B4F9C",
  blueDark: "#16437F",
  blueBright: "#3B72C4",
  blueBg: "#E9F1FC",
  blueBg2: "#F1F6FC",
  blueMid: "#8FB2E0",
  blueLight: "#D2DFF1",
  green: "#1E6B45",
  greenDark: "#17563A",
  greenBright: "#3E9268",
  greenBg: "#E8F5EE",
  greenBg2: "#F0F9F4",
  greenMid: "#9ED4B6",
  greenLight: "#CDEAD9",
  red: "#B42318",
  redBg: "#FBECEB",
  gold: "#9A6400",
  goldBg: "#F3E5CC",
};

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? "none",
    line: opts.line ?? { fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
  });
  shape.text = text;
  shape.text.style = {
    typeface: font,
    fontSize: opts.size ?? 17,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    autoFit: "none",
  };
  return shape;
}

function addBox(slide, x, y, w, h, fill = C.white, line = C.line, radius = 10, lineWidth = 1) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: lineWidth },
    borderRadius: radius,
  });
}

function addRule(slide, x, y, w, color = C.line, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addVRule(slide, x, y, h, color = C.line, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: 0, height: h },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addBadge(slide, text, x, y, w, fill, color = C.white) {
  addBox(slide, x, y, w, 30, fill, fill, 15, 0);
  addText(slide, text, x + 8, y + 5, w - 16, 20, { size: 12, bold: true, color, align: "center", valign: "middle" });
}

function addHeader(slide, n, title, subtitle, accent, page) {
  addText(slide, String(n).padStart(2, "0"), 68, 42, 72, 42, { size: 28, bold: true, color: accent });
  addText(slide, title, 143, 37, 910, 46, { size: 30, bold: true, color: C.ink });
  addText(slide, page, 1125, 43, 84, 26, { size: 12, color: C.mid, align: "right" });
  addRule(slide, 68, 102, 1140, C.line, 1);
  if (subtitle) addText(slide, subtitle, 68, 119, 1140, 28, { size: 14, color: C.gray });
}

function addFooter(slide, n, note = "박종혁 PM 포트폴리오 v4") {
  addRule(slide, 68, 676, 1140, C.line, 1);
  addText(slide, note, 68, 684, 980, 18, { size: 10, color: C.mid });
  addText(slide, `${n} / 15`, 1110, 684, 98, 18, { size: 10, color: C.mid, align: "right" });
}

function setNotes() {
  // 외부 제출본에는 내부 claim ID와 비공개 증거 경로를 포함하지 않는다.
}

function addSectionCover(slide, projectNo, title, subtitle, accent, dark, timeline, role, artifacts, sectionPage) {
  slide.background.fill = accent;
  addText(slide, `Project ${projectNo}.`, 68, 58, 220, 40, { size: 20, bold: true, color: C.white });
  addText(slide, sectionPage, 1110, 62, 96, 24, { size: 12, color: "#D9E6F5", align: "right" });
  addText(slide, title, 68, 154, 720, 74, { size: 38, bold: true, color: C.white });
  addText(slide, subtitle, 68, 242, 710, 62, { size: 20, color: "#E7EFF8" });
  addBox(slide, 825, 140, 380, 400, dark, dark, 18, 0);
  addText(slide, "확정 일정", 860, 177, 310, 28, { size: 15, bold: true, color: "#DCE8F5" });
  timeline.forEach((t, i) => {
    addText(slide, t[0], 860, 222 + i * 62, 110, 28, { size: 15, bold: true, color: C.white });
    addText(slide, t[1], 974, 222 + i * 62, 195, 36, { size: 14, color: "#E3EDF7" });
  });
  addRule(slide, 68, 496, 700, "#D6E4F2", 1);
  addText(slide, "담당", 68, 523, 84, 28, { size: 13, bold: true, color: "#DCE8F5" });
  addText(slide, role, 160, 520, 608, 52, { size: 16, color: C.white });
  addText(slide, "산출물", 68, 594, 84, 28, { size: 13, bold: true, color: "#DCE8F5" });
  addText(slide, artifacts, 160, 591, 608, 54, { size: 16, color: C.white });
}

function addMetric(slide, x, y, w, h, value, label, accent, fill = C.white) {
  addBox(slide, x, y, w, h, fill, C.line, 12, 1);
  addText(slide, value, x + 18, y + 18, w - 36, 46, { size: 29, bold: true, color: accent, align: "center" });
  addText(slide, label, x + 18, y + 69, w - 36, h - 80, { size: 13, color: C.gray, align: "center" });
}

function addStep(slide, x, y, w, n, title, body, accent, fill) {
  addBox(slide, x, y, w, 120, fill, C.line, 12, 1);
  addText(slide, n, x + 15, y + 14, 35, 24, { size: 13, bold: true, color: accent });
  addText(slide, title, x + 50, y + 12, w - 65, 29, { size: 17, bold: true, color: C.ink });
  addText(slide, body, x + 18, y + 50, w - 36, 56, { size: 13, color: C.gray, align: "center" });
}

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

// 1. Cover
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 18, height: 720 }, fill: C.blue, line: { fill: "none", width: 0 } });
  addText(s, "PM PORTFOLIO", 72, 62, 260, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "운영 요구를 구조화하고\n검증까지 연결한 두 프로젝트", 72, 132, 730, 130, { size: 40, bold: true, color: C.ink });
  addText(s, "요청을 문서로 남기고, 역할과 완료 기준을 정한 뒤\n운영 환경에서 결과를 확인했습니다.", 72, 282, 695, 64, { size: 20, color: C.gray });
  addBox(s, 72, 403, 350, 138, C.blueBg2, C.blueLight, 14, 1);
  addBadge(s, "PROJECT 01", 94, 424, 112, C.blue);
  addText(s, "관세청 통관 연동", 94, 465, 292, 32, { size: 22, bold: true, color: C.blueDark });
  addText(s, "요건 조율 · 데이터 계약 · 오류 재처리 · QA", 94, 506, 292, 24, { size: 13, color: C.gray });
  addBox(s, 438, 403, 350, 138, C.greenBg2, C.greenLight, 14, 1);
  addBadge(s, "PROJECT 02", 460, 424, 112, C.green);
  addText(s, "산후조리원 B2B몰", 460, 465, 292, 32, { size: 22, bold: true, color: C.greenDark });
  addText(s, "정책 · 상태 관리 · 운영 QA · 결과", 460, 506, 292, 24, { size: 12, color: C.gray });
  addBox(s, 845, 0, 435, 720, C.soft, C.soft, 0, 0);
  const portraitBytes = await fs.readFile(portraitPath);
  s.images.add({
    blob: portraitBytes,
    contentType: "image/png",
    alt: "박종혁 프로필 사진",
    fit: "cover",
    position: { left: 983, top: 92, width: 154, height: 154 },
    geometry: "ellipse",
  });
  addText(s, "박종혁", 900, 286, 325, 44, { size: 28, bold: true, color: C.ink, align: "center" });
  addText(s, "프로젝트 운영 · SCM", 900, 334, 325, 30, { size: 15, color: C.gray, align: "center" });
  addRule(s, 900, 395, 325, C.line, 1);
  addText(s, "요구사항 구조화\n이해관계자 조율\n완료 기준과 운영 검증", 910, 425, 305, 120, { size: 18, color: C.ink, align: "center" });
  addText(s, "parkjonghyeok2000@gmail.com", 884, 632, 340, 24, { size: 12, color: C.gray, align: "center" });
  addText(s, "2026.09", 884, 662, 340, 20, { size: 11, color: C.mid, align: "center" });
  setNotes(s, [
    "근거: career_facts.md C-025, C-028, C-037~C-039, C-109",
    "범위: 관세청 전자상거래 통관 연동과 산후조리원 전용 B2B몰 두 사례만 사용.",
  ]);
}

// 2. Evidence map
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 0, "Business Associate 업무와 연결되는 증거", "경험을 직함이 아니라 산출물과 운영 행동으로 정리했습니다.", C.blue, "OVERVIEW");
  const cols = [68, 330, 700, 1050];
  addText(s, "업무", cols[0], 169, 220, 28, { size: 14, bold: true, color: C.gray });
  addText(s, "관세청 통관 연동", cols[1], 169, 330, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "산후조리원 B2B몰", cols[2], 169, 320, 28, { size: 14, bold: true, color: C.green });
  addText(s, "공통 증거", cols[3], 169, 158, 28, { size: 14, bold: true, color: C.ink });
  addRule(s, 68, 203, 1140, C.line, 1);
  const rows = [
    ["요청·쟁점 기록", "리스크·질의대장", "요구사항 대장", "누락 방지"],
    ["관계자 조율", "API 요건·인증·통관 경로", "고객사·공급사 운영 요청", "회신 기준"],
    ["상태 추적", "우선순위·결정 상태", "ID·상태·완료 정의", "후속 조치"],
    ["기술 문서", "필드 매핑·분할출고 규칙", "정책 매트릭스·권한표", "전달 가능성"],
    ["운영 검증", "운영 환경 30건", "운영 서버 UAT", "증거 기반 완료"],
  ];
  rows.forEach((r, i) => {
    const y = 218 + i * 83;
    if (i % 2 === 0) addBox(s, 68, y, 1140, 70, C.soft, C.soft, 0, 0);
    addText(s, r[0], cols[0], y + 20, 220, 28, { size: 16, bold: true, color: C.ink });
    addText(s, r[1], cols[1], y + 20, 330, 30, { size: 15, color: C.blueDark });
    addText(s, r[2], cols[2], y + 20, 320, 30, { size: 15, color: C.greenDark });
    addText(s, r[3], cols[3], y + 20, 158, 30, { size: 15, color: C.gray });
  });
  addFooter(s, 2, "정식 회의록·기술영업 직접 경험은 확인된 경력으로 과장하지 않았습니다");
  setNotes(s, [
    "근거: career_facts.md C-025~C-029, C-037~C-039, C-109",
    "주의: 대표·이사 회의록, 오프라인 AI 제품, 기술영업 경험은 확인되지 않아 본문에서 제외.",
  ]);
}

// 3. Customs section cover
{
  const s = deck.slides.add();
  addSectionCover(
    s,
    "01",
    "관세청 전자상거래 통관 연동",
    "법·제도 대응을 시스템 요건, 데이터 계약, 오류 복구와 운영 검증으로 전환했습니다.",
    C.blue,
    C.blueDark,
    [["2026.02", "기획 착수"], ["2026.08.21", "테스트 서버 종료"], ["2026.08.28", "상용 오픈"], ["2026.09.15", "운영 집계 기준"]],
    "국내 DB 중심 연동 구조, 본인인증 두 경로, 오류 수정·재제출 정책, 외부 API 요건 조율",
    "리스크·질의대장 · API 필드 매핑 · 결정 이력 · 분할출고 규칙 · QA 시나리오",
    "01 / 06",
  );
  setNotes(s, [
    "근거: C-020~C-022, C-025, C-028, C-126",
    "직함은 SCM 담당이며 프로젝트 PM 역할로 연동을 주도. 직접 개발·직접 신고로 표현하지 않음.",
  ]);
}

// 4. Customs problem and goal
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "요청을 받기 전에 책임과 데이터 경계부터 정리", "연동 실패의 원인을 기능 부족보다 정보 주체와 처리 기준의 불일치에서 찾았습니다.", C.blue, "02 / 06");
  const cards = [
    ["정보 주체 분산", "쇼핑몰·본인인증·ERP/WMS·통관 업무가 서로 다른 기준으로 정보를 보유"],
    ["분할출고 규칙", "주문·포장·HBL·신고 단위를 같은 기준으로 맞춰야 하는 상황"],
    ["오류 복구 기준", "어떤 오류를 어디서 고치고 어떻게 다시 제출할지 운영 합의가 필요"],
  ];
  cards.forEach((c, i) => {
    const x = 68 + i * 383;
    addBox(s, x, 175, 357, 172, i === 1 ? C.blueBg : C.soft, i === 1 ? C.blueMid : C.line, 12, 1);
    addText(s, `0${i + 1}`, x + 22, 196, 40, 24, { size: 13, bold: true, color: C.blue });
    addText(s, c[0], x + 22, 231, 313, 31, { size: 20, bold: true, color: C.ink });
    addText(s, c[1], x + 22, 274, 313, 58, { size: 14, color: C.gray });
  });
  addText(s, "프로젝트 목표", 68, 393, 180, 28, { size: 16, bold: true, color: C.blue });
  addBox(s, 68, 430, 1140, 120, C.blueDark, C.blueDark, 14, 0);
  addText(s, "주문 유형 · 데이터 필드 · 처리 상태 · 오류 복구 · 검증 기준을 하나의 운영 계약으로 연결", 108, 462, 1060, 46, { size: 24, bold: true, color: C.white, align: "center", valign: "middle" });
  addText(s, "역할 기준", 68, 587, 120, 24, { size: 13, bold: true, color: C.gray });
  addText(s, "구조·정책·요건·검증 기준은 직접 정리하고, 개발 구현과 통관 신고 수행은 관계사 역할로 분리", 188, 581, 1020, 42, { size: 15, color: C.ink });
  addFooter(s, 4);
  setNotes(s, [
    "근거: C-020, C-025, C-028, C-029, C-101",
    "정보 주체는 역할명으로만 표기. C-023의 4개 데이터 주체와 5개 협업사는 모수가 달라 합산하지 않음.",
  ]);
}

// 5. Customs request and risk register
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "질문·리스크를 결정과 후속 조치까지 추적", "개별 담당자와 기한을 꾸미지 않고, 확인된 우선순위·상태·근거만 남겼습니다.", C.blue, "03 / 06");
  const steps = [
    ["01", "요청·쟁점", "질문과 위험을 한 대장에 수집"],
    ["02", "우선순위", "오픈·법규·데이터 영향으로 분류"],
    ["03", "결정", "선택 기준과 범위를 기록"],
    ["04", "회신·조치", "관계자 답변과 후속 작업 연결"],
    ["05", "검증 근거", "문서·테스트 결과로 완료 판단"],
  ];
  steps.forEach((it, i) => addStep(s, 68 + i * 229, 169, 206, it[0], it[1], it[2], C.blue, i === 2 ? C.blueBg : C.soft));
  addText(s, "2026-08-26 대장 스냅샷", 68, 329, 310, 28, { size: 17, bold: true, color: C.ink });
  addMetric(s, 68, 371, 260, 134, "46", "해결 또는 기준 확정", C.blue, C.blueBg2);
  addMetric(s, 347, 371, 210, 134, "P0 4", "오픈 차단 가능", C.red, C.redBg);
  addMetric(s, 576, 371, 210, 134, "P1 22", "핵심 경로 영향", C.gold, C.goldBg);
  addMetric(s, 805, 371, 210, 134, "P2 7", "후속 보완", C.green, C.greenBg);
  addBox(s, 1034, 371, 174, 134, C.soft, C.line, 12, 1);
  addText(s, "완료 판단", 1052, 389, 138, 26, { size: 14, bold: true, color: C.ink, align: "center" });
  addText(s, "답변 수신이 아닌\n기준 확정 또는\n검증 근거 확보", 1052, 426, 138, 64, { size: 13, color: C.gray, align: "center" });
  addBox(s, 68, 545, 1140, 78, C.blueBg2, C.blueLight, 10, 1);
  addText(s, "관리 필드", 90, 566, 110, 24, { size: 14, bold: true, color: C.blueDark });
  addText(s, "쟁점 · 우선순위 · 상태 · 결정 근거 · 검증 자료", 206, 563, 620, 28, { size: 17, bold: true, color: C.ink });
  addText(s, "개별 담당자·기한은 확보된 근거가 없어 외부 제출본에서 제외", 817, 565, 365, 28, { size: 12, color: C.gray, align: "right" });
  addFooter(s, 5);
  setNotes(s, [
    "근거: C-025, C-026, C-028",
    "46은 해결·기준확정 상태이며 P0/P1/P2 전체가 모두 종결됐다는 뜻이 아님.",
  ]);
}

// 6. Customs system and responsibility map
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 3, "연동 구조와 책임 범위를 같은 그림에 표시", "데이터가 지나가는 경로와 결정 주체를 분리해 전달 오류를 줄였습니다.", C.blue, "04 / 06");
  const nodes = [
    ["판매 채널", "주문·상품·수취인 정보"],
    ["국내 DB", "수집·정규화·전송 기준"],
    ["ERP / WMS", "출고·포장·운송 정보"],
    ["통관 업무", "신고 응답·오류 반환"],
  ];
  const nodeShapes = [];
  nodes.forEach((n, i) => {
    const x = 69 + i * 288;
    const box = addBox(s, x, 179, 250, 120, i === 1 ? C.blueBg : C.white, i === 1 ? C.blue : C.line, 12, i === 1 ? 2 : 1);
    nodeShapes.push(box);
    addText(s, n[0], x + 18, 202, 214, 29, { size: 19, bold: true, color: i === 1 ? C.blueDark : C.ink, align: "center" });
    addText(s, n[1], x + 18, 245, 214, 36, { size: 13, color: C.gray, align: "center" });
  });
  for (let i = 0; i < nodeShapes.length - 1; i++) {
    s.shapes.connect(nodeShapes[i], nodeShapes[i + 1], {
      kind: "straight",
      fromSide: "right",
      toSide: "left",
      line: { style: "solid", fill: C.blueMid, width: 2 },
      tail: { type: "arrow", width: "med", length: "med" },
    });
  }
  addText(s, "내 책임", 68, 347, 200, 30, { size: 17, bold: true, color: C.blue });
  const own = [
    ["연동 구조", "국내 DB 중심의 데이터 흐름과 경계 정리"],
    ["정책", "본인인증 두 경로와 오류 수정·재제출 기준"],
    ["문서", "필드 매핑·결정 이력·분할출고 규칙"],
    ["검증", "기대 응답과 운영 환경 테스트 기준"],
  ];
  own.forEach((o, i) => {
    const x = 68 + (i % 2) * 575;
    const y = 390 + Math.floor(i / 2) * 94;
    addBox(s, x, y, 548, 72, i < 2 ? C.blueBg2 : C.soft, i < 2 ? C.blueLight : C.line, 10, 1);
    addText(s, o[0], x + 18, y + 20, 100, 28, { size: 15, bold: true, color: C.blueDark });
    addText(s, o[1], x + 122, y + 18, 405, 34, { size: 14, color: C.ink });
  });
  addText(s, "경계", 68, 600, 70, 24, { size: 13, bold: true, color: C.gray });
  addText(s, "개발사는 구현, 통관 대행사는 신고 수행. 박종혁은 요건·정책·상태·QA를 연결했습니다.", 143, 596, 1065, 32, { size: 15, color: C.ink });
  addFooter(s, 6);
  setNotes(s, [
    "근거: C-025, C-028, C-101, C-126",
    "판매 채널·ERP/WMS·통관 역할명만 사용하며 관계사 수는 표시하지 않음.",
  ]);
}

// 7. Customs data contract and recovery
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 4, "데이터 계약과 오류 복구 기준을 문서화", "필드 이름보다 주문·포장·신고 단위가 일치하는지 먼저 확인했습니다.", C.blue, "05 / 06");
  addBox(s, 68, 168, 1140, 118, C.blueDark, C.blueDark, 12, 0);
  addText(s, "분할출고 원칙", 96, 192, 170, 28, { size: 15, bold: true, color: C.blueLight });
  addText(s, "1 HBL = USD 150 이하 포장 1건 = TRA001 1건 = HWB 1건", 277, 188, 895, 44, { size: 24, bold: true, color: C.white, align: "center" });
  addText(s, "주문 수량이 아니라 실제 출고 포장 단위로 신고·운송 식별자를 맞춤", 277, 240, 895, 26, { size: 13, color: "#DCE8F5", align: "center" });
  addText(s, "필드 매핑 묶음", 68, 323, 200, 28, { size: 16, bold: true, color: C.blue });
  const groups = [
    ["주문", "채널 주문과 거래 정보"],
    ["상품", "품목·수량·신고 연결"],
    ["수취인", "통관 식별·본인확인"],
    ["출고", "포장·HBL/HWB 단위"],
  ];
  groups.forEach((g, i) => {
    const x = 68 + i * 288;
    addBox(s, x, 362, 260, 88, i === 3 ? C.blueBg : C.soft, i === 3 ? C.blueMid : C.line, 10, 1);
    addText(s, g[0], x + 18, 380, 224, 25, { size: 16, bold: true, color: C.ink, align: "center" });
    addText(s, g[1], x + 18, 413, 224, 24, { size: 13, color: C.gray, align: "center" });
  });
  addText(s, "오류 처리 상태", 68, 487, 200, 28, { size: 16, bold: true, color: C.blue });
  const flow = ["주문 유형 확인", "경로 적용", "응답 수신", "오류 반환", "원천 수정", "재제출·검증"];
  flow.forEach((f, i) => {
    const x = 68 + i * 190;
    addBox(s, x, 530, 170, 70, i >= 3 ? C.goldBg : C.blueBg2, i >= 3 ? "#DFC58E" : C.blueLight, 10, 1);
    addText(s, f, x + 12, 552, 146, 26, { size: 14, bold: true, color: i >= 3 ? C.gold : C.blueDark, align: "center" });
    if (i < flow.length - 1) addText(s, "›", x + 172, 549, 18, 30, { size: 20, bold: true, color: C.mid, align: "center" });
  });
  addText(s, "신규 연동과 기존 운영 경로를 병행했으며 자동 처리율은 측정하지 않았습니다.", 68, 624, 1140, 28, { size: 13, color: C.gray, align: "center" });
  addFooter(s, 7);
  setNotes(s, [
    "근거: C-025, C-028, C-029, C-101, C-102",
    "원장에 없는 세부 API 필드명, 처리 시각, 무제한 재시도 규칙은 표기하지 않음.",
  ]);
}

// 8. Customs QA and operation result
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 5, "테스트 목적과 운영 결과를 분리해 확인", "테스트 통과가 자동화율을 뜻하지 않도록 범위와 한계를 함께 적었습니다.", C.blue, "06 / 06");
  addText(s, "운영 환경 검증", 68, 166, 240, 28, { size: 17, bold: true, color: C.blue });
  const tests = [
    ["정상 접수", "기대 형식으로 접수되는지 확인"],
    ["의도 오류", "오류 응답이 기준대로 반환되는지 확인"],
    ["수정 재제출", "원천 수정 후 다시 처리되는지 확인"],
  ];
  tests.forEach((t, i) => {
    const x = 68 + i * 252;
    addBox(s, x, 207, 230, 132, C.blueBg2, C.blueLight, 12, 1);
    addText(s, `0${i + 1}`, x + 18, 224, 40, 23, { size: 12, bold: true, color: C.blue });
    addText(s, t[0], x + 18, 257, 194, 27, { size: 17, bold: true, color: C.ink, align: "center" });
    addText(s, t[1], x + 18, 294, 194, 35, { size: 12, color: C.gray, align: "center" });
  });
  addBox(s, 842, 184, 366, 178, C.blueDark, C.blueDark, 14, 0);
  addText(s, "30 / 30", 877, 217, 296, 58, { size: 38, bold: true, color: C.white, align: "center" });
  addText(s, "테스트 목적 통과", 877, 284, 296, 30, { size: 18, bold: true, color: C.blueLight, align: "center" });
  addText(s, "유형별 건수는 별도 공개하지 않음", 877, 323, 296, 22, { size: 11, color: "#DCE8F5", align: "center" });
  addText(s, "2026-08-28~09-15 운영 집계", 68, 397, 350, 28, { size: 17, bold: true, color: C.blue });
  addMetric(s, 68, 438, 280, 130, "약 300건 / 일", "발생 주문 규모", C.blue, C.blueBg2);
  addMetric(s, 368, 438, 240, 130, "약 230건", "자사몰 · 일평균", C.blueBright, C.white);
  addMetric(s, 628, 438, 240, 130, "약 70건", "기타 채널 · 일평균", C.blueBright, C.white);
  addBox(s, 888, 438, 320, 130, C.soft, C.line, 12, 1);
  addText(s, "결과", 910, 456, 70, 24, { size: 14, bold: true, color: C.ink });
  addText(s, "집계 대상 주문 전체 통관 완료", 910, 486, 276, 28, { size: 16, bold: true, color: C.blueDark });
  addText(s, "신규 연동 + 기존 방식 병행", 910, 527, 276, 23, { size: 12, color: C.gray });
  addBox(s, 68, 595, 1140, 48, C.goldBg, "#DFC58E", 8, 1);
  addText(s, "측정 한계  자동 처리율 · 신규 경로 비중 · 처리시간은 미측정", 88, 608, 1100, 24, { size: 13, color: C.gold, align: "center" });
  addFooter(s, 8);
  setNotes(s, [
    "근거: C-027, C-100, C-102",
    "30/30은 테스트 목적 통과. 30건 모두 정상 신고 또는 운영 무오류 보장으로 표현하지 않음.",
  ]);
}

// 9. B2B section cover
{
  const s = deck.slides.add();
  addSectionCover(
    s,
    "02",
    "산후조리원 전용 B2B몰",
    "고객사와 공급사의 주문·출고·정산 요청을 계정 정책과 운영 QA 체계로 전환했습니다.",
    C.green,
    C.greenDark,
    [["2026.06", "기획"], ["2026.07.02", "개발 착수"], ["2026.07.16", "핵심 흐름 전체 가동"], ["2026.08.31", "최종 검수"]],
    "고객사·공급사 주문/배송/정산 조율, 몰 정책·요구사항·QA·운영 적용",
    "요구사항 대장 · 4계정 정책 매트릭스 · 권한표 · UAT 시나리오 · 운영 매뉴얼",
    "01 / 06",
  );
  setNotes(s, [
    "근거: C-030~C-032, C-039, C-109",
    "07-16은 핵심 흐름 전체 가동, 08-31은 계약상 기본 요구의 최종 검수 기준일.",
  ]);
}

// 10. B2B problem and requests
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "운영 문제를 요청 주체와 검증 수치로 정리", "고객사·공급사·운영팀의 불편을 주문부터 정산까지의 업무 구간에 연결했습니다.", C.green, "02 / 06");
  const timeline = [
    ["06", "기획"], ["07.02", "착수"], ["07.16", "가동"], ["08.06~13", "고도화·QA"], ["08.31", "최종 검수"],
  ];
  addRule(s, 100, 194, 1030, C.greenMid, 3);
  timeline.forEach((t, i) => {
    const x = 88 + i * 252;
    s.shapes.add({ geometry: "ellipse", position: { left: x, top: 183, width: 23, height: 23 }, fill: C.green, line: { fill: C.green, width: 0 } });
    addText(s, t[0], x - 35, 214, 94, 24, { size: 13, bold: true, color: C.greenDark, align: "center" });
    addText(s, t[1], x - 55, 241, 135, 23, { size: 12, color: C.gray, align: "center" });
  });
  const probs = [
    ["오출고", "직전 6개월", "월평균 2~3건", "출고·CS 로그"],
    ["배송·주문·입금 문의", "1~6월 2주 환산", "32건", "문의 분류 기준"],
    ["입금 대조", "매일 반복", "15~30분", "개선 후 미측정"],
  ];
  probs.forEach((p, i) => {
    const x = 68 + i * 383;
    addBox(s, x, 311, 357, 210, i === 1 ? C.greenBg : C.soft, i === 1 ? C.greenMid : C.line, 12, 1);
    addText(s, p[0], x + 24, 334, 309, 31, { size: 19, bold: true, color: C.ink });
    addText(s, p[1], x + 24, 379, 309, 24, { size: 13, color: C.gray });
    addText(s, p[2], x + 24, 417, 309, 45, { size: 28, bold: true, color: C.greenDark });
    addText(s, `근거 · ${p[3]}`, x + 24, 478, 309, 23, { size: 12, color: C.gray });
  });
  addBox(s, 68, 557, 1140, 74, C.greenBg2, C.greenLight, 10, 1);
  addText(s, "설계 질문", 90, 579, 110, 24, { size: 14, bold: true, color: C.greenDark });
  addText(s, "누가 어떤 계정으로 주문하고, 어떤 결제 방식과 완료 기준을 적용해야 운영 오류를 줄일 수 있는가?", 205, 574, 975, 32, { size: 17, bold: true, color: C.ink });
  addFooter(s, 10);
  setNotes(s, [
    "근거: C-031, C-040, C-042, C-043, C-109",
    "입금 대조는 AS-IS만 확인. 개선 후 수치는 미측정이라 성과로 사용하지 않음.",
  ]);
}

// 11. B2B alternative comparison
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "기능 수보다 운영팀이 유지할 수 있는 구조를 선택", "러닝커브·기존 인프라·유지보수 범위·구축비용을 기준으로 세 대안을 비교했습니다.", C.green, "03 / 06");
  const headers = ["대안", "운영팀 학습", "기존 인프라", "유지보수", "판정"];
  const widths = [250, 210, 230, 265, 185];
  let x = 68;
  headers.forEach((h, i) => {
    addText(s, h, x + 10, 169, widths[i] - 20, 27, { size: 13, bold: true, color: C.gray, align: i === 0 ? "left" : "center" });
    x += widths[i];
  });
  addRule(s, 68, 204, 1140, C.line, 1);
  const alternatives = [
    ["신규 맞춤 웹", "새 업무 습득 필요", "별도 구축", "자체 유지 범위 큼", "제외"],
    ["타 쇼핑 솔루션", "도구 전환 필요", "재설정 필요", "솔루션 종속", "제외"],
    ["기존 플랫폼 + 정책 커스텀", "기존 운영 방식 활용", "현재 환경 유지", "변경 범위 한정", "채택"],
  ];
  alternatives.forEach((row, ri) => {
    const y = 218 + ri * 106;
    addBox(s, 68, y, 1140, 90, ri === 2 ? C.greenBg : ri % 2 === 0 ? C.soft : C.white, ri === 2 ? C.greenMid : C.line, 8, ri === 2 ? 2 : 1);
    let cx = 68;
    row.forEach((v, ci) => {
      addText(s, v, cx + 12, y + 30, widths[ci] - 24, 30, { size: ci === 0 ? 16 : 14, bold: ci === 0 || ci === 4, color: ci === 4 ? (ri === 2 ? C.greenDark : C.gray) : C.ink, align: ci === 0 ? "left" : "center" });
      cx += widths[ci];
    });
  });
  addText(s, "범위에서 제외한 기능", 68, 558, 230, 28, { size: 16, bold: true, color: C.green });
  const excluded = ["PG 결제", "견적서 신규 개발", "포인트 완전 자동화"];
  excluded.forEach((e, i) => {
    const bx = 68 + i * 382;
    addBox(s, bx, 598, 356, 50, C.soft, C.line, 10, 1);
    addText(s, e, bx + 18, 612, 320, 24, { size: 14, bold: true, color: C.gray, align: "center" });
  });
  addFooter(s, 11);
  setNotes(s, [
    "근거: C-035, C-036",
    "비용 숫자나 임의 점수는 사용하지 않고 사용자 확인된 채택·제외 사유만 표기.",
  ]);
}

// 12. B2B requirements governance
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 3, "요구사항 ID·상태·완료 기준을 고정", "개발 반영 통보와 운영 서버에서의 실제 완료를 분리했습니다.", C.green, "04 / 06");
  addText(s, "요청 유형", 68, 167, 180, 27, { size: 16, bold: true, color: C.green });
  const ids = [
    ["BR", "기본 요구"], ["AR", "추가 요구"], ["OP", "40시간 장부"], ["BUG", "결함"], ["HOLD", "보류"],
  ];
  ids.forEach((it, i) => {
    const x = 68 + i * 226;
    addBox(s, x, 207, 206, 74, i === 3 ? C.redBg : C.greenBg2, i === 3 ? "#E3B4B0" : C.greenLight, 10, 1);
    addText(s, it[0], x + 15, 222, 55, 25, { size: it[0].length > 3 ? 12 : 15, bold: true, color: i === 3 ? C.red : C.greenDark, align: "center" });
    addVRule(s, x + 78, 222, 38, C.line, 1);
    addText(s, it[1], x + 88, 226, 103, 23, { size: 13, color: C.ink, align: "center" });
  });
  addText(s, "상태", 68, 319, 180, 27, { size: 16, bold: true, color: C.green });
  const statuses = ["완료", "부분완료", "QA대기", "QA실패", "확인불가"];
  statuses.forEach((st, i) => {
    const x = 68 + i * 226;
    addBox(s, x, 357, 206, 54, i === 0 ? C.greenBg : i === 3 ? C.redBg : C.soft, i === 0 ? C.greenMid : C.line, 10, 1);
    addText(s, st, x + 12, 371, 182, 25, { size: 14, bold: true, color: i === 0 ? C.greenDark : i === 3 ? C.red : C.gray, align: "center" });
  });
  addBox(s, 68, 458, 545, 156, C.greenDark, C.greenDark, 12, 0);
  addText(s, "완료 정의", 94, 482, 120, 28, { size: 15, bold: true, color: C.greenLight });
  addText(s, "운영 서버에서 기대 결과를\n직접 확인한 경우에만 완료", 94, 524, 480, 58, { size: 24, bold: true, color: C.white });
  addBox(s, 641, 458, 567, 156, C.soft, C.line, 12, 1);
  addText(s, "실제 사례", 668, 482, 120, 28, { size: 15, bold: true, color: C.greenDark });
  addText(s, "마이페이지 수정 기능 진입 실패", 668, 522, 510, 28, { size: 18, bold: true, color: C.ink });
  addText(s, "운영 서버 미반영 + 기존 차단 로직 잔존을 분리해 확인", 668, 560, 510, 34, { size: 14, color: C.gray });
  addFooter(s, 12, "2026-08-31 최종 검수를 프로젝트 완료 기준일로 사용");
  setNotes(s, [
    "근거: C-031, C-037, C-038, C-046",
    "2026-08-13의 22건 스냅샷은 최종 상태가 아니므로 장표 숫자로 재사용하지 않음.",
  ]);
}

// 13. B2B account policy and evidence screens
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 4, "4개 계정 정책과 운영 화면을 같은 기준으로 검수", "원본 화면은 개인정보·가격이 포함되어 외부 제출본에는 안전한 재구성 화면을 사용했습니다.", C.green, "05 / 06");
  addText(s, "계정 정책", 68, 165, 170, 27, { size: 16, bold: true, color: C.green });
  const accounts = [
    ["분유", "선불"], ["분유", "후불"], ["물품", "선불"], ["물품", "후불"],
  ];
  accounts.forEach((a, i) => {
    const x = 68 + (i % 2) * 220;
    const y = 205 + Math.floor(i / 2) * 93;
    addBox(s, x, y, 204, 74, i < 2 ? C.greenBg : C.soft, i < 2 ? C.greenMid : C.line, 10, 1);
    addText(s, a[0], x + 18, y + 18, 82, 26, { size: 16, bold: true, color: C.ink });
    addVRule(s, x + 100, y + 17, 40, C.line, 1);
    addText(s, a[1], x + 113, y + 19, 70, 24, { size: 14, bold: true, color: C.greenDark, align: "center" });
  });
  addBox(s, 68, 408, 424, 115, C.redBg, "#E3B4B0", 12, 1);
  addText(s, "혼합주문 차단", 90, 430, 380, 28, { size: 17, bold: true, color: C.red, align: "center" });
  addText(s, "결제 방식이 다른 상품은\n양방향으로 같은 주문에 담지 않음", 90, 469, 380, 45, { size: 14, color: C.ink, align: "center" });
  addText(s, "운영 화면 기반 재구성 · 원본 와이어프레임 유실", 548, 165, 638, 27, { size: 14, bold: true, color: C.green });
  const screens = [
    ["HOME", "허용 카테고리\n정책 공지"],
    ["MY", "본인 주문·\n계정 정보"],
    ["LIST", "계정별 상품\n노출 구조"],
  ];
  screens.forEach((sc, i) => {
    const x = 548 + i * 220;
    addBox(s, x, 205, 198, 318, C.white, C.line, 12, 1);
    addBox(s, x, 205, 198, 38, C.greenDark, C.greenDark, 12, 0);
    addText(s, sc[0], x + 15, 215, 168, 20, { size: 11, bold: true, color: C.white, align: "center" });
    addBox(s, x + 16, 261, 166, 52, C.greenBg, C.greenLight, 6, 1);
    addBox(s, x + 16, 330, 72, 72, C.soft, C.line, 6, 1);
    addBox(s, x + 98, 330, 84, 26, C.soft, C.line, 6, 1);
    addBox(s, x + 98, 367, 84, 35, C.greenBg2, C.greenLight, 6, 1);
    addText(s, sc[1], x + 20, 428, 158, 52, { size: 14, bold: true, color: C.ink, align: "center" });
    addText(s, "샘플 데이터", x + 20, 486, 158, 20, { size: 10, color: C.mid, align: "center" });
  });
  addBox(s, 548, 553, 638, 66, C.goldBg, "#DFC58E", 10, 1);
  addText(s, "증거 범위", 569, 572, 100, 23, { size: 13, bold: true, color: C.gold });
  addText(s, "홈 · 마이페이지 · 물품 목록 / 공급사 전용 화면은 미확보", 674, 568, 490, 30, { size: 14, color: C.ink });
  addFooter(s, 13);
  setNotes(s, [
    "근거: C-033, C-034, C-036, C-039, C-047~C-049",
    "원본 와이어프레임 유실. 오른쪽은 운영 화면 기반 재구성이며 실제 캡처가 아님.",
    "원본 캡처는 포트폴리오/evidence/b2b/raw_private에 비공개 보관.",
  ]);
}

// 14. B2B result and limits
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 5, "운영 결과와 검수 진행을 구분", "핵심 흐름의 초기 관찰치와 계약 항목의 QA 상태를 같은 성과로 섞지 않았습니다.", C.green, "06 / 06");
  addBox(s, 68, 172, 540, 184, C.greenBg, C.greenMid, 14, 1);
  addText(s, "오출고", 96, 195, 140, 28, { size: 16, bold: true, color: C.greenDark });
  addText(s, "월평균 2~3건", 96, 240, 196, 41, { size: 28, bold: true, color: C.gray });
  addText(s, "→", 295, 241, 50, 38, { size: 25, bold: true, color: C.green });
  addText(s, "0건", 353, 240, 220, 41, { size: 30, bold: true, color: C.greenDark });
  addText(s, "직전 6개월 월평균 ↔ 2026-07-16 이후 약 1개월 전체 측정", 96, 306, 478, 27, { size: 12, color: C.gray });
  addBox(s, 631, 172, 577, 184, C.soft, C.line, 14, 1);
  addText(s, "배송·주문·입금 문의", 659, 195, 280, 28, { size: 16, bold: true, color: C.greenDark });
  addText(s, "2주 32건", 659, 240, 150, 41, { size: 26, bold: true, color: C.gray });
  addText(s, "→", 815, 241, 50, 38, { size: 25, bold: true, color: C.green });
  addText(s, "2주 19건", 873, 240, 180, 41, { size: 28, bold: true, color: C.greenDark });
  addText(s, "2026.01~06 2주 환산 ↔ 2026.07~08 배포 구간 2주 집계 · 초기 관찰", 659, 306, 517, 27, { size: 11, color: C.gray });
  addText(s, "운영과 검수의 경계", 68, 397, 250, 28, { size: 17, bold: true, color: C.green });
  addBox(s, 68, 438, 1140, 106, C.greenDark, C.greenDark, 12, 0);
  addText(s, "2026-07-16", 94, 460, 175, 28, { size: 15, bold: true, color: C.greenLight });
  addText(s, "핵심 주문·입금·정산 흐름 전체 가동", 94, 493, 440, 32, { size: 19, bold: true, color: C.white });
  addVRule(s, 610, 456, 67, "#7FB99B", 1);
  addText(s, "2026-08-31", 649, 460, 175, 28, { size: 15, bold: true, color: C.greenLight });
  addText(s, "계약상 기본 요구의 최종 검수 기준", 649, 493, 500, 32, { size: 19, bold: true, color: C.white });
  addBox(s, 68, 582, 1140, 61, C.goldBg, "#DFC58E", 10, 1);
  addText(s, "측정 한계", 91, 601, 100, 23, { size: 13, bold: true, color: C.gold });
  addText(s, "입금 대조 개선 후 시간은 미측정 · 장기 지속 효과와 전체 CS 감소는 주장하지 않음", 197, 596, 985, 30, { size: 14, color: C.ink });
  addFooter(s, 14);
  setNotes(s, [
    "근거: C-031, C-040, C-042~C-044",
    "C-041 정산 시간 비교는 비교 월·동일 범위가 미확인이라 외부 제출본에서 제외.",
  ]);
}

// 15. Closing
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 16, height: 720 }, fill: C.blue, line: { fill: "none", width: 0 } });
  addText(s, "Business Associate에서 바로 쓸 수 있는 경험", 72, 57, 950, 50, { size: 30, bold: true, color: C.ink });
  addText(s, "직접 증명할 수 있는 것과 앞으로 배울 영역을 나눠 정리했습니다.", 72, 113, 950, 30, { size: 15, color: C.gray });
  const strengths = [
    ["01", "요청을 구조화", "질문·리스크·요구사항을\n상태와 결정 근거로 기록"],
    ["02", "관계자를 연결", "개발·물류·통관·고객·공급사의\n요건과 역할 경계를 조율"],
    ["03", "완료를 검증", "통보가 아니라 운영 화면·응답·\n테스트 결과로 완료 판단"],
  ];
  strengths.forEach((v, i) => {
    const x = 72 + i * 382;
    addBox(s, x, 179, 350, 165, i === 1 ? C.blueBg : C.soft, i === 1 ? C.blueMid : C.line, 14, 1);
    addText(s, v[0], x + 22, 200, 40, 24, { size: 13, bold: true, color: C.blue });
    addText(s, v[1], x + 22, 236, 306, 31, { size: 20, bold: true, color: C.ink });
    addText(s, v[2], x + 22, 281, 306, 50, { size: 14, color: C.gray });
  });
  addBox(s, 72, 389, 728, 185, C.blueDark, C.blueDark, 14, 0);
  addText(s, "직접 증명 가능한 업무", 100, 417, 300, 28, { size: 16, bold: true, color: C.blueLight });
  addText(s, "요청·질의 구조화 · 외부 요건 조율 · 상태 추적\n정책·기술 문서 · 운영 환경 검증", 100, 462, 650, 80, { size: 22, bold: true, color: C.white });
  addBox(s, 830, 389, 386, 185, C.soft, C.line, 14, 1);
  addText(s, "입사 후 확장할 영역", 857, 417, 310, 28, { size: 16, bold: true, color: C.ink });
  addText(s, "경영진 회의 기록 형식\n오프라인 공간 AI 도메인\n제안서·기술영업 절차", 857, 461, 310, 82, { size: 17, color: C.gray });
  addRule(s, 72, 620, 1144, C.line, 1);
  addText(s, "박종혁", 72, 642, 140, 25, { size: 15, bold: true, color: C.ink });
  addText(s, "parkjonghyeok2000@gmail.com", 220, 642, 420, 25, { size: 13, color: C.gray });
  addText(s, "관세청 통관 연동 · 산후조리원 B2B몰", 800, 642, 416, 25, { size: 13, color: C.gray, align: "right" });
  addText(s, "15 / 15", 1120, 681, 96, 18, { size: 10, color: C.mid, align: "right" });
  setNotes(s, [
    "근거: C-025~C-029, C-037~C-039, C-109",
    "직접 증거가 없는 회의록·오프라인 AI 제품·기술영업은 학습 영역으로 분리.",
  ]);
}

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools", "artifact_tool_utils.mjs"),
).href);

const candidatePath = path.join(buildDir, "candidate_v4.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

const candidateZip = await JSZip.loadAsync(await fs.readFile(candidatePath));
const coreEntry = candidateZip.file("docProps/core.xml");
if (coreEntry) {
  let coreXml = await coreEntry.async("string");
  coreXml = coreXml
    .replace("<dc:creator>Walnut Exporter</dc:creator>", "<dc:creator>박종혁</dc:creator>")
    .replace("<lastModifiedBy>Walnut Exporter</lastModifiedBy>", "<lastModifiedBy>박종혁</lastModifiedBy>")
    .replace("<dc:title>Presentation</dc:title>", "<dc:title>박종혁 PM 포트폴리오 v4</dc:title>");
  candidateZip.file("docProps/core.xml", coreXml);
  await fs.writeFile(candidatePath, await candidateZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

const result = await finalizePresentation({
  explicitTotalSlideCount: 15,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable,
  integrityValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  fontPolicy: { basis: "design", families: [font] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, "v4.validation.json"),
});

console.log(JSON.stringify({ finalPath, result }, null, 2));

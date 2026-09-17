import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip/lib/index.js";
import { Presentation, PresentationFile } from "file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

process.env.RUNTIME_NODE_MODULES ??= "C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";

const workspaceDir = "C:/MyMain/resume/포트폴리오";
const buildDir = path.join(workspaceDir, ".build", "v4_2");
const outputDir = path.join(workspaceDir, "output");
const evidenceDir = path.join(workspaceDir, "evidence");
const skillDir = "C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.22227/skills/presentations";
const pythonExecutable = "C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const finalPath = path.join(outputDir, "박종혁_PM_포트폴리오_v4.2.pptx");
const portraitPath = path.join(workspaceDir, "assets", "portrait", "_photo.png");
const font = "Malgun Gothic";
const totalSlides = 17;

const E = {
  customsIdentifiers: path.join(evidenceDir, "customs", "submission_safe", "current_identifier_contract.png"),
  customsState: path.join(evidenceDir, "customs", "submission_safe", "current_state_retry.png"),
  b2bPolicy: path.join(evidenceDir, "b2b", "submission_safe", "account_policy_matrix.png"),
  b2bBanner: path.join(evidenceDir, "b2b", "submission_safe", "home_feature_banner.png"),
  b2bStatus: path.join(evidenceDir, "b2b", "submission_safe", "mypage_order_status.png"),
  b2bMenu: path.join(evidenceDir, "b2b", "submission_safe", "mypage_menu.png"),
};

const C = {
  ink: "#1A1A1A",
  gray: "#67676C",
  mid: "#96969C",
  line: "#D6D6DB",
  soft: "#F4F4F6",
  white: "#FFFFFF",
  blue: "#1B4F9C",
  blueDark: "#16437F",
  blueBright: "#3B72C4",
  blueBg: "#E9F1FC",
  blueBg2: "#F4F8FD",
  blueLine: "#B9CEE8",
  green: "#1E6B45",
  greenDark: "#17563A",
  greenBright: "#3E9268",
  greenBg: "#E8F5EE",
  greenBg2: "#F3FAF6",
  greenLine: "#BFDCCB",
  red: "#B42318",
  redBg: "#FBECEB",
  amber: "#925A00",
  amberBg: "#FFF4DE",
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

function addBadge(slide, text, x, y, w, fill, color = C.white) {
  addBox(slide, x, y, w, 28, fill, fill, 14, 0);
  addText(slide, text, x + 8, y + 4, w - 16, 20, { size: 11, bold: true, color, align: "center", valign: "middle" });
}

function addHeader(slide, _n, title, subtitle, _accent, _section) {
  const titleSize = title.length >= 25 ? 27 : 29;
  addText(slide, title, 68, 37, 957, 44, { size: titleSize, bold: true, color: C.ink });
  addRule(slide, 68, 101, 1140, C.line, 1);
  if (subtitle) addText(slide, subtitle, 68, 117, 1140, 27, { size: 13, color: C.gray });
}

function addFooter(slide, n, note = "박종혁 PM 포트폴리오 v4.2") {
  addRule(slide, 68, 676, 1140, C.line, 1);
  addText(slide, note, 68, 684, 965, 18, { size: 9, color: C.mid });
  addText(slide, `${n} / ${totalSlides}`, 1068, 684, 140, 18, { size: 9, color: C.mid, align: "right" });
}

function addCaption(slide, text, x, y, w, color = C.gray) {
  addText(slide, text, x, y, w, 19, { size: 9, color, align: "right" });
}

async function addImage(slide, filePath, x, y, w, h, alt, fit = "contain") {
  addBox(slide, x - 4, y - 4, w + 8, h + 8, C.white, C.line, 6, 1);
  slide.images.add({
    blob: await fs.readFile(filePath),
    contentType: "image/png",
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
  });
}

function addMetric(slide, x, y, w, value, label, accent, fill) {
  addBox(slide, x, y, w, 112, fill, C.line, 12, 1);
  addText(slide, value, x + 14, y + 17, w - 28, 40, { size: 27, bold: true, color: accent, align: "center" });
  addText(slide, label, x + 14, y + 66, w - 28, 32, { size: 12, color: C.gray, align: "center" });
}

function addStep(slide, x, y, w, n, title, body, accent, fill) {
  addBox(slide, x, y, w, 108, fill, C.line, 12, 1);
  addBadge(slide, n, x + 14, y + 13, 36, accent);
  addText(slide, title, x + 60, y + 14, w - 76, 27, { size: 17, bold: true, color: C.ink });
  addText(slide, body, x + 18, y + 53, w - 36, 42, { size: 12, color: C.gray, align: "center" });
}

function setNotes() {
  // 외부 제출본에는 내부 claim ID와 비공개 증거 경로를 포함하지 않는다.
}

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

// 1. Cover
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 18, height: 720 }, fill: C.blue, line: { fill: "none", width: 0 } });
  addText(s, "PM PORTFOLIO", 72, 61, 260, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "운영 요구를 정책으로 만들고\n검증까지 연결한 두 프로젝트", 72, 128, 730, 130, { size: 39, bold: true, color: C.ink });
  addText(s, "통관 연동에서는 분할 출고 단위와 오류 재제출 기준을,\nB2B 몰에서는 계정·결제 정책과 운영 완료 기준을 정했습니다.", 72, 280, 700, 66, { size: 18, color: C.gray });
  addBox(s, 72, 400, 350, 142, C.blueBg2, C.blueLine, 14, 1);
  addBadge(s, "PROJECT 01", 94, 421, 112, C.blue);
  addText(s, "관세청 통관 연동", 94, 463, 292, 31, { size: 22, bold: true, color: C.blueDark });
  addText(s, "분할 출고 기준 · 오류 재제출 · 운영 QA", 94, 504, 292, 24, { size: 12, color: C.gray });
  addBox(s, 438, 400, 350, 142, C.greenBg2, C.greenLine, 14, 1);
  addBadge(s, "PROJECT 02", 460, 421, 112, C.green);
  addText(s, "산후조리원 B2B 몰", 460, 463, 292, 31, { size: 22, bold: true, color: C.greenDark });
  addText(s, "계정·결제 정책 · 운영 서버 검증 · 결과", 460, 504, 292, 24, { size: 12, color: C.gray });
  addBox(s, 845, 0, 435, 720, C.soft, C.soft, 0, 0);
  s.images.add({
    blob: await fs.readFile(portraitPath),
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
  addText(s, "2026-09", 884, 650, 340, 20, { size: 11, color: C.mid, align: "center" });
  setNotes();
}

// 2. PM operating model
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 0, "두 프로젝트에서 반복한 PM 운영 방식", "운영 문제를 기능 목록으로 받지 않고 결정 기준, 정책, 검증 기준, 측정 범위로 나눴습니다.", C.blue, "OVERVIEW");
  const stages = [
    ["1", "문제 경계", "사용자와 운영 주체\n책임 범위"],
    ["2", "판단 기준", "대안과 제외 범위\n선택 이유"],
    ["3", "정책·데이터 계약", "단위와 권한\n필드와 상태"],
    ["4", "완료·QA 기준", "운영 서버 확인\n오류 복구"],
    ["5", "결과·측정 경계", "확인한 변화\n미계측 항목"],
  ];
  stages.forEach((stage, i) => {
    const x = 68 + i * 228;
    addBox(s, x, 173, 198, 144, i === 2 ? C.blueBg2 : C.white, i === 2 ? C.blueLine : C.line, 12, 1);
    addBadge(s, stage[0], x + 16, 189, 44, i < 3 ? C.blue : C.green);
    addText(s, stage[1], x + 16, 230, 166, 28, { size: 16, bold: true, color: C.ink, align: "center" });
    addText(s, stage[2], x + 16, 270, 166, 38, { size: 12, color: C.gray, align: "center" });
    if (i < stages.length - 1) addText(s, "→", x + 198, 225, 30, 34, { size: 19, bold: true, color: C.mid, align: "center" });
  });
  addText(s, "관세청 통관 연동", 68, 365, 210, 28, { size: 16, bold: true, color: C.blueDark });
  addRule(s, 68, 400, 1140, C.blueLine, 1);
  const customs = ["주문·포장 식별자", "협력사 API 요건", "필드·복합키", "접수·병합·재시도", "30건 검증과 운영 집계"];
  customs.forEach((v, i) => addText(s, v, 68 + i * 228, 418, 198, 42, { size: 13, color: C.blueDark, align: "center" }));
  addText(s, "산후조리원 B2B 몰", 68, 484, 230, 28, { size: 16, bold: true, color: C.greenDark });
  addRule(s, 68, 519, 1140, C.greenLine, 1);
  const b2b = ["오출고·CS·입금 대조", "플랫폼 대안 비교", "계정·결제 정책", "운영 서버 직접 확인", "초기 성과와 후속 지표"];
  b2b.forEach((v, i) => addText(s, v, 68 + i * 228, 537, 198, 42, { size: 13, color: C.greenDark, align: "center" }));
  addBox(s, 68, 606, 1140, 42, C.soft, C.line, 8, 1);
  addText(s, "공통 원칙", 88, 616, 120, 22, { size: 12, bold: true, color: C.ink });
  addText(s, "개발 완료 통보보다 운영 결과를 우선하고, 확인하지 못한 수치는 미계측으로 남겼습니다.", 218, 612, 960, 27, { size: 14, color: C.ink, align: "center" });
  addFooter(s, 2, "포트폴리오 개요 · PM 운영 방식");
  setNotes();
}

// 3. Customs section cover
{
  const s = deck.slides.add();
  s.background.fill = C.blue;
  addText(s, "Project 01.", 68, 57, 220, 40, { size: 20, bold: true, color: C.white });
  addText(s, "01 / 07", 1110, 61, 96, 24, { size: 12, color: "#D9E6F5", align: "right" });
  addText(s, "관세청 전자상거래\n통관 연동", 68, 145, 690, 102, { size: 40, bold: true, color: C.white });
  addText(s, "분산된 주문·인증·출고·통관 데이터를 국내 DB 중심으로 연결하고,\n오류 수정과 재제출 기준을 운영에 반영했습니다.", 68, 273, 704, 68, { size: 19, color: "#E7EFF8" });
  addBox(s, 825, 132, 380, 405, C.blueDark, C.blueDark, 18, 0);
  addText(s, "확정 일정", 860, 168, 310, 28, { size: 15, bold: true, color: "#DCE8F5" });
  const timeline = [
    ["2026-02", "연동 구조와 요구사항 정리"],
    ["2026-08-28", "상용 운영 시작"],
    ["2026-09-15", "운영 집계 기준일"],
  ];
  timeline.forEach((t, i) => {
    addText(s, t[0], 860, 218 + i * 69, 116, 28, { size: 14, bold: true, color: C.white });
    addText(s, t[1], 985, 218 + i * 69, 182, 38, { size: 13, color: "#E3EDF7" });
  });
  addRule(s, 68, 495, 700, "#D6E4F2", 1);
  addText(s, "담당", 68, 522, 84, 28, { size: 13, bold: true, color: "#DCE8F5" });
  addText(s, "국내 DB 중심 연동 구조, 두 인증 경로, 오류 수정·재제출 정책, 협력사 API 조율", 160, 518, 608, 56, { size: 15, color: C.white });
  addText(s, "산출물", 68, 597, 84, 28, { size: 13, bold: true, color: "#DCE8F5" });
  addText(s, "연동 구조도 · 필드 매핑표 · 오류 재제출 기준 · 운영 테스트", 160, 594, 608, 42, { size: 15, color: C.white });
  addFooter(s, 3, "Project 01 · 관세청 통관 연동");
  setNotes();
}

// 3. Customs problem
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "분산된 주문 데이터와 책임 범위", "자사몰과 외부 채널의 주문 정보를 ERP/WMS와 통관 시스템에 연결해야 했습니다.", C.blue, "CUSTOMS 02 / 06");
  addText(s, "운영 상황", 68, 166, 300, 28, { size: 15, bold: true, color: C.blue });
  addText(s, "원주문 1건이 여러 포장과 HBL로 나뉘고,\n주문·인증·상품·출고 정보는 서로 다른 시스템에 있었습니다.", 68, 201, 480, 68, { size: 20, bold: true, color: C.ink });
  const rows = [
    ["판매 채널", "주문·수하인·개인통관 정보"],
    ["ERP/WMS", "포장·HBL·상품·출고 정보"],
    ["통관 시스템", "거래정보 제출·검증·접수 결과"],
  ];
  rows.forEach((r, i) => {
    const y = 298 + i * 78;
    addBox(s, 68, y, 480, 62, i === 1 ? C.blueBg2 : C.soft, i === 1 ? C.blueLine : C.line, 10, 1);
    addText(s, r[0], 88, y + 18, 130, 26, { size: 15, bold: true, color: i === 1 ? C.blueDark : C.ink });
    addText(s, r[1], 220, y + 18, 304, 26, { size: 14, color: C.gray });
  });
  addBox(s, 586, 165, 622, 380, C.blueBg2, C.blueLine, 14, 1);
  addText(s, "주문과 포장은 1:1이 아니었습니다", 616, 190, 560, 34, { size: 21, bold: true, color: C.blueDark, align: "center" });
  addText(s, "분할", 612, 247, 62, 25, { size: 13, bold: true, color: C.blue });
  addBox(s, 684, 232, 154, 56, C.white, C.blueLine, 9, 1);
  addText(s, "원주문 A", 698, 247, 126, 25, { size: 15, bold: true, color: C.ink, align: "center" });
  addText(s, "→", 844, 244, 32, 28, { size: 19, bold: true, color: C.blue, align: "center" });
  addBox(s, 882, 222, 128, 76, C.white, C.blueLine, 9, 1);
  addText(s, "포장 A-1", 892, 236, 108, 23, { size: 14, bold: true, color: C.blueDark, align: "center" });
  addText(s, "HBL 1", 892, 265, 108, 20, { size: 12, color: C.gray, align: "center" });
  addBox(s, 1022, 222, 128, 76, C.white, C.blueLine, 9, 1);
  addText(s, "포장 A-2", 1032, 236, 108, 23, { size: 14, bold: true, color: C.blueDark, align: "center" });
  addText(s, "HBL 2", 1032, 265, 108, 20, { size: 12, color: C.gray, align: "center" });
  addRule(s, 612, 321, 570, C.blueLine, 1);
  addText(s, "합배송", 612, 357, 62, 25, { size: 13, bold: true, color: C.blue });
  addBox(s, 684, 337, 112, 64, C.white, C.blueLine, 9, 1);
  addText(s, "원주문 B", 694, 357, 92, 24, { size: 14, bold: true, color: C.ink, align: "center" });
  addText(s, "+", 800, 354, 28, 28, { size: 18, bold: true, color: C.blue, align: "center" });
  addBox(s, 832, 337, 112, 64, C.white, C.blueLine, 9, 1);
  addText(s, "원주문 C", 842, 357, 92, 24, { size: 14, bold: true, color: C.ink, align: "center" });
  addText(s, "→", 950, 354, 32, 28, { size: 19, bold: true, color: C.blue, align: "center" });
  addBox(s, 988, 327, 162, 84, C.white, C.blueLine, 9, 1);
  addText(s, "포장 D / HBL 3", 998, 344, 142, 24, { size: 14, bold: true, color: C.blueDark, align: "center" });
  addText(s, "거래정보 2건", 998, 376, 142, 20, { size: 12, color: C.gray, align: "center" });
  addText(s, "쟁점", 612, 457, 70, 25, { size: 13, bold: true, color: C.red });
  addText(s, "원주문번호와 포장 식별자를 한 필드에 섞으면 추적과 검수가 어려워졌습니다.", 682, 450, 486, 43, { size: 14, color: C.ink });
  addBox(s, 68, 558, 1140, 86, C.blue, C.blue, 12, 0);
  addText(s, "결정해야 할 것", 94, 583, 166, 28, { size: 14, bold: true, color: "#DCE8F5" });
  addText(s, "원주문번호와 ERP 포장번호·HBL을 분리해 1:N 관계를 보존", 270, 579, 904, 34, { size: 20, bold: true, color: C.white });
  addFooter(s, 4, "관세청 프로젝트 · 문제 정의");
  setNotes();
}

// 4. Customs concrete decision
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "원주문번호와 포장 식별자를 분리", "고객 주문 추적과 ERP 포장 처리를 한 필드에 섞지 않고 각각의 식별자를 보존했습니다.", C.blue, "CUSTOMS 03 / 07");
  addBox(s, 68, 164, 1140, 86, C.blue, C.blue, 14, 0);
  addText(s, "결정", 93, 190, 80, 28, { size: 14, bold: true, color: "#DCE8F5" });
  addText(s, "외부 orderNo는 원주문번호 유지 · 분할번호는 erpPackageOrderNo로 별도 저장", 178, 184, 995, 42, { size: 21, bold: true, color: C.white, align: "center" });
  const outcomes = [
    ["주문", "고도몰·관세청·GGATE에 원주문번호 유지"],
    ["포장", "erpPackageOrderNo와 HBL로 분할 포장 추적"],
    ["병합", "hwbNo와 orderNo를 복합키로 사용"],
  ];
  outcomes.forEach((o, i) => {
    const x = 68 + i * 386;
    addBox(s, x, 271, 365, 78, C.blueBg2, C.blueLine, 10, 1);
    addText(s, o[0], x + 18, 293, 64, 28, { size: 14, bold: true, color: C.blue });
    addText(s, o[1], x + 84, 287, 255, 40, { size: 14, color: C.ink, align: "center" });
  });
  addBox(s, 68, 379, 546, 230, C.blueBg2, C.blueLine, 12, 1);
  addText(s, "분할 주문", 92, 400, 140, 28, { size: 16, bold: true, color: C.blueDark });
  addText(s, "같은 orderNo를 유지하고 포장 식별자만 분리", 238, 400, 346, 28, { size: 14, color: C.gray, align: "right" });
  addBox(s, 96, 451, 150, 72, C.white, C.blueLine, 9, 1);
  addText(s, "orderNo A", 109, 475, 124, 25, { size: 15, bold: true, color: C.ink, align: "center" });
  addText(s, "→", 252, 472, 34, 30, { size: 20, bold: true, color: C.blue, align: "center" });
  addBox(s, 292, 437, 130, 100, C.white, C.blueLine, 9, 1);
  addText(s, "A-1", 304, 453, 106, 23, { size: 15, bold: true, color: C.blueDark, align: "center" });
  addText(s, "ERP 포장번호\nHBL 1", 304, 482, 106, 40, { size: 12, color: C.gray, align: "center" });
  addBox(s, 438, 437, 130, 100, C.white, C.blueLine, 9, 1);
  addText(s, "A-2", 450, 453, 106, 23, { size: 15, bold: true, color: C.blueDark, align: "center" });
  addText(s, "ERP 포장번호\nHBL 2", 450, 482, 106, 40, { size: 12, color: C.gray, align: "center" });
  addText(s, "외부 orderNo는 A로 유지", 96, 560, 472, 24, { size: 13, bold: true, color: C.blueDark, align: "center" });
  addBox(s, 638, 379, 570, 230, C.white, C.line, 12, 1);
  addText(s, "합배송", 662, 400, 120, 28, { size: 16, bold: true, color: C.blueDark });
  addText(s, "한 HBL에 주문 여러 건이면 거래정보도 주문별로 제출", 790, 400, 390, 28, { size: 14, color: C.gray, align: "right" });
  addBox(s, 672, 451, 126, 72, C.white, C.blueLine, 9, 1);
  addText(s, "orderNo B", 684, 475, 102, 24, { size: 14, bold: true, color: C.ink, align: "center" });
  addText(s, "+", 804, 472, 30, 30, { size: 19, bold: true, color: C.blue, align: "center" });
  addBox(s, 840, 451, 126, 72, C.white, C.blueLine, 9, 1);
  addText(s, "orderNo C", 852, 475, 102, 24, { size: 14, bold: true, color: C.ink, align: "center" });
  addText(s, "→", 972, 472, 34, 30, { size: 20, bold: true, color: C.blue, align: "center" });
  addBox(s, 1012, 437, 150, 100, C.blueBg2, C.blueLine, 9, 1);
  addText(s, "HBL 3", 1024, 453, 126, 23, { size: 15, bold: true, color: C.blueDark, align: "center" });
  addText(s, "TRA001\n거래정보 2건", 1024, 482, 126, 40, { size: 12, color: C.gray, align: "center" });
  addText(s, "HBL은 포장 식별자, orderNo는 거래 추적 식별자", 662, 560, 500, 24, { size: 13, bold: true, color: C.blueDark, align: "center" });
  addFooter(s, 5, "관세청 프로젝트 · 분할 출고 기준");
  setNotes();
}

// 6. Customs data contract
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "데이터 계약을 필드·주체·키·완료 기준으로 명시", "연동 참여자가 같은 주문을 같은 상태로 해석하도록 전달 형식과 검증 조건을 한 문서에 묶었습니다.", C.blue, "CUSTOMS 04 / 07");
  await addImage(s, E.customsIdentifiers, 68, 170, 780, 325, "관세청 프로젝트 최신 식별자 계약 업무 문서 발췌", "contain");
  addCaption(s, "planning_v7 업무 문서 발췌 · 2026-09-08 기준 · 역할명 일부 치환", 342, 505, 506, C.blueDark);
  addBox(s, 878, 170, 330, 325, C.blueBg2, C.blueLine, 14, 1);
  addText(s, "데이터 계약의 네 요소", 904, 195, 278, 30, { size: 17, bold: true, color: C.blueDark });
  const items = [
    ["주문", "orderNo는 플랫폼 원주문번호 유지"],
    ["포장", "erpPackageOrderNo와 HBL을 별도 보존"],
    ["병합", "hwbNo와 orderNo로 동일 건 식별"],
    ["제출", "txif_sbmt_no로 관세청 결과 대사"],
  ];
  items.forEach((item, i) => {
    const y = 242 + i * 58;
    addText(s, item[0], 904, y, 58, 24, { size: 13, bold: true, color: C.blue });
    addText(s, item[1], 968, y - 2, 214, 38, { size: 13, color: C.ink });
    if (i < items.length - 1) addRule(s, 904, y + 39, 278, C.blueLine, 1);
  });
  addBox(s, 68, 544, 1140, 92, C.soft, C.line, 12, 1);
  addText(s, "문서의 역할", 92, 572, 132, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "개발사별 구현 지시와 운영팀의 확인 기준을 같은 표에 두어, 누락과 책임 공백을 검수 항목으로 바꿨습니다.", 230, 561, 942, 45, { size: 17, bold: true, color: C.ink, align: "center" });
  addFooter(s, 6, "관세청 프로젝트 · 데이터 계약");
  setNotes();
}

// 7. Customs responsibility and recovery
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "접수·병합·통관 완료 상태를 분리", "HTTP 접수와 최종 완료를 같은 상태로 보지 않고, 제공자별 조회 키와 재시도 기준을 나눴습니다.", C.blue, "CUSTOMS 05 / 07");
  const systems = [
    ["판매 채널", "주문·수하인·인증", C.soft, C.ink],
    ["국내 DB", "정규화·분기·상태", C.blue, C.white],
    ["ERP/WMS", "포장·HBL·상품", C.blueBg2, C.blueDark],
    ["통관 시스템", "병합·검증·접수", C.soft, C.ink],
  ];
  systems.forEach((node, i) => {
    const x = 68 + i * 292;
    addBox(s, x, 171, 250, 100, node[2], i === 1 ? C.blue : C.line, 12, 1);
    addText(s, node[0], x + 18, 191, 214, 28, { size: 17, bold: true, color: node[3], align: "center" });
    addText(s, node[1], x + 18, 231, 214, 24, { size: 13, color: i === 1 ? "#E7EFF8" : C.gray, align: "center" });
    if (i < systems.length - 1) addText(s, "→", x + 252, 205, 40, 36, { size: 23, bold: true, color: C.blue, align: "center" });
  });
  addText(s, "상태와 복구 기준", 68, 304, 190, 28, { size: 16, bold: true, color: C.blue });
  const flow = ["HTTP 202 접수", "status/search 확인", "원천 수정·재시도", "merged·통관 결과"];
  flow.forEach((label, i) => {
    const x = 68 + i * 287;
    addBox(s, x, 345, 245, 62, i === 3 ? C.blue : C.white, i === 3 ? C.blue : C.blueLine, 10, 1);
    addText(s, label, x + 15, 364, 215, 27, { size: 15, bold: true, color: i === 3 ? C.white : C.ink, align: "center" });
    if (i < flow.length - 1) addText(s, "→", x + 246, 361, 40, 29, { size: 20, bold: true, color: C.blue, align: "center" });
  });
  await addImage(s, E.customsState, 82, 444, 1112, 178, "관세청 프로젝트 최신 상태와 재시도 업무 문서 발췌", "contain");
  addCaption(s, "planning_v7 업무 문서 발췌 · 2026-09-08 기준 · 역할명 일부 치환", 654, 630, 540, C.blueDark);
  addFooter(s, 7, "관세청 프로젝트 · 역할과 복구 경계");
  setNotes();
}

// 6. Customs QA
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "정상 접수·의도 오류·수정 재제출을 함께 검증", "정상 경로만 확인하지 않고 오류 반환과 복구 경로까지 운영 환경에서 확인했습니다.", C.blue, "CUSTOMS 05 / 06");
  const cases = [
    ["01", "정상 접수", "필수값을 갖춘 거래정보 제출", "정상 접수 결과 확인"],
    ["02", "의도 오류", "필수값을 의도적으로 누락", "예상한 오류 응답 확인"],
    ["03", "수정 재제출", "원천값 수정 후 다시 제출", "정상 접수로 전환 확인"],
  ];
  cases.forEach((c, i) => {
    const y = 172 + i * 116;
    addBox(s, 68, y, 1140, 96, i === 2 ? C.blueBg2 : C.white, i === 2 ? C.blueLine : C.line, 12, 1);
    addBadge(s, c[0], 88, y + 34, 50, C.blue);
    addText(s, c[1], 158, y + 25, 170, 34, { size: 20, bold: true, color: C.ink });
    addText(s, c[2], 350, y + 25, 352, 40, { size: 15, color: C.gray, align: "center" });
    addText(s, "→", 714, y + 29, 52, 32, { size: 22, bold: true, color: C.blue, align: "center" });
    addText(s, c[3], 780, y + 25, 390, 40, { size: 16, bold: true, color: C.blueDark, align: "center" });
  });
  addBox(s, 68, 536, 760, 102, C.blue, C.blue, 12, 0);
  addText(s, "운영 환경 테스트", 94, 557, 220, 28, { size: 14, bold: true, color: "#DCE8F5" });
  addText(s, "30건 검증 · 목적 30/30 통과", 310, 551, 486, 42, { size: 25, bold: true, color: C.white, align: "center" });
  addBox(s, 850, 536, 358, 102, C.soft, C.line, 12, 1);
  addText(s, "확인 범위", 872, 555, 100, 24, { size: 13, bold: true, color: C.ink });
  addText(s, "세 유형별 개별 건수는 미확인", 872, 586, 310, 28, { size: 13, color: C.gray });
  addFooter(s, 8, "관세청 프로젝트 · 운영 QA");
  setNotes();
}

// 7. Customs results
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 1, "운영 환경 30건 검증 후 상용 운영을 시작", "2026-08-28부터 2026-09-15까지의 운영 집계와 측정 경계를 함께 정리했습니다.", C.blue, "CUSTOMS 06 / 06");
  addMetric(s, 68, 174, 258, "30건", "운영 환경 검증 · 목적 30/30 통과", C.blue, C.blueBg2);
  addMetric(s, 350, 174, 258, "약 300건", "일평균 발생 주문 규모", C.blue, C.white);
  addMetric(s, 632, 174, 258, "230 / 70", "자사몰 / 기타 주문", C.blue, C.white);
  addMetric(s, 914, 174, 294, "전체 완료", "집계 대상 주문 통관", C.blue, C.blueBg2);
  addBox(s, 68, 323, 1140, 145, C.soft, C.line, 12, 1);
  addText(s, "운영 판단", 94, 347, 124, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "신규 연동과 기존 방식을 병행한 상태에서도 집계 대상 주문의 통관 완료를 확인했습니다.", 226, 342, 935, 36, { size: 20, bold: true, color: C.ink });
  addText(s, "운영 환경에서 30건을 검증했고, 설정한 테스트 목적은 30/30 통과했습니다. 자동 처리율·신규 경로 비중·처리 시간은 별도 계측하지 않았습니다.", 226, 397, 935, 40, { size: 14, color: C.gray });
  addBox(s, 68, 492, 1140, 146, C.blueBg2, C.blueLine, 12, 1);
  addText(s, "2026-08-28", 94, 523, 170, 28, { size: 16, bold: true, color: C.blueDark });
  addText(s, "상용 운영 시작", 94, 558, 170, 25, { size: 13, color: C.gray });
  addText(s, "→", 280, 538, 54, 34, { size: 24, bold: true, color: C.blue, align: "center" });
  addText(s, "2026-09-15", 355, 523, 170, 28, { size: 16, bold: true, color: C.blueDark });
  addText(s, "운영 집계 기준일", 355, 558, 170, 25, { size: 13, color: C.gray });
  addText(s, "확인한 결과", 603, 519, 130, 28, { size: 14, bold: true, color: C.blue });
  addText(s, "일평균 약 300건 · 자사몰 230건 · 기타 70건", 742, 512, 421, 42, { size: 18, bold: true, color: C.ink, align: "center" });
  addText(s, "2026-08-28~2026-09-15 집계", 742, 562, 421, 24, { size: 12, color: C.gray, align: "center" });
  addFooter(s, 9, "관세청 프로젝트 · 결과와 한계");
  setNotes();
}

// 8. B2B section cover with actual screen
{
  const s = deck.slides.add();
  s.background.fill = C.green;
  addText(s, "Project 02.", 68, 57, 220, 40, { size: 20, bold: true, color: C.white });
  addText(s, "01 / 07", 1110, 61, 96, 24, { size: 12, color: "#D9EFE2", align: "right" });
  addText(s, "산후조리원 전용\nB2B 몰", 68, 140, 620, 102, { size: 40, bold: true, color: C.white });
  addText(s, "4개 계정 유형과 혼합 주문 차단 기준을 설계하고,\n운영 서버에서 직접 확인한 항목만 완료로 처리했습니다.", 68, 268, 630, 68, { size: 19, color: "#E3F1E9" });
  addBox(s, 68, 383, 615, 182, C.greenDark, C.greenDark, 16, 0);
  addText(s, "담당", 94, 410, 70, 25, { size: 13, bold: true, color: "#D9EFE2" });
  addText(s, "고객사·공급사의 주문, 납기, 출고, 정산 조율", 170, 407, 476, 35, { size: 16, color: C.white });
  addText(s, "일정", 94, 463, 70, 25, { size: 13, bold: true, color: "#D9EFE2" });
  addText(s, "2026-06 기획 · 07-02 개발 착수 · 07-16 핵심 흐름 운영\n08-06~13 운영 고도화·QA · 08-31 최종 검수", 170, 452, 476, 54, { size: 12, color: C.white });
  addText(s, "산출물", 94, 522, 70, 25, { size: 13, bold: true, color: "#D9EFE2" });
  addText(s, "계정 정책표 · 결제 규칙 · QA 결과 · 운영 화면", 170, 518, 476, 32, { size: 15, color: C.white });
  await addImage(s, E.b2bBanner, 724, 176, 480, 128, "산후조리원 전용몰 실운영 홈 화면 기능 안내 배너", "contain");
  addCaption(s, "실운영 홈 화면 발췌 · 2026-08-28", 824, 314, 380, "#E3F1E9");
  addBox(s, 724, 363, 480, 202, C.greenDark, C.greenDark, 16, 0);
  addText(s, "화면에 반영한 운영 기준", 754, 393, 420, 28, { size: 15, bold: true, color: "#D9EFE2" });
  addText(s, "거래명세서 다운로드\n당일 출고 마감 안내\n배송 상태 확인\n정확한 입금 확인", 754, 438, 420, 104, { size: 19, bold: true, color: C.white, align: "center" });
  addFooter(s, 10, "Project 02 · 산후조리원 B2B 몰");
  setNotes();
}

// 9. B2B problems and concrete reflected items
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "운영 시작 전 반복된 문제와 설계 기준", "오출고·문의·입금 대조 문제를 실제 운영 화면과 정책에 연결했습니다.", C.green, "B2B 02 / 06");
  addMetric(s, 68, 169, 252, "월 2~3건", "직전 6개월 평균 오출고", C.green, C.greenBg2);
  addMetric(s, 68, 297, 252, "32건", "2026-01~2026-06의 2주 환산 CS 문의", C.green, C.white);
  addMetric(s, 68, 425, 252, "15~30분", "매일 입금 대조 시간", C.green, C.white);
  addBox(s, 365, 169, 843, 432, C.white, C.line, 14, 1);
  addText(s, "관찰한 문제", 391, 193, 188, 26, { size: 14, bold: true, color: C.gray });
  addText(s, "원인 가설", 634, 193, 188, 26, { size: 14, bold: true, color: C.gray });
  addText(s, "정책·화면 반영", 913, 193, 245, 26, { size: 14, bold: true, color: C.greenDark });
  addRule(s, 391, 228, 791, C.line, 1);
  const design = [
    ["거래명세서 요청", "셀프 조회 경로 부재", "주문 후 직접 다운로드"],
    ["당일 출고 문의", "마감 기준 노출 부족", "영업일 10시 마감 안내"],
    ["배송 현황 문의", "송장과 상태 정보 분산", "마이페이지 상태 확인"],
    ["입금 대조 지연", "입금자명·금액 불일치", "정확한 입금 정보 안내"],
  ];
  design.forEach((d, i) => {
    const y = 245 + i * 82;
    if (i === 3) addBox(s, 383, y - 5, 807, 70, C.greenBg, C.greenLine, 8, 1);
    addText(s, d[0], 397, y + 12, 176, 28, { size: 14, bold: true, color: C.ink });
    addText(s, d[1], 606, y + 10, 244, 32, { size: 13, color: C.gray, align: "center" });
    addText(s, d[2], 888, y + 9, 278, 34, { size: 14, bold: i === 3, color: C.greenDark, align: "center" });
    if (i < design.length - 1) addRule(s, 391, y + 61, 791, C.line, 1);
  });
  addText(s, "입금 대조 시간의 개선 후 수치는 미측정", 68, 572, 252, 42, { size: 11, color: C.mid, align: "center" });
  addFooter(s, 11, "산후조리원 B2B 몰 · 문제와 화면 반영");
  setNotes();
}

// 10. B2B option decision
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "기존 플랫폼에 계정·결제 정책을 추가하는 방식을 선택", "운영팀 러닝커브, 기존 인프라 일치, 유지보수 책임범위, 구축비용 순서로 판단했습니다.", C.green, "B2B 03 / 06");
  addText(s, "판단 기준", 68, 163, 100, 25, { size: 13, bold: true, color: C.green });
  const criteria = ["① 운영팀 러닝커브", "② 기존 인프라 일치", "③ 유지보수 책임범위", "④ 구축비용 · 금액 비공개"];
  criteria.forEach((label, i) => {
    const x = 180 + i * 256;
    addBox(s, x, 154, 238, 42, i === 0 ? C.greenBg : C.soft, i === 0 ? C.greenLine : C.line, 8, 1);
    addText(s, label, x + 10, 164, 218, 23, { size: 12, bold: i === 0, color: i === 0 ? C.greenDark : C.gray, align: "center" });
  });
  const cols = [68, 420, 1028];
  addText(s, "대안", cols[0], 217, 320, 25, { size: 13, bold: true, color: C.gray });
  addText(s, "확인한 핵심", cols[1], 217, 560, 25, { size: 13, bold: true, color: C.gray, align: "center" });
  addText(s, "판단", cols[2], 217, 180, 25, { size: 13, bold: true, color: C.gray, align: "center" });
  addRule(s, 68, 248, 1140, C.line, 1);
  const options = [
    ["맞춤형 웹서비스 직접 개발", "유지보수 책임이 내부로 확대", "제외"],
    ["다른 쇼핑몰 솔루션 전환", "운영팀이 새 솔루션을 다시 학습", "제외"],
    ["기존 커머스 솔루션 + 정책 맞춤", "기존 인프라와 운영 방식을 유지", "채택"],
  ];
  options.forEach((o, i) => {
    const y = 262 + i * 64;
    if (i === 2) addBox(s, 68, y, 1140, 52, C.greenBg, C.greenLine, 8, 1);
    else if (i === 0) addBox(s, 68, y, 1140, 52, C.soft, C.soft, 0, 0);
    addText(s, o[0], cols[0] + 16, y + 15, 330, 27, { size: 15, bold: i === 2, color: i === 2 ? C.greenDark : C.ink });
    addText(s, o[1], cols[1], y + 15, 560, 27, { size: 14, color: C.gray, align: "center" });
    addText(s, o[2], cols[2], y + 13, 180, 28, { size: 15, bold: true, color: i === 2 ? C.green : C.gray, align: "center" });
  });
  addText(s, "범위에서 제외한 기능과 이유", 68, 468, 300, 28, { size: 16, bold: true, color: C.green });
  const cuts = [
    ["PG 결제", "B2B 마진 대비 수수료 부담"],
    ["견적서 신규 개발", "기본 거래명세서로 대체"],
    ["포인트 완전 자동화", "계약 상태 변경 시 지급 번복 위험"],
  ];
  cuts.forEach((c, i) => addStep(s, 68 + i * 386, 509, 365, String(i + 1), c[0], c[1], C.green, i === 2 ? C.greenBg2 : C.white));
  addFooter(s, 12, "산후조리원 B2B 몰 · 대안과 범위 결정");
  setNotes();
}

// 13. B2B requirements and definition of done
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "요구사항을 계약 범위와 검수 상태로 분리", "요청의 성격을 먼저 구분하고, 개발사 반영 통보와 운영 완료를 다른 상태로 관리했습니다.", C.green, "B2B 04 / 07");
  addText(s, "요구사항 분류", 68, 160, 250, 28, { size: 16, bold: true, color: C.greenDark });
  const reqTable = s.tables.add({
    rows: 6,
    columns: 3,
    left: 68,
    top: 198,
    width: 710,
    height: 356,
    columnWidths: [92, 234, 384],
    values: [
      ["구분", "정의", "처리 기준"],
      ["BR", "기본 개발요구 01~22", "운영 서버에서 기대 결과를 확인할 때 완료"],
      ["AR", "범위 밖 추가 요청", "공수 산정과 승인 후 착수"],
      ["OP", "40시간 유지보수 장부", "확정 차감·예약·잔여 시간을 분리"],
      ["BUG", "기존 기능의 비정상 동작", "하자로 분리해 우선 처리"],
      ["HOLD", "의사결정·외부 확인 대기", "재개 조건과 확인 주체를 기록"],
    ],
  });
  reqTable.borders.assign({ style: "solid", fill: C.line, width: 1 });
  reqTable.cells.block({ row: 0, column: 0, rowCount: 6, columnCount: 3 }).assign({
    textStyle: { typeface: font, fontSize: 13, color: C.ink },
    margins: { left: 10, right: 10, top: 7, bottom: 7 },
  });
  reqTable.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: 3 }).assign({
    fill: C.greenBg,
    textStyle: { typeface: font, fontSize: 13, bold: true, color: C.greenDark },
  });
  reqTable.cells.block({ row: 1, column: 0, rowCount: 5, columnCount: 1 }).assign({
    textStyle: { typeface: font, fontSize: 14, bold: true, color: C.greenDark },
  });
  addBox(s, 814, 160, 394, 394, C.greenBg2, C.greenLine, 14, 1);
  addText(s, "BR 22건 검수 현황", 840, 186, 342, 29, { size: 17, bold: true, color: C.greenDark });
  addText(s, "기준일 2026-08-13", 840, 221, 342, 23, { size: 12, color: C.gray });
  const statusRows = [
    ["17건", "배포·QA 필요"],
    ["1건", "부분완료·QA 필요"],
    ["1건", "수정완료·회귀 QA"],
    ["1건", "구현변경·QA 필요"],
    ["2건", "진행 중인 계약 항목"],
  ];
  statusRows.forEach((row, i) => {
    const y = 266 + i * 50;
    addText(s, row[0], 840, y, 72, 28, { size: 18, bold: true, color: C.green, align: "right" });
    addText(s, row[1], 930, y + 1, 238, 27, { size: 14, color: C.ink });
    if (i < statusRows.length - 1) addRule(s, 840, y + 37, 328, C.greenLine, 1);
  });
  addBox(s, 68, 582, 1140, 56, C.green, C.green, 10, 0);
  addText(s, "성과와 검수", 92, 598, 126, 25, { size: 13, bold: true, color: "#D9EFE2" });
  addText(s, "핵심 흐름은 07-16 전체 가동 후 약 1개월 관찰 · 기본 개발요구 22건은 08-31 최종검수까지 운영 QA 지속", 224, 590, 950, 36, { size: 15, bold: true, color: C.white, align: "center" });
  addFooter(s, 13, "산후조리원 B2B 몰 · 요구사항과 완료 정의");
  setNotes();
}

// 14. B2B concrete QA case
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "개발 완료 통보 뒤에도 마이페이지 진입이 되지 않았습니다", "완료의 기준을 개발사 회신에서 운영 서버 직접 확인으로 바꾼 사례입니다.", C.green, "B2B 04 / 06");
  addBox(s, 68, 166, 558, 448, C.greenBg2, C.greenLine, 14, 1);
  const caseRows = [
    ["현상", "마이페이지 ‘정보 수정’ 진입 실패"],
    ["확인", "운영 서버 미반영과 기존 차단 로직 잔존"],
    ["분리 점검", "배포 여부와 차단 조건을 각각 확인"],
    ["결정", "운영 서버에서 기대 결과를 직접 확인한 경우만 완료"],
  ];
  caseRows.forEach((r, i) => {
    const y = 190 + i * 92;
    addBadge(s, String(i + 1).padStart(2, "0"), 90, y, 48, C.green);
    addText(s, r[0], 154, y + 2, 90, 28, { size: 15, bold: true, color: C.greenDark });
    addText(s, r[1], 248, y - 2, 344, 46, { size: 16, bold: i === 3, color: C.ink });
    if (i < caseRows.length - 1) addRule(s, 90, y + 60, 500, C.greenLine, 1);
  });
  addBox(s, 650, 166, 558, 448, C.white, C.line, 14, 1);
  addText(s, "사례가 발생한 실제 화면", 676, 191, 506, 28, { size: 15, bold: true, color: C.greenDark });
  await addImage(s, E.b2bMenu, 724, 235, 252, 300, "산후조리원 전용몰 실운영 마이페이지 메뉴", "contain");
  addBox(s, 1002, 235, 166, 300, C.soft, C.line, 10, 1);
  addText(s, "확인 항목", 1021, 257, 128, 25, { size: 13, bold: true, color: C.ink, align: "center" });
  addText(s, "정보 수정\n메뉴 노출\n\n진입 가능 여부\n\n운영 배포 여부\n\n차단 조건 잔존", 1021, 302, 128, 196, { size: 14, color: C.gray, align: "center" });
  addCaption(s, "실운영 마이페이지 발췌 · 2026-08-28", 792, 555, 376, C.greenDark);
  addFooter(s, 14, "산후조리원 B2B 몰 · 운영 서버 QA 사례");
  setNotes();
}

// 12. B2B account policy
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "4개 계정 유형의 상품·결제 정책을 한 표로 고정", "등급과 카테고리 조합으로 결제 방식을 정하고, 결제 방식이 다른 혼합 주문을 차단했습니다.", C.green, "B2B 05 / 06");
  await addImage(s, E.b2bPolicy, 68, 166, 806, 318, "실제 산후조리원몰 과업 처리 결과의 회원 등급별 상품 결제 정책표", "contain");
  addCaption(s, "업무 문서 발췌 · 원문 ‘선불입금/후불입금’은 현행 ‘분유(선불/후불)’로 정리", 292, 493, 582, C.greenDark);
  addBox(s, 906, 166, 302, 318, C.greenBg2, C.greenLine, 14, 1);
  addText(s, "결정한 정책", 932, 193, 250, 28, { size: 16, bold: true, color: C.greenDark });
  addText(s, "물품계약(선불)\n물품계약(후불)\n분유(선불)\n분유(후불)", 932, 240, 250, 116, { size: 17, bold: true, color: C.ink, align: "center" });
  addRule(s, 932, 374, 250, C.greenLine, 1);
  addText(s, "관리자가 등급 × 카테고리 표에서\n결제 방식을 설정", 932, 397, 250, 57, { size: 14, color: C.gray, align: "center" });
  addBox(s, 68, 533, 1140, 105, C.green, C.green, 12, 0);
  addText(s, "혼합 주문 차단", 94, 559, 190, 28, { size: 14, bold: true, color: "#D9EFE2" });
  addText(s, "선불 상품과 후불 상품을 한 주문에 담는 경우 양방향으로 차단", 290, 551, 884, 42, { size: 21, bold: true, color: C.white, align: "center" });
  addFooter(s, 15, "산후조리원 B2B 몰 · 계정·결제 정책");
  setNotes();
}

// 13. B2B results and limits
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "핵심 흐름 가동 후 오출고와 CS 문의 변화를 관찰", "운영 초기 결과와 측정하지 못한 항목을 함께 표기했습니다.", C.green, "B2B 06 / 06");
  addBox(s, 68, 167, 385, 178, C.greenBg2, C.greenLine, 14, 1);
  addText(s, "오출고", 94, 190, 126, 28, { size: 15, bold: true, color: C.greenDark });
  addText(s, "월평균 2~3건  →  0건", 94, 233, 333, 45, { size: 25, bold: true, color: C.green });
  addText(s, "직전 6개월 평균과 2026-07-16 이후 약 1개월 전체 측정 비교", 94, 295, 333, 38, { size: 11, color: C.gray });
  addBox(s, 68, 363, 385, 178, C.white, C.line, 14, 1);
  addText(s, "CS 문의", 94, 386, 126, 28, { size: 15, bold: true, color: C.greenDark });
  addText(s, "32건  →  19건", 94, 429, 333, 45, { size: 25, bold: true, color: C.green });
  addText(s, "2026-01~2026-06의 2주 환산치와 2026-07~2026-08 배포 구간 2주 집계 비교", 94, 491, 333, 38, { size: 11, color: C.gray });
  addBox(s, 490, 167, 718, 374, C.soft, C.line, 14, 1);
  addText(s, "운영 상태를 확인한 실제 화면", 516, 192, 666, 28, { size: 15, bold: true, color: C.greenDark });
  await addImage(s, E.b2bStatus, 516, 238, 666, 137, "산후조리원 전용몰 실운영 마이페이지 주문 상태 영역", "contain");
  addCaption(s, "실운영 마이페이지 발췌 · 주문 현황은 운영 화면 구조 확인용", 694, 385, 488, C.greenDark);
  addText(s, "확인한 변화", 516, 429, 130, 25, { size: 13, bold: true, color: C.ink });
  addText(s, "주문 상태를 직접 확인할 수 있는 흐름과 운영 안내가 가동되었습니다.", 648, 424, 516, 36, { size: 15, color: C.ink });
  addText(s, "관찰 범위", 516, 478, 130, 25, { size: 13, bold: true, color: C.ink });
  addText(s, "초기 운영 약 1개월. 입금 대조 시간과 장기 지속 효과는 미측정입니다.", 648, 473, 516, 38, { size: 14, color: C.gray });
  addBox(s, 68, 574, 1140, 64, C.green, C.green, 10, 0);
  addText(s, "결과 해석", 94, 593, 130, 25, { size: 13, bold: true, color: "#D9EFE2" });
  addText(s, "초기 운영 결과는 오출고와 CS 문의로 확인했습니다. 입금 대조 시간과 장기 지속 효과는 후속 측정 항목입니다.", 230, 586, 944, 34, { size: 17, bold: true, color: C.white, align: "center" });
  addFooter(s, 16, "산후조리원 B2B 몰 · 결과와 측정 경계");
  setNotes();
}

// 17. Closing summary
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 0, "두 프로젝트가 보여준 PM 역할", "문제 정의에서 멈추지 않고 정책과 데이터 계약을 만들고 운영 환경에서 결과를 확인했습니다.", C.blue, "SUMMARY");
  addBox(s, 68, 171, 552, 332, C.blueBg2, C.blueLine, 16, 1);
  addText(s, "관세청 통관 연동", 96, 199, 496, 31, { size: 22, bold: true, color: C.blueDark });
  const customsSummary = [
    ["문제", "분할·합배송과 시스템별 식별자 불일치"],
    ["판단", "원주문번호·ERP 포장번호·HBL을 분리"],
    ["산출물", "필드 매핑, 복합키, 상태·재시도 기준"],
    ["확인", "운영 환경 30건 목적 30/30 통과"],
  ];
  customsSummary.forEach((row, i) => {
    const y = 252 + i * 57;
    addText(s, row[0], 96, y, 72, 25, { size: 13, bold: true, color: C.blue });
    addText(s, row[1], 174, y - 2, 418, 36, { size: 14, color: C.ink });
    if (i < customsSummary.length - 1) addRule(s, 96, y + 39, 496, C.blueLine, 1);
  });
  addBox(s, 656, 171, 552, 332, C.greenBg2, C.greenLine, 16, 1);
  addText(s, "산후조리원 B2B 몰", 684, 199, 496, 31, { size: 22, bold: true, color: C.greenDark });
  const b2bSummary = [
    ["문제", "오출고, 반복 문의, 수기 입금 대조"],
    ["판단", "기존 플랫폼을 유지하고 정책을 맞춤"],
    ["산출물", "계정·결제 정책, 요구사항 상태, 운영 QA"],
    ["확인", "오출고 0건과 CS 문의 초기 감소 관찰"],
  ];
  b2bSummary.forEach((row, i) => {
    const y = 252 + i * 57;
    addText(s, row[0], 684, y, 72, 25, { size: 13, bold: true, color: C.green });
    addText(s, row[1], 762, y - 2, 418, 36, { size: 14, color: C.ink });
    if (i < b2bSummary.length - 1) addRule(s, 684, y + 39, 496, C.greenLine, 1);
  });
  addText(s, "후속 측정", 68, 538, 132, 28, { size: 16, bold: true, color: C.ink });
  addBox(s, 68, 575, 1140, 64, C.soft, C.line, 10, 1);
  addText(s, "관세청", 92, 594, 96, 25, { size: 13, bold: true, color: C.blueDark });
  addText(s, "자동 처리율 · 신규 경로 비중 · 처리 시간", 188, 590, 390, 32, { size: 14, color: C.ink, align: "center" });
  addText(s, "B2B 몰", 630, 594, 96, 25, { size: 13, bold: true, color: C.greenDark });
  addText(s, "입금 대조 시간 · 오출고와 CS 문의의 장기 추이", 726, 590, 456, 32, { size: 14, color: C.ink, align: "center" });
  addFooter(s, 17, "박종혁 PM 포트폴리오 · 요약");
  setNotes();
}

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools", "artifact_tool_utils.mjs"),
).href);

const candidatePath = path.join(buildDir, "candidate_v4_2.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

const candidateZip = await JSZip.loadAsync(await fs.readFile(candidatePath));
const coreEntry = candidateZip.file("docProps/core.xml");
if (coreEntry) {
  let coreXml = await coreEntry.async("string");
  coreXml = coreXml
    .replace("<dc:creator>Walnut Exporter</dc:creator>", "<dc:creator>박종혁</dc:creator>")
    .replace("<lastModifiedBy>Walnut Exporter</lastModifiedBy>", "<lastModifiedBy>박종혁</lastModifiedBy>")
    .replace("<dc:title>Presentation</dc:title>", "<dc:title>박종혁 PM 포트폴리오 v4.2</dc:title>");
  candidateZip.file("docProps/core.xml", coreXml);
  await fs.writeFile(candidatePath, await candidateZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

const result = await finalizePresentation({
  explicitTotalSlideCount: totalSlides,
  requiredNativeTableOwnerSlides: [13],
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
    "--require-native-table-slide", "13",
  ],
  fontPolicy: { basis: "design", families: [font] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, "v4_2.validation.json"),
});

console.log(JSON.stringify({ finalPath, result }, null, 2));

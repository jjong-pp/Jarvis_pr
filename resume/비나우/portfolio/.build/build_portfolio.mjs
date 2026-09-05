import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/MyMain/main/resume/비나우/portfolio";
const buildDir = path.join(workspaceDir, ".build");
const outputDir = path.join(workspaceDir, "output");
const skillDir = "C:/Users/ParkJongHyeok/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
const pythonExecutable = "C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const finalPath = path.join(outputDir, "박종혁_비나우_수요예측_SCM_PM_포트폴리오_초안_v0.2.pptx");
const font = "Noto Sans KR";

const C = {
  navy: "#14253D",
  blue: "#2563EB",
  teal: "#0F8B8D",
  green: "#159947",
  orange: "#D97706",
  red: "#C2413B",
  ink: "#182235",
  gray: "#687386",
  light: "#F4F7FA",
  line: "#D8E0E8",
  white: "#FFFFFF",
  paleBlue: "#EDF4FF",
  paleGreen: "#ECF8F1",
  paleOrange: "#FFF4E5",
  paleRed: "#FFF0EE",
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
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    autoFit: "none",
  };
  return shape;
}

function addBox(slide, x, y, w, h, fill = C.light, line = C.line, radius = 12) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: 1 },
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

function addHeader(slide, n, title, subtitle = "") {
  addText(slide, String(n).padStart(2, "0"), 52, 36, 46, 28, { size: 16, bold: true, color: C.teal });
  addText(slide, title, 104, 31, 1080, 54, { size: 31, bold: true, color: C.ink });
  if (subtitle) addText(slide, subtitle, 104, 82, 1080, 30, { size: 15, color: C.gray });
  addRule(slide, 52, 116, 1176, C.line, 1);
}

function addFooter(slide, n, note = "") {
  addRule(slide, 52, 678, 1176, C.line, 1);
  addText(slide, note || "박종혁 | 비나우 구매 수요예측(S&OP)", 52, 686, 1040, 20, { size: 11, color: C.gray });
  addText(slide, `${n} / 7`, 1150, 686, 78, 20, { size: 11, color: C.gray, align: "right" });
}

function setNotes(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
}

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

// 1. Cover
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 710, height: 720 }, fill: C.navy, line: { fill: "none", width: 0 } });
  addText(s, "수요예측·재고 운영", 70, 150, 570, 72, { size: 45, bold: true, color: C.white });
  addText(s, "판매·출고·재고 데이터를\n월간 발주 판단으로 연결한 경험", 70, 238, 550, 110, { size: 27, color: "#D8E6F5" });
  addText(s, "박종혁", 70, 555, 210, 45, { size: 25, bold: true, color: C.white });
  addText(s, "비나우 구매 수요예측(S&OP) 지원", 70, 604, 420, 28, { size: 16, color: "#B9C9DC" });
  addText(s, "40개 SKU", 790, 152, 340, 52, { size: 34, bold: true, color: C.blue });
  addText(s, "실제 업무 판단 범위", 790, 207, 340, 25, { size: 15, color: C.gray });
  addRule(s, 790, 255, 360, C.line, 1);
  addText(s, "24주", 790, 292, 340, 52, { size: 34, bold: true, color: C.teal });
  addText(s, "현재고와 입고계획을 연결한 예상 재고", 790, 347, 390, 42, { size: 15, color: C.gray });
  addRule(s, 790, 414, 360, C.line, 1);
  addText(s, "월간 S&OP", 790, 450, 340, 52, { size: 34, bold: true, color: C.green });
  addText(s, "세일즈 전망과 공급 제약을 함께 검토", 790, 505, 390, 42, { size: 15, color: C.gray });
  addText(s, "초안 v0.2 · 확인된 사실만 사용", 790, 640, 380, 22, { size: 12, color: C.gray });
  setNotes(s, [
    "근거: C:/MyMain/main/resume/career_facts.md C-077~C-087",
    "40개 SKU는 사용자 확인 실무 범위이며 공개 화면은 4개 샘플 SKU입니다.",
  ]);
}

// 2. Context and problem
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 2, "장기 리드타임 상품의 발주 판단 구조", "자료를 모으는 시간보다 늦게 발견되는 재고 위험이 문제였습니다");

  addText(s, "분산된 원천", 72, 155, 270, 34, { size: 20, bold: true, color: C.ink });
  addBox(s, 72, 202, 280, 286, C.light, C.line, 14);
  addText(s, "판매 전망\n\n주차별 판매·출고\n\n창고별 현재고\n\n도착월별 발주계획", 102, 232, 220, 230, { size: 21, color: C.ink });

  addText(s, "기존 작업", 438, 155, 250, 34, { size: 20, bold: true, color: C.ink });
  addBox(s, 420, 202, 320, 286, C.paleOrange, "#F3D29A", 14);
  addText(s, "월 8~9시간", 452, 252, 250, 52, { size: 33, bold: true, color: C.orange, align: "center" });
  addText(s, "자료 취합과 Excel 양식 정리", 452, 319, 250, 52, { size: 19, color: C.ink, align: "center" });
  addText(s, "결품·과재고 위험을\n늦게 확인", 452, 396, 250, 60, { size: 20, bold: true, color: C.red, align: "center" });

  addText(s, "회의에서 함께 보는 제약", 822, 155, 350, 34, { size: 20, bold: true, color: C.ink });
  addBox(s, 812, 202, 370, 286, C.paleBlue, "#BDD2F4", 14);
  addText(s, "6개월 이상 리드타임\n\n3개월 수준의 목표재고\n\n현금흐름과 공급사 MOQ\n\n행사·프로모션 수량", 846, 232, 302, 230, { size: 21, color: C.ink });

  addBox(s, 72, 535, 1110, 95, C.navy, C.navy, 12);
  addText(s, "정리해야 할 것은 데이터뿐 아니라, 누가 어떤 숫자를 언제 확정하는가였습니다.", 105, 560, 1044, 46, { size: 23, bold: true, color: C.white, align: "center", valign: "middle" });
  addFooter(s, 2);
  setNotes(s, [
    "근거: career_facts.md C-070, C-080, C-082~C-084",
    "월 8~9시간은 사용자 확인 수치이며 별도 사용 로그는 확보되지 않았습니다.",
  ]);
}

// 3. Data boundary
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 3, "기준 데이터와 실무자 판단의 경계", "자동 계산과 회의 판단을 분리해 결과를 검산할 수 있도록 설계했습니다");

  addText(s, "시스템이 계산한 항목", 75, 154, 500, 34, { size: 22, bold: true, color: C.blue });
  addBox(s, 72, 200, 525, 366, C.paleBlue, "#BDD2F4", 16);
  const left = [
    ["01", "최근 최대 12주 출고 평균"],
    ["02", "판매·출고 차이 버퍼"],
    ["03", "최신 현재고와 도착월 발주계획"],
    ["04", "24주 예상 재고와 제안 수량"],
  ];
  left.forEach((it, i) => {
    addText(s, it[0], 104, 232 + i * 76, 48, 28, { size: 16, bold: true, color: C.blue });
    addText(s, it[1], 166, 227 + i * 76, 380, 40, { size: 20, color: C.ink });
    if (i < left.length - 1) addRule(s, 104, 284 + i * 76, 448, "#CEDDF5", 1);
  });

  addText(s, "S&OP에서 사람이 결정한 항목", 678, 154, 500, 34, { size: 22, bold: true, color: C.green });
  addBox(s, 675, 200, 535, 366, C.paleGreen, "#B7DFC5", 16);
  const right = [
    ["01", "세일즈 전망과 프로모션 가중치"],
    ["02", "3개월 목표재고와 현금흐름"],
    ["03", "공급사 MOQ와 발주 시점"],
    ["04", "최종 발주 수량과 채널 배분"],
  ];
  right.forEach((it, i) => {
    addText(s, it[0], 708, 232 + i * 76, 48, 28, { size: 16, bold: true, color: C.green });
    addText(s, it[1], 770, 227 + i * 76, 392, 40, { size: 20, color: C.ink });
    if (i < right.length - 1) addRule(s, 708, 284 + i * 76, 456, "#C8E5D2", 1);
  });

  addText(s, "주간 예상수요 = 출고 평균 × 실무자 가중치 + 판매·출고 차이 버퍼", 180, 600, 920, 35, { size: 20, bold: true, color: C.navy, align: "center" });
  addFooter(s, 3, "프로모션·현금흐름·공급사 MOQ는 자동 계산 기능이 아니라 회의 판단 기준입니다");
  setNotes(s, [
    "코드 근거: app/core/forecasting.py:13-105, app/routers/inventory.py:438-568",
    "실무 운영 근거: career_facts.md C-082~C-084",
    "주의: 현재 master의 MOQ 자동 반영은 공급사 MOQ가 아니라 품목 포장입수량입니다.",
  ]);
}

// 4. Product evidence
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 4, "24주 예상 재고와 발주 검토 화면", "시스템 제안과 담당자 확정 수량을 같은 화면에서 비교합니다");
  addText(s, "업무 검증용 재구성 화면 · 4개 샘플 SKU", 542, 132, 660, 24, { size: 12, color: C.gray, align: "right" });

  addText(s, "시스템 제안과\n실무자 확정", 72, 171, 330, 68, { size: 25, bold: true, color: C.ink });
  addText(s, "차이를 수량으로 표시해\n회의에서 조정 근거를 확인", 72, 250, 330, 66, { size: 18, color: C.gray });
  addRule(s, 72, 338, 310, C.line, 1);
  addText(s, "가중치 시뮬레이션", 72, 363, 330, 34, { size: 21, bold: true, color: C.teal });
  addText(s, "프로모션·채널 상황에 따라\n실무자가 수요 가정을 변경", 72, 407, 330, 66, { size: 18, color: C.gray });
  addRule(s, 72, 493, 310, C.line, 1);
  addText(s, "재고주수 히트맵", 72, 518, 330, 34, { size: 21, bold: true, color: C.red });
  addText(s, "결품과 과재고 위험을\n주차별로 먼저 확인", 72, 562, 330, 66, { size: 18, color: C.gray });

  const imageBytes = await fs.readFile(path.join(workspaceDir, "assets", "05_order_plan_demo.png"));
  s.images.add({
    blob: imageBytes,
    contentType: "image/png",
    alt: "발주 계획 시뮬레이션 재구성 화면",
    fit: "contain",
    position: { left: 420, top: 158, width: 790, height: 492 },
    geometry: "roundRect",
    borderRadius: 10,
  });
  addFooter(s, 4, "실제 업무 판단 범위는 40개 SKU이며 공개 화면에는 샘플 데이터를 사용했습니다");
  setNotes(s, [
    "화면: C:/MyMain/Eibe/SCM-Dashboard/portfolio/05_order_plan.png",
    "라벨: 업무 검증용 재구성 화면·샘플 데이터",
    "현재 화면의 대화형 로컬 계산 일부는 4개 샘플 SKU에 묶여 있습니다.",
  ]);
}

// 5. S&OP flow
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 5, "월간 S&OP와 채널 재고 실행", "자료 취합에서 끝내지 않고 발주안·판매 제한·풀필먼트 실행까지 연결했습니다");

  const boxes = [
    { x: 60, t: "세일즈 전망", b: "정해진 양식으로\n판매 전망 취합", c: C.paleBlue, lc: "#BDD2F4" },
    { x: 300, t: "재고 연결", b: "현재고·입고계획을\n24주 흐름으로 연결", c: C.light, lc: C.line },
    { x: 540, t: "공급 제약", b: "리드타임·목표재고\n현금흐름·MOQ 검토", c: C.paleOrange, lc: "#F3D29A" },
    { x: 780, t: "발주안 조정", b: "프로모션 영향과\n판매 제한 수량 조율", c: C.paleGreen, lc: "#B7DFC5" },
    { x: 1020, t: "채널 실행", b: "사입·이관·ASN\n배차와 현장 전달", c: C.paleRed, lc: "#E6BAB3" },
  ];
  const shapes = [];
  boxes.forEach((v) => {
    const box = addBox(s, v.x, 216, 200, 170, v.c, v.lc, 14);
    shapes.push(box);
    addText(s, v.t, v.x + 18, 238, 164, 34, { size: 20, bold: true, color: C.ink, align: "center" });
    addText(s, v.b, v.x + 18, 290, 164, 62, { size: 16, color: C.gray, align: "center" });
  });
  for (let i = 0; i < shapes.length - 1; i++) {
    s.shapes.connect(shapes[i], shapes[i + 1], {
      kind: "straight",
      fromSide: "right",
      toSide: "left",
      line: { style: "solid", fill: C.teal, width: 2 },
      tail: { type: "arrow", width: "med", length: "med" },
    });
  }

  addText(s, "채널 운영 범위", 72, 452, 250, 30, { size: 18, bold: true, color: C.ink });
  addRule(s, 72, 488, 1136, C.line, 1);
  addText(s, "쿠팡·네이버 풀필먼트 사입과 재고 이관", 72, 516, 510, 36, { size: 20, color: C.ink });
  addText(s, "3PL ASN과 물류팀 현장 작업·배차", 670, 516, 510, 36, { size: 20, color: C.ink });
  addText(s, "결품 위험이 높으면 행사 수량을 제한하고, 과재고 위험은 채널 배분과 발주량을 함께 조정했습니다.", 72, 586, 1136, 40, { size: 20, bold: true, color: C.navy, align: "center" });
  addFooter(s, 5);
  setNotes(s, [
    "근거: career_facts.md C-082~C-084",
    "실제 발주 승인권자와 본인의 최종 결정 범위는 사용자 확인 후 보강할 예정입니다.",
  ]);
}

// 6. Adoption and result
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 6, "2개월 미사용에서 월간 검토 기준으로", "기능보다 사용 장면과 판단 순서를 먼저 고쳤습니다");

  const phases = [
    { x: 70, n: "01", t: "초기 구현", b: "예측 결과를 만드는 데\n집중", color: C.blue },
    { x: 355, n: "02", t: "현업 미사용", b: "2개월 동안 월간 업무에\n사용되지 않음", color: C.red },
    { x: 640, n: "03", t: "공동 재설계", b: "세일즈·SCM의 판단 순서에\n맞춰 화면과 로직 수정", color: C.orange },
    { x: 925, n: "04", t: "반복 운영", b: "월간 발주 검토의\n공통 기준으로 사용", color: C.green },
  ];
  phases.forEach((p, i) => {
    addText(s, p.n, p.x, 172, 60, 30, { size: 17, bold: true, color: p.color });
    addText(s, p.t, p.x, 215, 230, 38, { size: 22, bold: true, color: C.ink });
    addText(s, p.b, p.x, 264, 225, 60, { size: 17, color: C.gray });
    if (i < phases.length - 1) addRule(s, p.x + 180, 187, 92, C.line, 2);
  });

  addBox(s, 88, 395, 470, 170, C.paleBlue, "#BDD2F4", 16);
  addText(s, "월 8~9시간", 120, 426, 405, 48, { size: 33, bold: true, color: C.blue, align: "center" });
  addText(s, "자료 취합·Excel 양식 작업 자동화", 120, 494, 405, 36, { size: 19, color: C.ink, align: "center" });

  addBox(s, 722, 395, 470, 170, C.paleRed, "#E6BAB3", 16);
  addText(s, "4개 SKU", 754, 426, 405, 48, { size: 33, bold: true, color: C.red, align: "center" });
  addText(s, "품절 위험을 발주 검토 전에 확인", 754, 494, 405, 36, { size: 19, color: C.ink, align: "center" });

  addText(s, "현재 한계: 예측 정확도·Bias·실제 결품 및 과재고 개선률은 당시 정식 계측하지 못했습니다.", 94, 612, 1092, 38, { size: 17, color: C.gray, align: "center" });
  addFooter(s, 6);
  setNotes(s, [
    "근거: career_facts.md C-080~C-081",
    "월 8~9시간, 4개 SKU, 2개월 미사용은 사용자 확인 사실이며 저장소에 운영 로그는 없습니다.",
  ]);
}

// 7. Extension and limits
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  addHeader(s, 7, "수요예측을 공급망 전체로 연결한 경험", "재고 위험을 수입·풀필먼트·ERP·통관 운영까지 이어서 판단했습니다");

  addText(s, "공급망 위험 대응", 72, 158, 330, 34, { size: 22, bold: true, color: C.red });
  addBox(s, 72, 205, 350, 348, C.paleRed, "#E6BAB3", 15);
  addText(s, "105,000캔", 105, 237, 286, 48, { size: 32, bold: true, color: C.red, align: "center" });
  addText(s, "약 30억 원 규모 리콜", 105, 293, 286, 30, { size: 18, bold: true, color: C.ink, align: "center" });
  addRule(s, 105, 343, 286, "#E6BAB3", 1);
  addText(s, "한국·중국 창고의 증빙과\n감사 입회·폐기·결과보고 절차 정리", 105, 369, 286, 72, { size: 18, color: C.ink, align: "center" });
  addText(s, "본사 보상액 100% 환수에 필요한\n증빙·보고 완성에 기여", 105, 466, 286, 58, { size: 18, bold: true, color: C.red, align: "center" });

  addText(s, "시스템 연결", 472, 158, 330, 34, { size: 22, bold: true, color: C.teal });
  addBox(s, 472, 205, 350, 348, C.paleBlue, "#BDD2F4", 15);
  addText(s, "판매채널", 512, 243, 270, 28, { size: 19, bold: true, color: C.ink, align: "center" });
  addRule(s, 532, 287, 230, C.line, 1);
  addText(s, "사내 ERP", 512, 307, 270, 28, { size: 19, bold: true, color: C.ink, align: "center" });
  addRule(s, 532, 351, 230, C.line, 1);
  addText(s, "WMS·3PL", 512, 371, 270, 28, { size: 19, bold: true, color: C.ink, align: "center" });
  addRule(s, 532, 415, 230, C.line, 1);
  addText(s, "통관 관련 시스템", 512, 435, 270, 28, { size: 19, bold: true, color: C.ink, align: "center" });
  addText(s, "필드·상태·오류·재처리·QA 기준 정의", 504, 492, 286, 38, { size: 15, color: C.gray, align: "center" });

  addText(s, "다음 고도화", 872, 158, 330, 34, { size: 22, bold: true, color: C.green });
  addBox(s, 872, 205, 336, 348, C.paleGreen, "#B7DFC5", 15);
  addText(s, "예측 정확도", 905, 240, 270, 30, { size: 20, bold: true, color: C.ink });
  addText(s, "SKU·채널별 Bias와 WMAPE 계측", 905, 278, 270, 40, { size: 16, color: C.gray });
  addRule(s, 905, 333, 270, "#C8E5D2", 1);
  addText(s, "신제품·프로모션", 905, 354, 270, 30, { size: 20, bold: true, color: C.ink });
  addText(s, "유사 SKU와 행사 증가분 분리", 905, 392, 270, 40, { size: 16, color: C.gray });
  addRule(s, 905, 447, 270, "#C8E5D2", 1);
  addText(s, "AX", 905, 468, 270, 30, { size: 20, bold: true, color: C.ink });
  addText(s, "운영 정확도를 먼저 확보한 뒤 반복 판단을 자동화", 905, 506, 270, 45, { size: 16, color: C.gray });

  addText(s, "SCM 현장에서 검증한 판단 기준을 데이터와 시스템으로 남기는 것이 다음 목표입니다.", 88, 604, 1100, 38, { size: 21, bold: true, color: C.navy, align: "center" });
  addFooter(s, 7, "관세청 연동은 진행 중이며 외부 개발사 구현, 본인은 정책·요건·QA·운영 적용을 담당했습니다");
  setNotes(s, [
    "리콜 근거: career_facts.md C-060~C-062",
    "ERP·통관 근거: career_facts.md C-020~C-029, C-085",
    "관세청 연동은 진행 중이며 외부 개발사 구현 범위를 본인 역할과 분리했습니다.",
  ]);
}

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools", "artifact_tool_utils.mjs"),
).href);

const candidatePath = path.join(buildDir, "candidate_v0.2.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

const result = await finalizePresentation({
  explicitTotalSlideCount: 7,
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
  receiptPath: path.join(buildDir, "portfolio_v0.2.validation.json"),
});

console.log(JSON.stringify({ finalPath, result }, null, 2));

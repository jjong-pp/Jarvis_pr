import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SKILL_DIR = "C:/Users/ParkJongHyeok/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
const workspaceDir = "C:/MyMain/main/resume/비나우/portfolio";
const buildDir = path.join(workspaceDir, ".build_v1.0");
const finalPath = path.join(workspaceDir, "output", "박종혁_비나우_구매수요예측_SCM_포트폴리오_최종_v1.3.pptx");
const screenshotPath = path.join(workspaceDir, "assets", "05_order_plan_demo.png");
const runtimePython = "C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs"),
).href);

const FONT = "Noto Sans KR";
const C = {
  navy: "#172033",
  text: "#263044",
  muted: "#667085",
  line: "#D8DEE9",
  pale: "#F4F7FB",
  blue: "#3468E8",
  bluePale: "#EEF3FF",
  teal: "#0B8A83",
  tealPale: "#EAF7F5",
  orange: "#D76A2E",
  orangePale: "#FFF3EA",
  white: "#FFFFFF",
};

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function addShape(slide, x, y, w, h, fill = "none", lineFill = "none", radius = 0) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: lineFill, width: lineFill === "none" ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function addLine(slide, x, y, w, color = C.line, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addText(slide, text, x, y, w, h, options = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: FONT,
    fontSize: options.size ?? 22,
    bold: options.bold ?? false,
    color: options.color ?? C.text,
    alignment: options.align ?? "left",
    verticalAlignment: options.valign ?? "middle",
    autoFit: options.autoFit ?? "none",
    wrap: "square",
    insets: {
      left: options.inset ?? 0,
      right: options.inset ?? 0,
      top: options.insetY ?? 0,
      bottom: options.insetY ?? 0,
    },
  };
  return box;
}

function addHeader(slide, no, title, subtitle) {
  slide.background.fill = C.white;
  addText(slide, String(no).padStart(2, "0"), 52, 32, 44, 30, { size: 17, bold: true, color: C.blue });
  addText(slide, title, 104, 26, 1080, 54, { size: 35, bold: true, color: C.navy });
  if (subtitle) addText(slide, subtitle, 104, 78, 1080, 31, { size: 18, color: C.muted });
  addLine(slide, 52, 116, 1176, C.line, 1);
}

function addFooter(slide, page, note = "박종혁 | 비나우 구매 수요예측(S&OP)") {
  addLine(slide, 52, 678, 1176, C.line, 1);
  addText(slide, note, 52, 683, 1050, 23, { size: 12, color: C.muted });
  addText(slide, `${page} / 7`, 1145, 683, 83, 23, { size: 12, color: C.muted, align: "right" });
}

function addStage(slide, no, title, body, x, y, w, color = C.blue) {
  addText(slide, no, x, y, 46, 28, { size: 16, bold: true, color });
  addText(slide, title, x + 54, y - 2, w - 54, 32, { size: 22, bold: true, color: C.navy });
  addText(slide, body, x + 54, y + 36, w - 54, 64, { size: 17, color: C.text, valign: "top" });
}

// 1. Cover
{
  const slide = presentation.slides.add();
  slide.background.fill = C.white;
  addShape(slide, 0, 0, 710, 720, C.navy, "none");
  addText(slide, "수요예측·재고·\n발주 운영", 70, 145, 560, 150, { size: 52, bold: true, color: C.white, valign: "top" });
  addText(slide, "직구·내수 40개 SKU의 월별 계획을\n발주·수입·채널 실행으로 연결", 72, 327, 550, 72, { size: 22, color: "#C7D2E7", valign: "top" });
  addText(slide, "박종혁", 70, 548, 200, 42, { size: 24, bold: true, color: C.white });
  addText(slide, "비나우 구매 수요예측(S&OP) 지원", 70, 594, 440, 30, { size: 17, color: "#C7D2E7" });

  addText(slide, "약 400억원", 790, 144, 340, 54, { size: 37, bold: true, color: C.blue });
  addText(slide, "2025년 소비자 매출 기준 사업 규모", 790, 201, 390, 27, { size: 16, color: C.muted });
  addLine(slide, 790, 251, 360, C.line, 1);
  addText(slide, "40개 SKU", 790, 282, 340, 54, { size: 37, bold: true, color: C.teal });
  addText(slide, "실제 수요·재고 판단 범위", 790, 339, 390, 50, { size: 16, color: C.muted, valign: "top" });
  addLine(slide, 790, 412, 360, C.line, 1);
  addText(slide, "24주", 790, 443, 340, 54, { size: 37, bold: true, color: C.orange });
  addText(slide, "현재고와 도착월 입고계획을 연결한 전망", 790, 500, 400, 54, { size: 16, color: C.muted, valign: "top" });
  addText(slide, "영업비밀·식별정보를 일반화한 제출본", 790, 637, 420, 24, { size: 13, color: C.muted });
  slide.speakerNotes.textFrame.setText("약 400억원은 2025년 소비자 매출 기준 담당 사업 규모입니다. 실제 발주금액과 SKU별 수량·단가는 제외했습니다.");
}

// 2. Dual supply chain
{
  const slide = presentation.slides.add();
  addHeader(slide, 2, "직구·내수 이중 공급망", "수요·발주 검토부터 수입통관, 다거점 재고 배분, 배송 예외까지 운영했습니다");

  addText(slide, "직구", 72, 150, 120, 42, { size: 28, bold: true, color: C.blue });
  addText(slide, "중국 전진창고", 194, 154, 260, 34, { size: 17, color: C.muted });
  addLine(slide, 72, 201, 1110, "#A9BDEB", 2);
  const top = [
    ["01", "주문·수요", "자사몰 주문과\n판매 흐름 확인"],
    ["02", "전진창고", "재고·유통기한\n포장 단위 점검"],
    ["03", "통관 정보", "본인확인·거래정보\n오류 보완"],
    ["04", "배송·CS", "출고 통제와\n배송 예외 해결"],
  ];
  top.forEach((d, i) => addStage(slide, d[0], d[1], d[2], 72 + i * 280, 222, 250, C.blue));

  addText(slide, "내수", 72, 373, 120, 42, { size: 28, bold: true, color: C.teal });
  addText(slide, "국내 직수입", 194, 377, 260, 34, { size: 17, color: C.muted });
  addLine(slide, 72, 424, 1110, "#9AD3CE", 2);
  const bottom = [
    ["01", "수량 산출", "전망·현재고·입고예정\n장기 리드타임 검토"],
    ["02", "협의·승인", "SCM·세일즈 리더 협의\n공급사 확정 수량"],
    ["03", "선적·수입", "발주서·Invoice·B/L\n식약처·통관 대응"],
    ["04", "입고·배분", "풀필먼트·오프라인\n입고·이관·정산"],
  ];
  bottom.forEach((d, i) => addStage(slide, d[0], d[1], d[2], 72 + i * 280, 445, 250, C.teal));
  addShape(slide, 72, 582, 1110, 62, C.pale, "none", 10);
  addText(slide, "공통 제약", 94, 597, 130, 30, { size: 17, bold: true, color: C.navy });
  addText(slide, "6개월 이상 리드타임 · 유통기한 · MOQ · 수입자·규제 · 여러 창고의 재고 수불", 226, 594, 920, 36, { size: 18, color: C.text });
  addFooter(slide, 2);
  slide.speakerNotes.textFrame.setText("근거: 사용자 확인 직구·내수 구조, 업무표의 재고·통관·이관·출고·정산 기록. 거래처와 창고명은 영업비밀 보호를 위해 일반화했습니다.");
}

// 3. Monthly S&OP
{
  const slide = presentation.slides.add();
  addHeader(slide, 3, "월별 롤링 S&OP와 발주 실행", "판매 전망·현재고·입고예정을 갱신해 발주안을 만들고 승인 후 공급사·수입 실행까지 관리했습니다");

  addText(slide, "기준 데이터", 72, 150, 260, 34, { size: 21, bold: true, color: C.navy });
  addText(slide, "세일즈 전망\n판매·출고\n현재고·유통기한\n입고예정", 72, 202, 245, 210, { size: 23, color: C.text, valign: "top" });
  addLine(slide, 338, 164, 0, C.line, 1);

  addShape(slide, 375, 158, 480, 350, C.bluePale, "#B8CAFA", 14);
  addText(slide, "발주안 검토", 414, 190, 390, 46, { size: 31, bold: true, color: C.blue, align: "center" });
  addLine(slide, 424, 252, 380, "#B8CAFA", 1);
  addText(slide, "6개월 이상 리드타임", 424, 276, 380, 38, { size: 21, bold: true, color: C.navy, align: "center" });
  addText(slide, "3개월 수준 목표재고", 424, 324, 380, 38, { size: 21, bold: true, color: C.navy, align: "center" });
  addText(slide, "현금흐름과 공급사 MOQ", 424, 372, 380, 38, { size: 21, bold: true, color: C.navy, align: "center" });
  addText(slide, "프로모션·가격 변동", 424, 420, 380, 38, { size: 21, bold: true, color: C.navy, align: "center" });

  addText(slide, "승인 후 실행", 915, 150, 260, 34, { size: 21, bold: true, color: C.navy });
  addText(slide, "공급사 확정 수량\n발주서·Invoice·B/L\n수입·식약처·통관\n입고·채널 배분", 915, 202, 270, 210, { size: 23, color: C.text, valign: "top" });

  addShape(slide, 72, 542, 1110, 92, C.tealPale, "none", 10);
  addText(slide, "본인 역할", 96, 564, 170, 36, { size: 18, bold: true, color: C.teal });
  addText(slide, "SKU별 수량 산출·발주 수량 작성 → SCM·세일즈 팀장 협의·승인 절차 → 공급사 전달 → 수입 서류·입고 수량 관리", 270, 558, 865, 52, { size: 18, color: C.text, valign: "top" });
  addFooter(slide, 3, "프로모션·현금흐름·목표재고·MOQ는 자동값이 아니라 S&OP 판단 조건입니다");
  slide.speakerNotes.textFrame.setText("근거: 사용자 확인 월간 S&OP 운영과 업무표의 가격 인상·행사 쇼트 시뮬레이션, 채널 사입 허용량, 수요회의 기록. 프로모션·현금흐름·공급사 MOQ는 자동 계산이 아니라 회의 판단 항목입니다.");
}

// 4. Dashboard
{
  const slide = presentation.slides.add();
  addHeader(slide, 4, "24주 재고 전망과 발주 제안", "월별 롤링 시트의 실적·재고·입고계획을 연결해 쇼트 시점과 발주 필요량을 확인했습니다");
  addText(slide, "재구성 화면 · 상품명·수량 익명화 · 4개 샘플 SKU", 610, 130, 582, 24, { size: 14, color: C.muted, align: "right" });

  addText(slide, "시스템 제안과\n담당자 확정", 72, 168, 300, 65, { size: 25, bold: true, color: C.navy, valign: "top" });
  addText(slide, "차이를 수량으로 보여줘\n회의에서 조정 근거를 확인", 72, 244, 305, 62, { size: 18, color: C.text, valign: "top" });
  addLine(slide, 72, 330, 300, C.line, 1);
  addText(slide, "운영 계산 창", 72, 351, 300, 35, { size: 22, bold: true, color: C.navy });
  addText(slide, "최근 최대 12주 출고 평균과\n판매·출고 차이 버퍼", 72, 397, 305, 62, { size: 18, color: C.text, valign: "top" });
  addLine(slide, 72, 483, 300, C.line, 1);
  addText(slide, "재고주수 히트맵", 72, 504, 300, 35, { size: 22, bold: true, color: C.navy });
  addText(slide, "결품과 과재고 위험을\n주차별로 먼저 확인", 72, 550, 305, 62, { size: 18, color: C.text, valign: "top" });

  const bytes = await fs.readFile(screenshotPath);
  slide.images.add({
    blob: bytes,
    contentType: "image/png",
    alt: "24주 예상 재고와 발주 검토 재구성 화면",
    fit: "contain",
    position: { left: 412, top: 158, width: 790, height: 500 },
    geometry: "roundRect",
    borderRadius: 12,
  });
  addFooter(slide, 4, "최신 재고 + 도착월 입고계획 + 실무자 가중치 → 24주 예상재고·재고주수·포장입수 단위 제안");
  slide.speakerNotes.textFrame.setText("코드 근거: SCM-Dashboard app/core/forecasting.py 및 inventory 라우터. 현재 공개 화면은 4개 샘플 SKU이며 40개 SKU는 사용자 확인 실무 범위입니다.");
}

// 5. Historical validation
{
  const slide = presentation.slides.add();
  addHeader(slide, 5, "2026년 5~6월 재고 쇼트 위험 재현", "전년도 12개월 데이터로 과거 재고 흐름을 다시 계산해 위험 SKU 4개를 식별했습니다");

  const steps = [
    ["01", "12개월 데이터", "전년도 판매·출고·재고와\n당시 입고계획을 재입력", C.blue],
    ["02", "24주 롤포워드", "운영 계산 로직으로\n주차별 예상재고 재현", C.teal],
    ["03", "위험 4개 SKU", "2026년 5~6월 쇼트\n예상 구간을 경고로 식별", C.orange],
    ["04", "검토 항목", "발주안·판매 제한·\n채널 배분 재검토", "#7B5FC7"],
  ];
  steps.forEach((d, i) => {
    const x = 72 + i * 282;
    addShape(slide, x, 168, 250, 270, C.pale, "none", 14);
    addText(slide, d[0], x + 22, 190, 52, 32, { size: 17, bold: true, color: d[3] });
    addText(slide, d[1], x + 22, 238, 206, 46, { size: 24, bold: true, color: C.navy });
    addLine(slide, x + 22, 298, 206, d[3], 3);
    addText(slide, d[2], x + 22, 326, 206, 86, { size: 18, color: C.text, valign: "top" });
  });

  addShape(slide, 72, 474, 1110, 100, C.bluePale, "none", 10);
  addText(slide, "검증 결과", 96, 501, 150, 36, { size: 19, bold: true, color: C.blue });
  addText(slide, "과거에 늦게 인지했던 위험 구간이 동일하게 나타나는지 확인해 계산 로직과 경고 구조를 검증했습니다.", 246, 493, 880, 52, { size: 20, bold: true, color: C.navy, valign: "top" });
  addText(slide, "공급 예외 운영: 생산중단·입고지연 · 유통기한·파손 · 풀필먼트 사입·이관 · 105,000캔 리콜 대응", 72, 601, 1110, 36, { size: 16, color: C.muted, align: "center" });
  addFooter(slide, 5, "재고 소진 시점의 재현 검증이며 WMAPE·Bias 개선 또는 실제 결품 예방 성과로 표현하지 않습니다");
  slide.speakerNotes.textFrame.setText("전년도 12개월 검증, 2026년 5~6월 위험 구간, 4개 SKU는 사용자 확인 사실입니다. 실제 SKU명과 수량은 비공개이며 공개 화면의 4개 샘플과 연결하지 않습니다.");
}

// 6. Adoption
{
  const slide = presentation.slides.add();
  addHeader(slide, 6, "현업 이관과 월별 운영 정착", "2026년 4월 배포 후 기존 Excel과 약 2개월 병행 검증하고 6월 발주 검토 기준을 전환했습니다");

  addLine(slide, 140, 298, 960, "#B8CAFA", 4);
  const timeline = [
    ["기존", "34개 탭", "월 8~9시간\n취합·양식 작업", 140, C.muted],
    ["2026.04", "시범 배포", "40개 SKU 구조와\n24주 계산 구현", 460, C.blue],
    ["약 2개월", "병행 검증", "기존 Excel과 값 대조\n화면·산식 개선", 780, C.teal],
    ["2026.06", "기준 이관", "월간 발주 검토 기준\n매월 롤링 운영", 1100, C.orange],
  ];
  timeline.forEach((d) => {
    addShape(slide, d[3] - 10, 288, 20, 20, d[4], "none", 10);
    addText(slide, d[0], d[3] - 98, 188, 196, 34, { size: 17, bold: true, color: d[4], align: "center" });
    addText(slide, d[1], d[3] - 110, 230, 220, 40, { size: 24, bold: true, color: C.navy, align: "center" });
    addText(slide, d[2], d[3] - 115, 330, 230, 76, { size: 18, color: C.text, align: "center", valign: "top" });
  });

  addShape(slide, 72, 454, 1110, 110, C.tealPale, "none", 12);
  addText(slide, "운영 성과", 96, 482, 150, 34, { size: 19, bold: true, color: C.teal });
  addText(slide, "월 8~9시간 업무 대시보드 전환", 258, 476, 340, 48, { size: 21, bold: true, color: C.navy });
  addText(slide, "2026년 5~6월 위험 4개 SKU 재현", 614, 476, 500, 48, { size: 23, bold: true, color: C.navy });
  addText(slide, "SCM 계산 기준과 데이터 구조를 직접 정의하고 생성형 AI 코딩 도구로 구현했으며, 기존 Excel의 실제 수치로 검증했습니다.", 96, 592, 1086, 46, { size: 17, color: C.text, align: "center" });
  addFooter(slide, 6, "배포일과 업무 전환일을 분리하고, 병행 검증 후 월별 운영 기준으로 전환했습니다");
  slide.speakerNotes.textFrame.setText("2026년 4월 배포와 병행 기간은 사용자 확인 사실입니다. 코드 저장소 이력은 2026년 6월 이후 개선 기록으로 구분합니다.");
}

// 7. Learning and fit
{
  const slide = presentation.slides.add();
  addHeader(slide, 7, "비나우 수요예측 업무에 적용할 운영 원칙", "월별 수요·공급 판단을 실제 발주와 재고 조치까지 연결하겠습니다");

  addText(slide, "이미 해온 일", 72, 160, 430, 44, { size: 28, bold: true, color: C.navy });
  addLine(slide, 72, 214, 430, C.blue, 3);
  addText(slide, "판매·출고·재고·입고예정의 기준 통합", 72, 242, 440, 40, { size: 20, bold: true, color: C.text });
  addText(slide, "세일즈 전망과 장기 리드타임을 월간 발주안으로 조정", 72, 304, 440, 62, { size: 18, color: C.text, valign: "top" });
  addText(slide, "프로모션·가격 변화에 따른 결품 위험과 채널 재고 실행 관리", 72, 382, 440, 62, { size: 18, color: C.text, valign: "top" });
  addText(slide, "공급사 확정 수량·수입 서류·입고·채널 배분까지 실행", 72, 460, 440, 62, { size: 18, color: C.text, valign: "top" });

  addText(slide, "입사 후 계측·보완할 일", 688, 160, 490, 44, { size: 28, bold: true, color: C.navy });
  addLine(slide, 688, 214, 490, C.teal, 3);
  addText(slide, "신제품·브랜드·채널별 수요 패턴 학습", 688, 242, 490, 40, { size: 20, bold: true, color: C.text });
  addText(slide, "예측 오차와 Bias, 결품·과재고 결과를 SKU와 채널별로 계측", 688, 304, 490, 62, { size: 18, color: C.text, valign: "top" });
  addText(slide, "프로모션 증가분과 기본 수요를 분리해 발주 판단의 근거를 축적", 688, 382, 490, 62, { size: 18, color: C.text, valign: "top" });
  addText(slide, "화장품 운영 특성과 더존 ERP를 익히고 반복 취합·검증을 단계적으로 자동화", 688, 460, 490, 62, { size: 18, color: C.text, valign: "top" });

  addShape(slide, 72, 558, 1106, 76, C.bluePale, "none", 10);
  addText(slide, "운영 원칙", 96, 577, 130, 34, { size: 18, bold: true, color: C.blue });
  addText(slide, "반복 계산은 시스템으로 표준화하되 최종 발주안은 세일즈 전망과 공급 제약을 함께 검토해 확정합니다.", 226, 571, 900, 48, { size: 18, color: C.text, valign: "top" });
  addFooter(slide, 7, "현재 한계는 숨기지 않고, 입사 후 SKU·채널별 예측오차와 Bias부터 기준선을 만들겠습니다");
  slide.speakerNotes.textFrame.setText("비나우 JD의 기준 데이터, S&OP, 프로모션 반영 발주, 결품·과재고 관리에 맞춘 지원 방향입니다. 화장품과 더존 ERP 경험은 없으며 이를 숨기지 않습니다.");
}

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
const stagingDir = path.join(buildDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "candidate_v1.3.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = { basis: "design", families: [FONT] };
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "박종혁_비나우_구매수요예측_SCM_포트폴리오_최종_v1.3.validation.json"),
});

console.log(JSON.stringify({ finalPath, result }, null, 2));

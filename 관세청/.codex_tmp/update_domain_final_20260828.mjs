import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = path.resolve("planning/도메인모음_20260828.xlsx");
const outputDir = path.resolve("outputs/20260828_final");
const outputPath = path.join(outputDir, "도메인모음_20260828.xlsx");
const previewDir = path.resolve(".codex_tmp/domain_final_previews");

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const channels = workbook.worksheets.getItem("Sheet1");
const used = channels.getUsedRange();
if (!used || used.address !== "A1:I12") {
  throw new Error(`예상한 11개 채널 마스터(A1:I12)가 아닙니다: ${used?.address ?? "없음"}`);
}

const channelValues = channels.getRange("A1:I12").values;
for (let row = 1; row < channelValues.length; row += 1) {
  const type = String(channelValues[row][5] ?? "").trim();
  const name = String(channelValues[row][0] ?? "").trim();
  if (type === "A") {
    channelValues[row][8] = "채널 마스터: A/크로네, buyingAgent 미전송. 신고방식은 주문별 별도 판정";
  } else if (name === "네이버") {
    channelValues[row][8] = "채널 마스터: B/아이베. B 자체는 거래정보·OTP 전송 조건이 아님";
  } else {
    channelValues[row][8] = "채널 마스터: B/크로네. B 자체는 거래정보·OTP 전송 조건이 아님";
  }
}
channels.getRange("A1:I12").values = channelValues;
channels.showGridLines = false;
channels.freezePanes.freezeRows(1);
channels.getRange("A1:I12").format.wrapText = true;
channels.getRange("A1:I1").format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
channels.getRange("A2:I12").format.verticalAlignment = "top";
const channelWidths = { A: 16, B: 32, C: 48, D: 15, E: 16, F: 12, G: 18, H: 18, I: 58 };
for (const [col, width] of Object.entries(channelWidths)) {
  channels.getRange(`${col}1:${col}12`).format.columnWidth = width;
}
channels.getRange("1:12").format.autofitRows();

const rules = workbook.worksheets.getItem("전송규칙");
const ruleRows = [
  ["동수 전달용 채널 마스터 및 주문별 신고 분기 (2026-08-28 최종 정정)", null, null, null, null, null],
  [null, null, null, null, null, null],
  ["채널 분기", "판정 조건", "ecTypeCode", "buyingAgentCode", "buyingAgentName", "채널 수"],
  ["자사몰", "ERP 스토어명 또는 채널명=자사몰", "A", "미전송", "미전송", "1"],
  ["네이버스토어", "ERP 스토어명 또는 채널명=네이버", "B", "K26014765", "(주)아이베", "1"],
  ["기타 외부 채널", "Sheet1의 나머지 외부 플랫폼", "B", "K26000099", "(주)크로네", "9"],
  [null, null, null, null, null, null],
  ["구분", "실행 규칙", null, null, null, null],
  ["현재 범위", "총 11개 채널 = 자사몰 1 + 외부 플랫폼 10(네이버 1 + 기타 9). Sheet1 외 채널을 임의 추가하지 않는다.", null, null, null, null],
  ["조회 키", "주문의 ERP 스토어명으로 Sheet1을 정확히 조회한다. 미등록 채널은 임의 기본값을 쓰지 않고 마스터 등록 전까지 차단한다.", null, null, null, null],
  ["필드 역할", "brokerCode/brokerName과 buyingAgentCode/buyingAgentName은 독립 역할이다. 다른 필드에서 변환·복사하지 않는다.", null, null, null, null],
  ["코드 정제", "업체부호는 일반 공백·NBSP 등 Unicode 공백을 제거한 뒤 정확히 9자로 검증한다.", null, null, null, null],
  ["마스터 범위", "이 파일에는 채널별 A/B 및 업체부호만 둔다. 주문자·수하인·PCCC·OTP·주문완료일시는 주문 데이터이며 저장하지 않는다.", null, null, null, null],
  ["신고방식 판정", "ecTypeCode와 별도로 주문별 declarationMode를 판정한다: LEGACY_IMPORT 또는 ECOMMERCE_DEDICATED.", null, null, null, null],
  ["LEGACY_IMPORT", "기존 수입신고. 관세청 담당자 회신상 TRA001 거래정보 제출과 일회용 인증번호가 불필요하다.", null, null, null, null],
  ["ECOMMERCE_DEDICATED", "전자상거래 전용 수입신고. 관세청 규격에 따라 거래정보와 일회용 인증번호를 제출한다.", null, null, null, null],
  ["A/B 적용", "A는 buyingAgent 미전송·판매업체=크로네. B는 채널 마스터의 buyingAgent를 사용하며 실제 해외 판매처명은 확보 가능한 경우 사용한다.", null, null, null, null],
  ["자이언트 P0", "V2-1은 pccCode·tempAuthNo·orderCompletionDate를 필수로 표시한다. 기존 수입신고 주문용 endpoint/flag/조건부 검증을 자이언트가 확정하기 전 자동 전송하지 않는다.", null, null, null, null],
  ["금지", "기존 수입신고 건의 필수검증을 통과하려고 임의 OTP·Z99999·가짜 주문완료일시를 만들지 않는다.", null, null, null, null],
  ["동수 구현", "A/B만으로 API를 선택하지 않는다. 주문별 declarationMode와 자이언트 확정 계약을 함께 적용하고, 미확정 조합은 운영 예외 큐로 보낸다.", null, null, null, null],
];

const oldUsed = rules.getUsedRange();
if (oldUsed) oldUsed.clear({ contents: true, formats: false });
rules.getRange(`A1:F${ruleRows.length}`).values = ruleRows;
rules.showGridLines = false;
rules.freezePanes.freezeRows(3);
rules.getRange(`A1:F${ruleRows.length}`).format.wrapText = true;
rules.getRange("A1:F1").format = { fill: "#1F4E78", font: { bold: true, color: "#FFFFFF", size: 15 } };
rules.getRange("A3:F3").format = { fill: "#D9EAF7", font: { bold: true, color: "#1F1F1F" } };
rules.getRange("A8:F8").format = { fill: "#D9EAF7", font: { bold: true, color: "#1F1F1F" } };
rules.getRange("A15:B16").format = { fill: "#E6F4EA", font: { color: "#174D2A" } };
rules.getRange("A18:B20").format = { fill: "#FCE8E6", font: { color: "#8A1C13" } };
rules.getRange(`A1:A${ruleRows.length}`).format.columnWidth = 24;
rules.getRange(`B1:B${ruleRows.length}`).format.columnWidth = 96;
rules.getRange(`C1:C${ruleRows.length}`).format.columnWidth = 14;
rules.getRange(`D1:D${ruleRows.length}`).format.columnWidth = 20;
rules.getRange(`E1:E${ruleRows.length}`).format.columnWidth = 20;
rules.getRange(`F1:F${ruleRows.length}`).format.columnWidth = 12;
rules.getRange(`1:${ruleRows.length}`).format.autofitRows();

const check = await workbook.inspect({
  kind: "table",
  sheetId: "전송규칙",
  range: `A1:F${ruleRows.length}`,
  include: "values,formulas",
  tableMaxRows: 30,
  tableMaxCols: 6,
  maxChars: 18000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const [sheetName, range] of [["Sheet1", "A1:I12"], ["전송규칙", `A1:F${ruleRows.length}`]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.25, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, channelCount: channelValues.length - 1, ruleRows: ruleRows.length }));

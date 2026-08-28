import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const canonicalPath = "C:/MyMain/관세청/planning/도메인모음.xlsx";
const currentReferencePath = "C:/MyMain/관세청/planning/20260826_ds/도메인모음.xlsx";
const historyPath = "C:/Users/admin/AppData/Local/Temp/codex-domain-history-28d1e88/planning/도메인모음.xlsx";
const outputDir = "C:/MyMain/관세청/outputs/20260828_buying_agent";
const sharePath = `${outputDir}/도메인모음_20260828.xlsx`;
const previewDir = "C:/Users/admin/AppData/Local/Temp/codex-domain-workbook-inspect-20260828";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(canonicalPath));
const currentReference = await SpreadsheetFile.importXlsx(await FileBlob.load(currentReferencePath));
const historical = await SpreadsheetFile.importXlsx(await FileBlob.load(historyPath));

const sheet = workbook.worksheets.getItem("Sheet1");
const currentReferenceSheet = currentReference.worksheets.getItem("Sheet1");
const historicalSheet = historical.worksheets.getItem("Sheet1");
const currentRows = currentReferenceSheet.getRange("A2:E12").values;
const historicalRows = historicalSheet.getRange("A2:C30").values;

const currentByChannel = new Map(
  currentRows.map(([channel, domain, erpStore]) => [String(channel), { domain, erpStore }]),
);

const rows = historicalRows.map(([channelValue, domainValue]) => {
  const channel = String(channelValue).trim();
  const current = currentByChannel.get(channel);
  const domain = String(current?.domain ?? domainValue ?? "").trim();
  const erpStore = current?.erpStore ? String(current.erpStore).trim() : "미확인";
  const ecTypeCode = channel === "자사몰" ? "A" : "B";
  const isNaver = channel === "네이버";
  const code = isNaver ? "K26014765" : "K26000099";
  const name = isNaver ? "(주)아이베" : "(주)크로네";
  const buyingAgentCode = ecTypeCode === "B" ? code : "";
  const buyingAgentName = ecTypeCode === "B" ? name : "";
  const rule = ecTypeCode === "A"
    ? "A유형: buyingAgent 미전송, 동수 개인정보 9개 미전송"
    : isNaver
      ? "B유형 네이버: AIBE buyingAgent, 동수 개인정보 9개 전송"
      : "B유형 기타 외부 채널: KRONE buyingAgent, 동수 개인정보 9개 전송";

  return [
    channel,
    domain,
    erpStore,
    code,
    name,
    ecTypeCode,
    buyingAgentCode,
    buyingAgentName,
    rule,
  ];
});

for (const table of sheet.tables.items) table.delete();
const used = sheet.getUsedRange();
if (used) used.clear({ applyTo: "all" });

sheet.getRange("A1:I30").values = [[
  "채널명",
  "사이트 도메인",
  "ERP 스토어명",
  "brokerCode",
  "brokerName",
  "ecTypeCode",
  "buyingAgentCode",
  "buyingAgentName",
  "적용 규칙",
], ...rows];

sheet.getRange("A1:I1").format = {
  fill: "#D8D8D8",
  font: { bold: true, color: "#111111", name: "Malgun Gothic", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#808080" },
};
sheet.getRange("A2:I30").format = {
  font: { color: "#111111", name: "Malgun Gothic", size: 10 },
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#B7B7B7" },
};
sheet.getRange("A2:A30").format.horizontalAlignment = "center";
sheet.getRange("B2:B30").format = { font: { color: "#0563C1", name: "Malgun Gothic", size: 10 } };
sheet.getRange("D2:H30").format.horizontalAlignment = "center";
sheet.getRange("C2:C30").format.wrapText = true;
sheet.getRange("I2:I30").format.wrapText = true;
rows.forEach((row, index) => {
  if (row[2] !== "미확인") return;
  sheet.getRange(`C${index + 2}`).format = {
    fill: "#FFF2CC",
    font: { color: "#9C6500", italic: true, name: "Malgun Gothic", size: 10 },
    horizontalAlignment: "center",
  };
});
sheet.getRange("A1:A30").format.columnWidth = 16;
sheet.getRange("B1:B30").format.columnWidth = 34;
sheet.getRange("C1:C30").format.columnWidth = 48;
sheet.getRange("D1:D30").format.columnWidth = 15;
sheet.getRange("E1:E30").format.columnWidth = 15;
sheet.getRange("F1:F30").format.columnWidth = 14;
sheet.getRange("G1:G30").format.columnWidth = 19;
sheet.getRange("H1:H30").format.columnWidth = 19;
sheet.getRange("I1:I30").format.columnWidth = 52;
sheet.getRange("1:1").format.rowHeight = 32;
sheet.getRange("2:30").format.rowHeight = 30;
sheet.freezePanes.freezeRows(1);
sheet.showGridLines = false;

const mappingTable = sheet.tables.add("A1:I30", true, "ChannelMappingTable");
mappingTable.style = "TableStyleMedium2";
mappingTable.showFilterButton = true;
mappingTable.showBandedRows = false;

let ruleSheet;
try {
  ruleSheet = workbook.worksheets.getItem("전송규칙");
  const prior = ruleSheet.getUsedRange();
  if (prior) prior.clear({ applyTo: "all" });
  ruleSheet.getRange("A1:F1").unmerge();
} catch {
  ruleSheet = workbook.worksheets.add("전송규칙");
}

ruleSheet.getRange("A1:F1").merge();
ruleSheet.getRange("A1").values = [["동수 GGATE 채널 판정 및 전송 규칙 (2026-08-28)"]];
ruleSheet.getRange("A3:F6").values = [
  ["분기", "판정 조건", "ecTypeCode", "buyingAgentCode", "buyingAgentName", "동수 개인정보 9개"],
  ["자사몰", "ERP 스토어명 또는 채널명=자사몰", "A", "미전송", "미전송", "미전송"],
  ["네이버스토어", "ERP 스토어명 또는 채널명=네이버", "B", "K26014765", "(주)아이베", "전송"],
  ["기타 외부 채널", "자사몰·네이버가 아닌 외부 플랫폼", "B", "K26000099", "(주)크로네", "전송"],
];
ruleSheet.getRange("A8:B13").values = [
  ["구분", "실행 규칙"],
  ["조회 키", "주문의 ERP 스토어명으로 Sheet1을 조회한다. ERP 스토어명 미확인 행은 운영 적용 전에 동수 마스터명과 확정한다."],
  ["필드 역할", "brokerCode/brokerName과 buyingAgentCode/buyingAgentName은 역할이 다른 독립 필드다."],
  ["변환 금지", "buyingAgentCode=ecTypeCode 또는 buyingAgentName=brokerCode 방식으로 변환·복사하지 않는다."],
  ["코드 정제", "모든 업체부호는 앞뒤 공백 없이 9자리 K코드를 사용한다."],
  ["현재 범위", "총 29개 채널. ERP 스토어명 확인 11개, 미확인 18개."],
];
ruleSheet.getRange("A15:B16").values = [
  ["B유형 동수 추가 전송 필드", "ordererName, ordererTel, consigneeName, consigneeNameEng, consigneeAddr, consigneeAddressEng, consigneeZip, consigneeTel, pccCode"],
  ["A유형 차단", "위 개인정보 9개와 buyingAgentCode/buyingAgentName은 전송하지 않는다."],
];

ruleSheet.getRange("A1:F1").format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF", name: "Malgun Gothic", size: 14 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
ruleSheet.getRange("A3:F3").format = {
  fill: "#D9EAF7",
  font: { bold: true, color: "#111111", name: "Malgun Gothic", size: 10 },
  horizontalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#8EA9C1" },
};
ruleSheet.getRange("A4:F6").format = {
  font: { color: "#111111", name: "Malgun Gothic", size: 10 },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#B7B7B7" },
};
ruleSheet.getRange("A8:B8").format = {
  fill: "#D9EAD3",
  font: { bold: true, color: "#111111", name: "Malgun Gothic", size: 10 },
  horizontalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#93C47D" },
};
ruleSheet.getRange("A9:B13").format = {
  font: { color: "#111111", name: "Malgun Gothic", size: 10 },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#B7B7B7" },
};
ruleSheet.getRange("A15:B16").format = {
  fill: "#FFF2CC",
  font: { color: "#111111", name: "Malgun Gothic", size: 10 },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D6B656" },
};
ruleSheet.getRange("A1:A16").format.columnWidth = 28;
ruleSheet.getRange("B1:B16").format.columnWidth = 78;
ruleSheet.getRange("C1:C16").format.columnWidth = 15;
ruleSheet.getRange("D1:D16").format.columnWidth = 19;
ruleSheet.getRange("E1:E16").format.columnWidth = 19;
ruleSheet.getRange("F1:F16").format.columnWidth = 19;
ruleSheet.getRange("1:1").format.rowHeight = 34;
ruleSheet.getRange("3:6").format.rowHeight = 34;
ruleSheet.getRange("8:16").format.rowHeight = 38;
ruleSheet.freezePanes.freezeRows(3);
ruleSheet.showGridLines = false;

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const dataCheck = await workbook.inspect({
  kind: "table",
  sheetId: "Sheet1",
  range: "A1:I30",
  maxChars: 26000,
  tableMaxRows: 35,
  tableMaxCols: 10,
  tableMaxCellChars: 140,
});
console.log("DATA_CHECK");
console.log(dataCheck.ndjson);

const errorCheck = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log("ERROR_CHECK");
console.log(errorCheck.ndjson);

for (const [sheetName, range, fileName] of [
  ["Sheet1", "A1:I30", "updated-domain-main.png"],
  ["전송규칙", "A1:F16", "updated-domain-rules.png"],
]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.2, format: "png" });
  await fs.writeFile(`${previewDir}/${fileName}`, new Uint8Array(await preview.arrayBuffer()));
}

const shareOutput = await SpreadsheetFile.exportXlsx(workbook);
await shareOutput.save(sharePath);
const canonicalOutput = await SpreadsheetFile.exportXlsx(workbook);
await canonicalOutput.save(canonicalPath);

console.log(`SAVED_CANONICAL=${canonicalPath}`);
console.log(`SAVED_SHARE=${sharePath}`);

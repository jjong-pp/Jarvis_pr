import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/MyMain/관세청/outputs/20260828_ds_v21_routing/도메인모음_20260828_V2분기.xlsx";
const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheetSummary = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 4000,
});
console.log("SHEETS");
console.log(sheetSummary.ndjson);

for (const [sheetId, range] of [
  ["Sheet1", "A1:N31"],
  ["전송규칙", "A1:D30"],
  ["V2-1_B필드", "A1:H60"],
]) {
  const inspection = await workbook.inspect({
    kind: "table",
    sheetId,
    range,
    include: "values,formulas",
    tableMaxRows: 65,
    tableMaxCols: 14,
    tableMaxCellChars: 250,
    maxChars: 45000,
  });
  console.log(`TABLE ${sheetId}`);
  console.log(inspection.ndjson);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 4000,
});
console.log("ERRORS");
console.log(errors.ndjson);

const channelRows = workbook.worksheets.getItem("Sheet1").getRange("A2:N30").values;
const counts = channelRows.reduce((acc, row) => {
  acc.total += 1;
  acc[row[5] === "A" ? "a" : row[5] === "B" ? "b" : "other"] += 1;
  if (row[2] === "미확인") acc.erpNameUnconfirmed += 1;
  if (!row[6] && row[5] === "B") acc.bMissingBuyingAgent += 1;
  if (!row[10] || !row[11] || !row[12] || !row[13]) acc.routingBlank += 1;
  return acc;
}, { total: 0, a: 0, b: 0, other: 0, erpNameUnconfirmed: 0, bMissingBuyingAgent: 0, routingBlank: 0 });
console.log("COUNTS");
console.log(JSON.stringify(counts));

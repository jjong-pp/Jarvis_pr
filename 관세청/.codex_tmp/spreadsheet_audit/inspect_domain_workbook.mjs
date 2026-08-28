import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = "C:/MyMain/관세청/planning/도메인모음_20260828.xlsx";
const previewDir = "C:/MyMain/관세청/.codex_tmp/spreadsheet_audit/previews";

await fs.mkdir(previewDir, { recursive: true });
const input = await FileBlob.load(sourcePath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheets = await workbook.inspect({
  kind: "workbook,sheet,table",
  include: "id,name,values,formulas",
  maxChars: 12000,
  tableMaxRows: 25,
  tableMaxCols: 20,
  tableMaxCellChars: 180,
});
console.log("=== SUMMARY ===");
console.log(sheets.ndjson);

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  console.log(`=== SHEET ${sheet.name} USED ${used?.address ?? "unknown"} ===`);
  if (used) {
    const region = await workbook.inspect({
      kind: "region",
      sheetId: sheet.name,
      range: used.address,
      include: "values,formulas",
      maxChars: 18000,
      tableMaxRows: 80,
      tableMaxCols: 30,
      tableMaxCellChars: 220,
    });
    console.log(region.ndjson);
  }
  const preview = await workbook.render({
    sheetName: sheet.name,
    autoCrop: "all",
    scale: 1.5,
    format: "png",
  });
  const safeName = sheet.name.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(`${previewDir}/${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
}

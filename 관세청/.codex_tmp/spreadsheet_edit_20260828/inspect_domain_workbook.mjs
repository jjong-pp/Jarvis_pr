import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = path.resolve(process.argv[2] ?? "planning/20260826_ds/도메인모음-1.xlsx");
const previewDir = path.resolve(".codex_tmp/spreadsheet_edit_20260828/previews_before");
await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 10000,
  tableMaxRows: 40,
  tableMaxCols: 20,
  tableMaxCellChars: 120,
});
console.log(overview.ndjson);

const sheets = workbook.worksheets.items;
for (const sheet of sheets) {
  const used = sheet.getUsedRange();
  console.log(JSON.stringify({ sheet: sheet.name, used: used?.address ?? null }));
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheet.name}.png`), new Uint8Array(await preview.arrayBuffer()));
}

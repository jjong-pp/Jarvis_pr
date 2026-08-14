import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = process.argv[2];
const outputDir = process.argv[3];
const mode = process.argv[4] || "full";
if (!inputPath || !outputDir) throw new Error("Usage: node inspect.mjs <input.xlsx> <outputDir>");

await fs.mkdir(outputDir, { recursive: true });
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

if (mode === "submission") {
  const form = workbook.worksheets.getItem("Form");
  const sample = workbook.worksheets.getItem("Sample");
  console.log("===FORM_HEADERS===");
  console.log(JSON.stringify(form.getRange("A3:BH3").values));
  console.log("===FORM_HEADER_STYLES===");
  const headerStyles = await workbook.inspect({
    kind: "computedStyle",
    sheetId: "Form",
    range: "A3:BH3",
    maxChars: 60000,
    options: { maxResults: 100 },
  });
  const headerValues = form.getRange("A3:BH3").values[0];
  const styleRecords = headerStyles.ndjson.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const columnNumber = (ref) => [...ref.match(/[A-Z]+/)[0]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
  const classified = styleRecords.map((record) => {
    const index = columnNumber(record.for) - 1;
    const fill = record.style?.fill?.color?.value || "";
    return { cell: record.for, header: headerValues[index], fill, requiredColor: fill === "00B0F0" };
  });
  console.log("===HEADER_CLASSIFICATION===");
  console.log(JSON.stringify(classified));
  console.log("===REQUIRED_HEADERS===");
  console.log(JSON.stringify(classified.filter((x) => x.requiredColor).map((x) => x.cell + ":" + x.header)));
  console.log("===OPTIONAL_OR_CONDITIONAL_HEADERS===");
  console.log(JSON.stringify(classified.filter((x) => !x.requiredColor).map((x) => x.cell + ":" + x.header)));
  console.log("===SAMPLE_ROWS===");
  console.log(JSON.stringify(sample.getRange("A3:BH12").values));
  process.exit(0);
}

const overview = await workbook.inspect({
  kind: "workbook,sheet,table,definedName,drawing",
  include: "id,name,range,values,formulas",
  maxChars: 12000,
  tableMaxRows: 8,
  tableMaxCols: 20,
  tableMaxCellChars: 100,
});
console.log("===OVERVIEW===");
console.log(overview.ndjson);

const records = overview.ndjson
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  })
  .filter(Boolean);
const sheetNames = [...new Set(records.filter((r) => r.kind === "sheet" || r.type === "sheet").map((r) => r.name).filter(Boolean))];

for (const sheetName of sheetNames) {
  const region = await workbook.inspect({
    kind: "region,formula,computedStyle",
    sheetId: sheetName,
    maxChars: 20000,
    tableMaxRows: 30,
    tableMaxCols: 40,
    tableMaxCellChars: 160,
    options: { maxResults: 200 },
  });
  console.log(`===SHEET:${sheetName}===`);
  console.log(region.ndjson);

  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  const safeName = sheetName.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(path.join(outputDir, `${safeName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

console.log("===SHEETS===");
console.log(JSON.stringify(sheetNames));

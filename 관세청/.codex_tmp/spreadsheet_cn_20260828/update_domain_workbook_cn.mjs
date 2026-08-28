import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = path.resolve("planning/도메인모음_20260828.xlsx");
const outputDir = path.resolve("outputs/20260828_dongsu_cn");
const outputPath = path.join(outputDir, "도메인모음_20260828.xlsx");
const previewDir = path.resolve(".codex_tmp/spreadsheet_cn_20260828/previews");

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const channels = workbook.worksheets.getItem("Sheet1");
const channelUsed = channels.getUsedRange();
if (!channelUsed || channelUsed.address !== "A1:I12") {
  throw new Error(`Expected exactly 11 channel rows in A1:I12, got ${channelUsed?.address ?? "none"}`);
}

const channelValues = channels.getRange("A1:I12").values;
channelValues[0] = [
  "채널명 / 渠道名",
  "사이트 도메인 / 网站域名",
  "ERP 스토어명 / ERP店铺名",
  "brokerCode",
  "brokerName",
  "ecTypeCode",
  "buyingAgentCode",
  "buyingAgentName",
  "적용 규칙 / 适用规则",
];

for (let row = 1; row < channelValues.length; row += 1) {
  const channelName = String(channelValues[row][0] ?? "").trim();
  const ecTypeCode = String(channelValues[row][5] ?? "").trim();
  if (ecTypeCode === "A") {
    channelValues[row][8] = "채널 마스터 A/크로네, buyingAgent 미전송. 신고방식은 주문별 판정 / 渠道主数据A/KRONE，不发送buyingAgent；申报路径按订单判断";
  } else if (channelName === "네이버") {
    channelValues[row][8] = "채널 마스터 B/아이베. B 자체는 거래정보·OTP 조건이 아님 / 渠道主数据B/iBae；B本身不是交易信息或OTP条件";
  } else {
    channelValues[row][8] = "채널 마스터 B/크로네. B 자체는 거래정보·OTP 조건이 아님 / 渠道主数据B/KRONE；B本身不是交易信息或OTP条件";
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
const channelWidths = { A: 17, B: 32, C: 48, D: 15, E: 16, F: 12, G: 18, H: 18, I: 72 };
for (const [column, width] of Object.entries(channelWidths)) {
  channels.getRange(`${column}1:${column}12`).format.columnWidth = width;
}
channels.getRange("1:12").format.autofitRows();

const rules = workbook.worksheets.getItem("전송규칙");
const ruleRows = [
  ["동수 전달용 채널 마스터 및 주문별 신고 분기 / 东数渠道主数据与逐订单申报分流（2026-08-28最终）", null, null, null, null, null],
  [null, null, null, null, null, null],
  ["채널 분기 / 渠道分组", "판정 조건 / 判断条件", "ecTypeCode", "buyingAgentCode", "buyingAgentName", "채널 수 / 数量"],
  ["자사몰 / 自营商城", "ERP店铺名或渠道名精确匹配自营商城", "A", "不发送", "不发送", "1"],
  ["네이버 / Naver", "ERP店铺名或渠道名精确匹配Naver", "B", "K26014765", "(주)아이베", "1"],
  ["기타 외부 채널 / 其他外部渠道", "Sheet1中其余9个外部平台", "B", "K26000099", "(주)크로네", "9"],
  [null, null, null, null, null, null],
  ["구분 / 分类", "실행 규칙 / 执行规则", null, null, null, null],
  ["범위·조회 / 范围与查询", "总计11个渠道=自营商城1+外部平台10（Naver 1+其他9）。以ERP店铺名精确查询Sheet1；未登记渠道禁止使用默认值，登记前必须阻断。", null, null, null, null],
  ["필드·코드 / 字段与代码", "broker*与buyingAgent*是不同角色，禁止相互转换或复制。发送企业代码前清除普通空格、NBSP等Unicode空白，并验证准确9位。", null, null, null, null],
  ["마스터 범위 / 主数据范围", "本文件只保存渠道A/B及企业代码。订购人、收件人、PCCC、OTP和订单完成时间是逐订单数据，不得保存为渠道固定值。", null, null, null, null],
  ["신고방식 / 申报路径", "ecTypeCode与逐订单declarationMode必须分开判断：LEGACY_IMPORT或ECOMMERCE_DEDICATED。禁止由A/B自动推导。", null, null, null, null],
  ["LEGACY_IMPORT", "传统进口申报。根据韩国海关负责人回复，不提交TRA001交易信息和一次性认证号；正式GGATE legacy endpoint/flag仍为P0待确认。", null, null, null, null],
  ["ECOMMERCE_DEDICATED", "跨境电商专用进口申报。仅在PCCC、正式OTP、订单完成时间及所选endpoint全部必填数据齐全时提交交易信息。", null, null, null, null],
  ["A/B 적용 / A/B应用", "A不发送buyingAgent；B仅在所选endpoint要求时使用渠道主数据中的buyingAgent。B本身不等于V2-1全字段发送。", null, null, null, null],
  ["10:00 수집 / 10:00采集", "按原始订单号批量查询HBL、商品、数量、金额、分类及实际商品页URL。customerOrderNos使用逗号连接字符串；chunk大小配置化。", null, null, null, null],
  ["11:10~11:50", "仅专用申报且本链路负责TRA001：确认全部HBL后提交并检查错误。缺值、结果未确定或删除失败时转MANUAL_CLEARANCE_REQUIRED；传统进口不进入TRA批次。", null, null, null, null],
  ["17:00·18:00", "17:00以/bulk-sync/master按Master发送MAWB；18:00按hwbNo+orderNo查询对账，单次最多500件。请求与响应逐键核对，响应缺失不得视为成功。", null, null, null, null],
  ["자이언트 P0·금지 / GGATE P0与禁止", "V2-1公开规格强制pccCode、tempAuthNo、orderCompletionDate。GGATE确认传统进口endpoint/flag前不得自动发送，也不得伪造OTP、Z99999或订单完成时间。", null, null, null, null],
  ["동수 구현 / 东数实现", "同一hwbNo+orderNo只选择一个已确认路径，禁止跨API版本重复发送。1 HBL=1包装=1 GGATE HWB；未确认组合进入运营例外队列。", null, null, null, null],
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
rules.getRange("A13:B14").format = { fill: "#E6F4EA", font: { color: "#174D2A" } };
rules.getRange("A19:B20").format = { fill: "#FCE8E6", font: { color: "#8A1C13" } };
rules.getRange(`A1:A${ruleRows.length}`).format.columnWidth = 28;
rules.getRange(`B1:B${ruleRows.length}`).format.columnWidth = 105;
rules.getRange(`C1:C${ruleRows.length}`).format.columnWidth = 14;
rules.getRange(`D1:D${ruleRows.length}`).format.columnWidth = 20;
rules.getRange(`E1:E${ruleRows.length}`).format.columnWidth = 20;
rules.getRange(`F1:F${ruleRows.length}`).format.columnWidth = 14;
rules.getRange(`1:${ruleRows.length}`).format.autofitRows();

const workbookCheck = await workbook.inspect({
  kind: "workbook,sheet,table",
  include: "id,name,values,formulas",
  maxChars: 18000,
  tableMaxRows: 25,
  tableMaxCols: 12,
  tableMaxCellChars: 240,
});
console.log("=== WORKBOOK ===");
console.log(workbookCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
});
console.log("=== ERRORS ===");
console.log(errors.ndjson);

for (const [sheetName, range] of [["Sheet1", "A1:I12"], ["전송규칙", `A1:F${ruleRows.length}`]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.4, format: "png" });
  const safeName = sheetName.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(path.join(previewDir, `${safeName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, channelCount: channelValues.length - 1, ruleRows: ruleRows.length }));

import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = path.resolve("outputs/20260828_buying_agent/도메인모음_20260828.xlsx");
const outputDir = path.resolve("outputs/20260828_ds_v21_routing");
const outputPath = path.join(outputDir, "도메인모음_20260828_V2분기.xlsx");
const previewDir = path.resolve(".codex_tmp/spreadsheet_edit_20260828/previews_after");
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const channels = workbook.worksheets.getItem("Sheet1");
const used = channels.getUsedRange();
const rowCount = used.rowCount;
const existing = channels.getRange(`A1:I${rowCount}`).values;

const extraHeaders = ["API 버전", "HWB 등록 엔드포인트", "등록 방식", "개인·통관 데이터 책임", "API 인증"];
channels.getRange("J1:N1").values = [extraHeaders];
const routeRows = [];
for (let r = 1; r < existing.length; r += 1) {
  const ecTypeCode = String(existing[r][5] ?? "").trim();
  if (ecTypeCode === "A") {
    existing[r][8] = "A유형: V2-2 분리등록, buyingAgent 미전송";
    routeRows.push([
      "V2-2 (v2.0.0)",
      "/api/hwb/bulk-sync/logistics",
      "동수 logistics + Geek clearance 병합",
      "동수: 물류·상품 / Geek: 주문자·수하인·PCC·인증번호·주문완료일시",
      "V2-1·V2-2 동일 발급 키",
    ]);
  } else {
    existing[r][8] = "B유형: V2-1 전체등록, Geek 추가 전송 없음";
    routeRows.push([
      "V2-1 (v1.3.7)",
      "/api/hwb/bulk-sync",
      "동수 단일 전체등록(병합 없음)",
      "동수: 주문자·수하인·PCC·인증번호·주문완료일시·물류·상품 전체",
      "V2-1·V2-2 동일 발급 키",
    ]);
  }
  for (const col of [3, 6]) {
    if (typeof existing[r][col] === "string") {
      existing[r][col] = existing[r][col].replace(/^[\s\p{Z}]+|[\s\p{Z}]+$/gu, "");
    }
  }
}
channels.getRange(`A1:I${rowCount}`).values = existing;
channels.getRange(`J2:N${rowCount}`).values = routeRows;

const originalTable = channels.tables.items[0];
const originalName = originalTable.name;
const originalStyle = originalTable.style;
originalTable.delete();
const channelTable = channels.tables.add(`A1:N${rowCount}`, true, originalName);
if (originalStyle) channelTable.style = originalStyle;
channels.freezePanes.freezeRows(1);
channels.showGridLines = false;
channels.getRange(`A1:N${rowCount}`).format.wrapText = true;
channels.getRange(`A1:N1`).format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF" },
  verticalAlignment: "center",
  horizontalAlignment: "center",
};
channels.getRange(`A2:N${rowCount}`).format.verticalAlignment = "top";
const widths = {
  A: 16, B: 30, C: 48, D: 15, E: 16, F: 12, G: 18, H: 18, I: 36,
  J: 17, K: 34, L: 34, M: 58, N: 25,
};
for (const [col, width] of Object.entries(widths)) channels.getRange(`${col}1:${col}${rowCount}`).format.columnWidth = width;
channels.getRange(`1:1`).format.rowHeight = 34;

const rules = workbook.worksheets.getItem("전송규칙");
rules.getRange("A1:F16").values = [
  ["동수 GGATE 채널 판정 및 전송 규칙 (2026-08-28 정정)", null, null, null, null, null],
  [null, null, null, null, null, null],
  ["분기", "판정 조건", "ecTypeCode", "API 버전", "HWB 엔드포인트", "등록 주체 및 방식"],
  ["자사몰", "채널 마스터=자사몰", "A", "V2-2 v2.0.0", "/api/hwb/bulk-sync/logistics", "동수 logistics + Geek clearance 병합"],
  ["외부 플랫폼", "자사몰이 아닌 외부 채널", "B", "V2-1 v1.3.7", "/api/hwb/bulk-sync", "동수 전체등록, Geek 추가 전송 없음"],
  [null, null, null, null, null, null],
  ["구분", "실행 규칙", null, null, null, null],
  ["API 인증", "V2-1과 V2-2는 동일한 발급 API 키를 사용한다. 키 문자열은 문서에 저장하지 않는다.", null, null, null, null],
  ["중복 방지", "동일 hwbNo + orderNo를 V2-1과 V2-2에 동시에 전송하지 않는다.", null, null, null, null],
  ["업체부호 정제", "brokerCode·buyingAgentCode는 일반 공백·NBSP 등 유니코드 공백을 제거한 뒤 정확히 9자로 검증한다.", null, null, null, null],
  ["필드 역할", "brokerCode/brokerName과 buyingAgentCode/buyingAgentName은 서로 다른 역할이며 상호 변환하지 않는다.", null, null, null, null],
  ["B 필수 통관값", "pccCode(13자), tempAuthNo(6자), orderCompletionDate(14자 YYYYMMDDHHmmss)", null, null, null, null],
  ["B 필수 개인정보", "ordererName, consigneeName, consigneeNameEng, consigneeAddr, consigneeAddressEng, consigneeZip, consigneeTel", null, null, null, null],
  ["B 선택 개인정보", "ordererTel, ordererId, consigneeAddrDet", null, null, null, null],
  ["B 업체부호", "buyingAgentCode/buyingAgentName 필수. V2-1 공개 명세상 brokerCode/brokerName은 A 필수이며 B 필수로 표시되지 않는다.", null, null, null, null],
  ["A 전송 차단", "동수 V2-2 logistics에는 orderer*, consignee*, pccCode, tempAuthNo, orderCompletionDate, buyingAgent*를 보내지 않는다.", null, null, null, null],
];
rules.showGridLines = false;
rules.freezePanes.freezeRows(3);
rules.getRange("A1:F16").format.wrapText = true;
rules.getRange("A1:F1").format = { fill: "#1F4E78", font: { bold: true, color: "#FFFFFF", size: 15 } };
rules.getRange("A3:F3").format = { fill: "#D9EAF7", font: { bold: true, color: "#1F1F1F" } };
rules.getRange("A7:F7").format = { fill: "#D9EAF7", font: { bold: true, color: "#1F1F1F" } };
rules.getRange("A1:A16").format.columnWidth = 22;
rules.getRange("B1:B16").format.columnWidth = 76;
rules.getRange("C1:C16").format.columnWidth = 14;
rules.getRange("D1:D16").format.columnWidth = 19;
rules.getRange("E1:E16").format.columnWidth = 38;
rules.getRange("F1:F16").format.columnWidth = 42;
rules.getRange("1:16").format.autofitRows();

const oldFieldSheet = workbook.worksheets.getItemOrNullObject?.("V2-1_B필드");
if (oldFieldSheet && !oldFieldSheet.isNullObject) oldFieldSheet.delete();
const fields = workbook.worksheets.add("V2-1_B필드");
const sourceUrl = "https://documenter.getpostman.com/view/11773234/2sBXqGrh3A";
const fieldRows = [
  ["HWB", "hwbList", "Array", "문서 N(표기 모순)", "HWB 요청 목록", "B 전체등록 시 필수", "문서 설명과 필수 표기가 모순되어 동수는 항상 배열을 전송", sourceUrl],
  ["HWB", "hwbList[].hwbNo", "String", "Y", "Max 20자", "필수", "동수 ERP 채번 HBL", sourceUrl],
  ["HWB", "hwbList[].transportType", "String", "Y", "AI/OI", "필수", "AI 항공, OI 해상", sourceUrl],
  ["HWB", "hwbList[].dispatchCountry", "String", "Y", "2자 ISO", "필수", "발송국", sourceUrl],
  ["HWB", "hwbList[].weight", "BigDecimal", "Y", "소수 3자리", "필수", "총 중량 kg", sourceUrl],
  ["HWB", "hwbList[].packageCount", "Integer", "Y", "1 이상, Max 8자", "필수", "총 외포장 개수", sourceUrl],
  ["HWB", "hwbList[].innerPackageCount", "Integer", "Y", "1 이상, Max 8자", "필수", "총 내포장 개수", sourceUrl],
  ["HWB", "hwbList[].volume", "BigDecimal", "C", "정수 10/소수 3자리", "OI일 때 필수", "해상 용적 CBM; AI는 미전송", sourceUrl],
  ["주문자", "hwbList[].ordererName", "String", "Y", "Max 150자", "필수", "주문자 성명", sourceUrl],
  ["주문자", "hwbList[].ordererTel", "String", "N", "Max 60자", "선택", "주문자 전화번호", sourceUrl],
  ["주문자", "hwbList[].ordererId", "String", "N", "Max 100자", "선택", "주문자 계정 ID", sourceUrl],
  ["운송", "hwbList[].domesticCarrierName", "String", "Y", "Max 100자", "필수", "국내배송업체명", sourceUrl],
  ["수하인", "hwbList[].consigneeName", "String", "Y", "Max 100자", "필수", "수하인 성명", sourceUrl],
  ["수하인", "hwbList[].consigneeNameEng", "String", "Y", "Max 150자", "필수", "수하인 영문 성명", sourceUrl],
  ["수하인", "hwbList[].consigneeAddr", "String", "Y", "Max 150자", "필수", "수하인 기본주소", sourceUrl],
  ["수하인", "hwbList[].consigneeAddrDet", "String", "N", "Max 150자", "선택", "수하인 상세주소", sourceUrl],
  ["수하인", "hwbList[].consigneeAddressEng", "String", "Y", "Max 200자", "필수", "수하인 영문 주소", sourceUrl],
  ["수하인", "hwbList[].consigneeZip", "String", "Y", "5자 고정", "필수", "수하인 우편번호", sourceUrl],
  ["수하인", "hwbList[].consigneeTel", "String", "Y", "Max 40자", "필수", "수하인 전화번호", sourceUrl],
  ["송하인", "hwbList[].shipperName", "String", "Y", "Max 100자", "필수", "송하인 성명", sourceUrl],
  ["송하인", "hwbList[].shipperNameEng", "String", "N", "Max 200자", "선택", "송하인 영문 성명", sourceUrl],
  ["송하인", "hwbList[].shipperAddr", "String", "Y", "Max 150자", "필수", "송하인 주소", sourceUrl],
  ["송하인", "hwbList[].shipperAddressEng", "String", "N", "Max 200자", "선택", "송하인 영문 주소", sourceUrl],
  ["송하인", "hwbList[].shipperTel", "String", "N", "Max 40자", "선택", "송하인 전화번호", sourceUrl],
  ["금액·사이트", "hwbList[].orderSiteUrl", "String", "N", "Max 300자", "선택", "주문사이트 대표 URL", sourceUrl],
  ["금액·사이트", "hwbList[].totalValueUsd", "BigDecimal", "Y", "소수 2자리", "필수", "물품가격 합계 USD", sourceUrl],
  ["유형", "hwbList[].ecTypeCode", "Enum", "Y", "A/B/C", "B 고정", "B=구매대행", sourceUrl],
  ["유형", "hwbList[].buyingAgentCode", "String", "C", "9자 고정", "B 필수", "구매대행업체부호; 채널 마스터 사용", sourceUrl],
  ["유형", "hwbList[].buyingAgentName", "String", "C", "Max 100자", "B 필수", "구매대행업체명; 채널 마스터 사용", sourceUrl],
  ["유형", "hwbList[].deliveryAgentCode", "String", "C", "9자 고정", "B 미전송", "C유형만 필수", sourceUrl],
  ["유형", "hwbList[].deliveryAgentName", "String", "C", "Max 100자", "B 미전송", "C유형만 필수", sourceUrl],
  ["유형", "hwbList[].brokerCode", "String", "C", "9자 고정", "B 선택", "V2-1 공개 명세상 A유형 필수", sourceUrl],
  ["유형", "hwbList[].brokerName", "String", "C", "Max 100자", "B 선택", "V2-1 공개 명세상 A유형 필수", sourceUrl],
  ["주문·통관", "hwbList[].orderNo", "String", "Y", "Max 52자", "필수", "주문번호", sourceUrl],
  ["주문·통관", "hwbList[].orderCompletionDate", "String", "Y", "14자 YYYYMMDDHHmmss", "필수", "주문완료일시", sourceUrl],
  ["주문·통관", "hwbList[].pccCode", "String", "Y", "13자 고정", "필수", "개인통관고유부호", sourceUrl],
  ["주문·통관", "hwbList[].tempAuthNo", "String", "Y", "6자 고정", "필수", "일회용 인증번호", sourceUrl],
  ["기타", "hwbList[].xrayReader1", "String", "N", "Max 100자", "선택", "X-RAY 판독자", sourceUrl],
  ["상품", "hwbList[].items", "Array", "Y", "1~50개", "필수", "상세 상품 리스트", sourceUrl],
  ["상품", "hwbList[].items[].itemGroupOrderNo", "String", "Y", "Max 52자", "필수", "상품그룹 주문번호", sourceUrl],
  ["상품", "hwbList[].items[].itemSeq", "String", "Y", "3자리 숫자", "필수", "001, 002...", sourceUrl],
  ["상품", "hwbList[].items[].categoryName1", "String", "Y", "Max 100자", "필수", "상품 분류 1단계", sourceUrl],
  ["상품", "hwbList[].items[].categoryName2", "String", "Y", "Max 100자", "필수", "상품 분류 2단계", sourceUrl],
  ["상품", "hwbList[].items[].productName", "String", "Y", "Max 200자", "필수", "상품명", sourceUrl],
  ["상품", "hwbList[].items[].productPageUrl", "String", "Y", "Max 3000자", "필수", "실제 상품 판매 페이지 URL", sourceUrl],
  ["상품", "hwbList[].items[].hsCode", "String", "Y", "6자리 숫자", "필수", "상세물품 HS코드", sourceUrl],
  ["상품", "hwbList[].items[].qty", "Integer", "Y", "1 이상", "필수", "수량", sourceUrl],
  ["상품", "hwbList[].items[].qtyUnit", "String", "Y", "Max 3자", "필수", "수량단위", sourceUrl],
  ["상품", "hwbList[].items[].unitPrice", "BigDecimal", "Y", "소수 3자리", "필수", "상품단가 USD", sourceUrl],
  ["상품", "hwbList[].items[].itemAmount", "BigDecimal", "Y", "0.00 이상", "필수", "상세물품 금액 USD", sourceUrl],
  ["상품", "hwbList[].items[].sellerName", "String", "Y", "Max 300자", "필수", "판매업체명", sourceUrl],
  ["상품", "hwbList[].items[].sellerCode", "String", "C", "Max 9자", "B 선택", "V2-1 공개 명세상 A 조건부", sourceUrl],
  ["상품", "hwbList[].items[].sellerId", "String", "N", "Max 30자", "선택", "판매업체 ID", sourceUrl],
  ["상품", "hwbList[].items[].brandName", "String", "N", "Max 100자", "선택", "브랜드명", sourceUrl],
];
fields.getRange("A1:H1").values = [["구분", "JSON 경로", "타입", "V2-1 명세 필수", "제약", "동수 B 전송", "설명", "출처"]];
fields.getRange(`A2:H${fieldRows.length + 1}`).values = fieldRows;
const fieldTable = fields.tables.add(`A1:H${fieldRows.length + 1}`, true, "V21BFieldTable");
fieldTable.style = "TableStyleMedium2";
fields.showGridLines = false;
fields.freezePanes.freezeRows(1);
fields.getRange(`A1:H${fieldRows.length + 1}`).format.wrapText = true;
fields.getRange("A1:H1").format = { fill: "#1F4E78", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };
fields.getRange(`A1:A${fieldRows.length + 1}`).format.columnWidth = 16;
fields.getRange(`B1:B${fieldRows.length + 1}`).format.columnWidth = 48;
fields.getRange(`C1:C${fieldRows.length + 1}`).format.columnWidth = 15;
fields.getRange(`D1:D${fieldRows.length + 1}`).format.columnWidth = 18;
fields.getRange(`E1:E${fieldRows.length + 1}`).format.columnWidth = 28;
fields.getRange(`F1:F${fieldRows.length + 1}`).format.columnWidth = 18;
fields.getRange(`G1:G${fieldRows.length + 1}`).format.columnWidth = 48;
fields.getRange(`H1:H${fieldRows.length + 1}`).format.columnWidth = 48;
fields.getRange(`1:${fieldRows.length + 1}`).format.autofitRows();

const channelCheck = await workbook.inspect({ kind: "table", sheetId: "Sheet1", range: `A1:N${rowCount}`, include: "values,formulas", tableMaxRows: 35, tableMaxCols: 14, maxChars: 18000 });
console.log(channelCheck.ndjson);
const fieldCheck = await workbook.inspect({ kind: "table", sheetId: "V2-1_B필드", range: `A1:H${fieldRows.length + 1}`, include: "values,formulas", tableMaxRows: 60, tableMaxCols: 8, maxChars: 22000 });
console.log(fieldCheck.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
console.log(errors.ndjson);

for (const [sheetName, range] of [["Sheet1", `A1:N${rowCount}`], ["전송규칙", "A1:F16"], ["V2-1_B필드", `A1:H${fieldRows.length + 1}`]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, rowCount, fieldCount: fieldRows.length }));

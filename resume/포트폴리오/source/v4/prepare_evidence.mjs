import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import sharp from "file:///C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";

const portfolioDir = "C:/MyMain/main/resume/포트폴리오";
const customsOut = path.join(portfolioDir, "evidence", "customs", "submission_safe");
const b2bOut = path.join(portfolioDir, "evidence", "b2b", "submission_safe");
await fs.mkdir(customsOut, { recursive: true });
await fs.mkdir(b2bOut, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 2,
});

// 관세청 필드 매핑 원본에서 포장·병합·재전송·검증 규칙만 남긴 제출용 발췌.
{
  const page = await context.newPage();
  const source = "C:/MyMain/main/관세청/planning/과거/api_field_mapping.html";
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => {
    const heading = document.querySelector("#giant-development-request");
    const table = heading?.nextElementSibling;
    if (!(heading instanceof HTMLElement) || !(table instanceof HTMLTableElement)) {
      throw new Error("관세청 필드 매핑 표를 찾지 못했습니다.");
    }
    const keep = new Set(["대상", "병합키", "저장·재전송", "최종검증"]);
    for (const row of [...table.querySelectorAll("tbody tr")]) {
      const label = row.querySelector("td")?.textContent?.trim() ?? "";
      if (!keep.has(label)) row.remove();
    }
    const wrapper = document.createElement("section");
    wrapper.id = "capture";
    wrapper.append(heading.cloneNode(true), table.cloneNode(true));
    document.body.replaceChildren(wrapper);
    document.body.innerHTML = document.body.innerHTML
      .replaceAll("자이언트", "통관대행 시스템")
      .replaceAll("Geek", "자사몰 개발사")
      .replaceAll("동수", "ERP 개발사");
  });
  await page.addStyleTag({ content: `
    html, body { margin: 0; padding: 0; background: #fff; }
    #capture { box-sizing: border-box; width: 1380px; padding: 32px 38px 38px; font-family: "Malgun Gothic", sans-serif; }
    #capture h2 { margin: 0 0 18px !important; font-size: 28px !important; color: #1b4f9c !important; border-color: #1b4f9c !important; }
    #capture table { width: 100% !important; table-layout: fixed; border-collapse: collapse; font-size: 17px !important; line-height: 1.45; }
    #capture th, #capture td { padding: 13px 14px !important; border: 1px solid #cfd8e6 !important; color: #1a1a1a !important; background: #fff !important; }
    #capture th { background: #e9f1fc !important; color: #16437f !important; font-weight: 700; }
    #capture td:first-child { width: 14%; font-weight: 700; color: #16437f !important; }
    #capture th:nth-child(3), #capture td:nth-child(3) { width: 31%; }
    #capture code { font-family: Consolas, monospace; font-size: 0.92em; color: #16437f; background: #f1f6fc; padding: 1px 4px; border-radius: 3px; }
  ` });
  await page.locator("#capture").screenshot({ path: path.join(customsOut, "field_mapping_excerpt.png") });
  await page.close();
}

// 산후조리원몰 과업 처리 결과 원본에서 4계정 정책 매트릭스만 발췌.
{
  const page = await context.newPage();
  const source = "C:/MyMain/main/산후조리원/산후조리원몰_과업내역_처리결과.html";
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => {
    const table = [...document.querySelectorAll("table")].find((node) => {
      const text = node.textContent ?? "";
      return text.includes("회원 등급") && text.includes("카테고리 미지정") && text.includes("물품계약(선불)");
    });
    if (!(table instanceof HTMLTableElement)) throw new Error("4계정 정책 표를 찾지 못했습니다.");
    const wrapper = document.createElement("section");
    wrapper.id = "capture";
    const title = document.createElement("h2");
    title.textContent = "회원 등급별 상품·결제 정책";
    wrapper.append(title, table.cloneNode(true));
    document.body.replaceChildren(wrapper);
  });
  await page.addStyleTag({ content: `
    html, body { margin: 0; padding: 0; background: #fff; }
    #capture { box-sizing: border-box; width: 1180px; padding: 30px 34px 34px; font-family: "Malgun Gothic", sans-serif; }
    #capture h2 { margin: 0 0 18px; font-size: 28px; color: #17563a; }
    #capture table { width: 100% !important; border-collapse: collapse; table-layout: fixed; font-size: 18px !important; line-height: 1.4; }
    #capture th, #capture td { padding: 14px 16px !important; border: 1px solid #cde2d6 !important; text-align: center; color: #1a1a1a !important; }
    #capture th { background: #e8f5ee !important; color: #17563a !important; font-weight: 700; }
    #capture td:first-child { text-align: left; font-weight: 700; }
  ` });
  await page.locator("#capture").screenshot({ path: path.join(b2bOut, "account_policy_matrix.png") });
  await page.close();
}

await browser.close();

const fieldMapPath = path.join(customsOut, "field_mapping_excerpt.png");
await sharp(fieldMapPath)
  .extract({ left: 0, top: 150, width: 2760, height: 460 })
  .png()
  .toFile(path.join(customsOut, "field_mapping_unit.png"));

await sharp(fieldMapPath)
  .extract({ left: 0, top: 650, width: 2760, height: 390 })
  .png()
  .toFile(path.join(customsOut, "field_mapping_recovery.png"));

// 원본 전체가 PPTX에 포함되지 않도록 개인정보·가격이 없는 영역만 파일로 잘라 저장.
const rawDir = path.join(portfolioDir, "evidence", "b2b", "raw_private");
await sharp(path.join(rawDir, "스크린샷 2026-08-28 035207.png"))
  .extract({ left: 475, top: 140, width: 1585, height: 420 })
  .png()
  .toFile(path.join(b2bOut, "home_feature_banner.png"));

await sharp(path.join(rawDir, "스크린샷 2026-08-28 035223.png"))
  .extract({ left: 760, top: 300, width: 1220, height: 250 })
  .composite([{ input: Buffer.from(`
    <svg width="1220" height="250" xmlns="http://www.w3.org/2000/svg">
      <circle cx="258" cy="207" r="30" fill="#c8c8c8"/>
      <circle cx="367" cy="207" r="30" fill="#c8c8c8"/>
      <circle cx="478" cy="207" r="30" fill="#c8c8c8"/>
      <circle cx="567" cy="207" r="30" fill="#c8c8c8"/>
      <circle cx="666" cy="207" r="30" fill="#c8c8c8"/>
      <circle cx="776" cy="207" r="30" fill="#686868"/>
      <rect x="1135" y="118" width="85" height="132" fill="#ffffff"/>
    </svg>
  `) }])
  .png()
  .toFile(path.join(b2bOut, "mypage_order_status.png"));

await sharp(path.join(rawDir, "스크린샷 2026-08-28 035223.png"))
  .extract({ left: 480, top: 175, width: 275, height: 530 })
  .png()
  .toFile(path.join(b2bOut, "mypage_menu.png"));

console.log(JSON.stringify({ customsOut, b2bOut }, null, 2));

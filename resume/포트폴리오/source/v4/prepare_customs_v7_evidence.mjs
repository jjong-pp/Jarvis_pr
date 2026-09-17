import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const source = "C:/MyMain/관세청/planning/planning_v7.html";
const outDir = "C:/MyMain/resume/포트폴리오/evidence/customs/submission_safe";
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 2,
});

async function captureIdentifierTable() {
  const page = await context.newPage();
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => {
    const section = document.querySelector("#data");
    const heading = [...(section?.querySelectorAll("h3") ?? [])].find((node) =>
      (node.textContent ?? "").includes("공통 식별자"),
    );
    const table = heading?.nextElementSibling?.querySelector("table");
    if (!(table instanceof HTMLTableElement)) throw new Error("공통 식별자 표를 찾지 못했습니다.");
    const wrapper = document.createElement("section");
    wrapper.id = "capture";
    const title = document.createElement("h2");
    title.textContent = "현재 식별자 계약";
    wrapper.append(title, table.cloneNode(true));
    document.body.replaceChildren(wrapper);
    document.body.innerHTML = document.body.innerHTML
      .replaceAll("Geek", "자사몰 개발사")
      .replaceAll("동수", "ERP 개발사")
      .replaceAll("GNG", "통관대행 시스템");
  });
  await page.addStyleTag({ content: `
    html, body { margin: 0; padding: 0; background: #fff; }
    #capture { box-sizing: border-box; width: 1460px; padding: 32px 38px 38px; font-family: "Malgun Gothic", sans-serif; }
    #capture h2 { margin: 0 0 18px; font-size: 30px; color: #1b4f9c; border-bottom: 3px solid #1b4f9c; padding-bottom: 13px; }
    #capture table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 17px; line-height: 1.4; }
    #capture th, #capture td { padding: 13px 14px; border: 1px solid #cfd8e6; color: #1a1a1a; background: #fff; }
    #capture th { background: #e9f1fc; color: #16437f; font-weight: 700; }
    #capture th:nth-child(1), #capture td:nth-child(1) { width: 15%; font-weight: 700; color: #16437f; }
    #capture th:nth-child(2), #capture td:nth-child(2) { width: 27%; }
    #capture th:nth-child(3), #capture td:nth-child(3) { width: 28%; }
    #capture code { font-family: Consolas, monospace; font-size: .92em; color: #16437f; background: #f1f6fc; padding: 1px 4px; border-radius: 3px; }
  ` });
  await page.locator("#capture").screenshot({ path: path.join(outDir, "current_identifier_contract.png") });
  await page.close();
}

async function captureStateAndRetry() {
  const page = await context.newPage();
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll("h3")].find((node) =>
      (node.textContent ?? "").includes("상태와 재시도"),
    );
    const list = heading?.nextElementSibling;
    if (!(heading instanceof HTMLElement) || !(list instanceof HTMLUListElement)) {
      throw new Error("상태와 재시도 절을 찾지 못했습니다.");
    }
    const wrapper = document.createElement("section");
    wrapper.id = "capture";
    const title = document.createElement("h2");
    title.textContent = "현재 상태와 재시도 기준";
    wrapper.append(title, list.cloneNode(true));
    document.body.replaceChildren(wrapper);
    document.body.innerHTML = document.body.innerHTML
      .replaceAll("KCS", "관세청")
      .replaceAll("GGATE", "통관대행 시스템");
  });
  await page.addStyleTag({ content: `
    html, body { margin: 0; padding: 0; background: #fff; }
    #capture { box-sizing: border-box; width: 1460px; padding: 32px 40px 38px; font-family: "Malgun Gothic", sans-serif; }
    #capture h2 { margin: 0 0 22px; font-size: 30px; color: #1b4f9c; border-bottom: 3px solid #1b4f9c; padding-bottom: 13px; }
    #capture ul { margin: 0; padding-left: 34px; font-size: 19px; line-height: 1.55; color: #1a1a1a; }
    #capture li { margin: 10px 0; padding-left: 5px; }
    #capture code { font-family: Consolas, monospace; font-size: .92em; color: #16437f; background: #f1f6fc; padding: 1px 4px; border-radius: 3px; }
  ` });
  await page.locator("#capture").screenshot({ path: path.join(outDir, "current_state_retry.png") });
  await page.close();
}

await captureIdentifierTable();
await captureStateAndRetry();
await browser.close();

console.log(JSON.stringify({ source, outDir }, null, 2));

import puppeteer from "puppeteer";

export async function fetchOfficialStock() {
  const url = process.env.OFFICIAL_PRODUCT_URL;
  if (!url) {
    return { inStock: false, status: "missing OFFICIAL_PRODUCT_URL" };
  }

  const browser = await puppeteer.launch({
    headless: "new"
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const statusText = await page
      .$eval("[data-stock-status]", (el) => el.textContent?.trim() || "unknown")
      .catch(() => "unknown");

    const inStock = /in stock|available/i.test(statusText);

    return { inStock, status: statusText };
  } finally {
    await browser.close();
  }
}

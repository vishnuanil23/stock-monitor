import puppeteer from "puppeteer";

export async function checkStore(watchName) {
  if (!watchName || !String(watchName).trim()) {
    return { found: false, inStock: false, link: null };
  }

  const query = encodeURIComponent(String(watchName).trim());
  const url = `https://www.hmtwatches.store/?s=${query}`;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const products = await page.$$eval(".product", (elements) =>
      elements.map((el) => ({
        title: el.querySelector("h2")?.innerText || "",
        text: el.innerText,
        link: el.querySelector("a")?.href || null,
      }))
    );

    let found = false;
    let inStock = false;
    let link = null;

    for (const product of products) {
      console.log("Product title:", product.title);
      if (product.title.toLowerCase().includes(watchName.toLowerCase())) {
        found = true;
        link = product.link;

        if (!product.text.toLowerCase().includes("out of stock")) {
          inStock = true;
        }
        break;
      }
    }

    const result = { found, inStock, link };

    return result;
  } catch {
    return { found: false, inStock: false, link: null };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore close errors
      }
    }
  }
}

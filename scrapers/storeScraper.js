const puppeteer = require("puppeteer");

async function storeScraper(watchName) {
  if (!watchName || !String(watchName).trim()) {
    return { found: false, inStock: false, link: null };
  }

  const query = encodeURIComponent(String(watchName).trim());
  const url = `https://www.hmtwatches.store/?s=${query}`;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const result = await page.evaluate((needle) => {
      const norm = (s) => (s || "").toLowerCase();
      const want = norm(needle);

      const productNodes = Array.from(
        document.querySelectorAll("li.product, .product")
      );

      const getTitle = (el) => {
        const titleEl =
          el.querySelector(
            ".woocommerce-loop-product__title, h2.woocommerce-loop-product__title, .product-title, h2, h3"
          ) || el;
        return (titleEl.textContent || "").trim();
      };

      const getLink = (el) => {
        const linkEl =
          el.querySelector("a.woocommerce-LoopProduct-link") ||
          el.querySelector("a[href]");
        return linkEl ? linkEl.href : null;
      };

      const getStockText = (el) => {
        const stockEl =
          el.querySelector(".stock") ||
          el.querySelector(".stock-status") ||
          el.querySelector(".out-of-stock") ||
          el.querySelector(".in-stock");
        return stockEl ? (stockEl.textContent || "").trim() : "";
      };

      for (const el of productNodes) {
        const title = getTitle(el);
        if (!title) continue;
        if (!norm(title).includes(want)) continue;

        const stockText = getStockText(el);
        const classText = el.className || "";
        const outByText = norm(stockText).includes("out of stock");
        const outByClass = /outofstock|out-of-stock/i.test(classText);
        const inStock = !(outByText || outByClass);

        return {
          found: true,
          inStock,
          link: getLink(el),
        };
      }

      return { found: false, inStock: false, link: null };
    }, watchName);

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

module.exports = storeScraper;

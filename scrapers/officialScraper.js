import axios from "axios";
import cheerio from "cheerio";

export default async function officialScraper(watchName) {
  if (!watchName || !String(watchName).trim()) {
    return { found: false, inStock: false, link: null };
  }

  const query = encodeURIComponent(String(watchName).trim());
  const url = `https://www.hmtwatches.in/?s=${query}`;

  try {
    const res = await axios.get(url, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const $ = cheerio.load(res.data);
    const needle = String(watchName).toLowerCase();

    const cards = $("li.product, .product").toArray();

    for (const el of cards) {
      const $el = $(el);
      const title = $el
        .find(
          ".woocommerce-loop-product__title, h2.woocommerce-loop-product__title, .product-title, h2, h3"
        )
        .first()
        .text()
        .trim();

      if (!title) continue;
      if (!title.toLowerCase().includes(needle)) continue;

      const link =
        $el
          .find("a.woocommerce-LoopProduct-link, a[href]")
          .first()
          .attr("href") || null;

      const stockText = $el
        .find(".stock, .stock-status, .out-of-stock, .in-stock")
        .first()
        .text()
        .trim();

      const classText = $el.attr("class") || "";
      const outByText = stockText.toLowerCase().includes("out of stock");
      const outByClass = /outofstock|out-of-stock/i.test(classText);
      const inStock = !(outByText || outByClass);

      return { found: true, inStock, link };
    }

    return { found: false, inStock: false, link: null };
  } catch {
    return { found: false, inStock: false, link: null };
  }
}

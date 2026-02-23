import axios from "axios";
import * as cheerio from "cheerio";

export async function checkOfficial(watchName) {
  try {
    const searchUrl = `https://www.hmtwatches.in/?s=${encodeURIComponent(watchName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      }
    });

    const $ = cheerio.load(data);

    let found = false;
    let inStock = false;
    let link = null;

    $(".product").each((_, el) => {
      const title = $(el).find("h2").text().trim().toLowerCase();
      console.log("Product title:", title);

      if (title.includes(watchName.toLowerCase())) {
        found = true;
        link = $(el).find("a").attr("href");

        const text = $(el).text().toLowerCase();
        if (!text.includes("out of stock")) {
          inStock = true;
        }
      }
    });

    return { found, inStock, link };

  } catch (err) {
    console.error("Official scraper error:", err.message);
    return { found: false, inStock: false, link: null };
  }
}

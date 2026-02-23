import axios from "axios";
import cheerio from "cheerio";

export async function fetchStoreStock() {
  const url = process.env.STORE_PRODUCT_URL;
  if (!url) {
    return { inStock: false, status: "missing STORE_PRODUCT_URL" };
  }

  const response = await axios.get(url, {
    headers: { "User-Agent": "stock-monitor/1.0" }
  });
  const $ = cheerio.load(response.data);

  const statusText = $("[data-stock-status]").text().trim() || "unknown";
  const inStock = /in stock|available/i.test(statusText);

  return { inStock, status: statusText };
}

import puppeteer from "puppeteer";

export async function checkSearch(searchTerm) {
    let browser;

    try {
        const encoded = encodeURIComponent(searchTerm);

        const urls = [
            `https://www.hmtwatches.store/search/${encoded}`,
            `https://www.hmtwatches.in/search_products?keys=${encoded}`
        ];

        browser = await puppeteer.launch({
            headless: "new",
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
        });

        const page = await browser.newPage();

        const results = [];

        for (const url of urls) {
            try {
                await page.goto(url, {
                    waitUntil: "networkidle2",
                    timeout: 60000
                });

                await page.waitForSelector("body");

                const pageText = await page.evaluate(() =>
                    document.body.innerText.toLowerCase()
                );

                console.log(`Checking URL: ${url}`);

                let inStock = true;
                if (pageText.includes("no data") || pageText.includes("0 results")) {
                    console.log("No products found.");
                    inStock = false;
                } else {
                    console.log("Products detected.");
                }

                results.push({ url, inStock });
            } catch (siteErr) {
                console.error(`Error checking ${url}:`, siteErr.message);
                results.push({ url, inStock: false, error: siteErr.message });
            }
        }

        await browser.close();

        return {
            inStock: results.some(r => r.inStock),
            results
        };

    } catch (err) {
        if (browser) await browser.close();
        console.error("Search scraper error:", err.message);
        return {
            inStock: false,
            results: [
                { url: `https://www.hmtwatches.store/search/${encodeURIComponent(searchTerm)}`, inStock: false },
                { url: `https://www.hmtwatches.in/search_products?keys=${encodeURIComponent(searchTerm)}`, inStock: false }
            ]
        };
    }
}

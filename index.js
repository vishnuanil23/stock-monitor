import dotenv from "dotenv";
import cron from "node-cron";
import storeScraper from "./scrapers/storeScraper.js";
import officialScraper from "./scrapers/officialScraper.js";
import { getState, updateState } from "./utils/stateManager.js";
import { sendNotification } from "./notifier/telegram.js";

dotenv.config();

const WATCH_NAME = process.env.WATCH_NAME;
if (!WATCH_NAME) {
  console.error("Missing WATCH_NAME env var");
  process.exit(1);
}

const intervalMinutes = Number(process.env.CHECK_INTERVAL_MINUTES || 5);
const schedule =
  Number.isFinite(intervalMinutes) && intervalMinutes > 0
    ? `*/${intervalMinutes} * * * *`
    : "*/5 * * * *";

function toStatus(inStock) {
  return inStock ? "IN" : "OUT";
}

async function runCheck() {
  const state = await getState();
  const watchKey = WATCH_NAME;

  const storeResult = await storeScraper(watchKey);
  const storeStatus = toStatus(storeResult.inStock);
  console.log(`[STORE] Status: ${storeStatus}`);

  const officialResult = await officialScraper(watchKey);
  const officialStatus = toStatus(officialResult.inStock);
  console.log(`[OFFICIAL] Status: ${officialStatus}`);

  const prevStore = state?.[watchKey]?.store ?? "OUT";
  const prevOfficial = state?.[watchKey]?.official ?? "OUT";

  if (prevStore === "OUT" && storeStatus === "IN") {
    await sendNotification(
      `[${watchKey}] Store stock is IN: ${storeResult.link || "link unavailable"}`
    );
  }

  if (prevOfficial === "OUT" && officialStatus === "IN") {
    await sendNotification(
      `[${watchKey}] Official stock is IN: ${officialResult.link || "link unavailable"}`
    );
  }

  await updateState(watchKey, "store", storeStatus);
  await updateState(watchKey, "official", officialStatus);
}

cron.schedule(schedule, () => {
  runCheck().catch((err) => {
    console.error("Stock check failed:", err);
  });
});

runCheck().catch((err) => {
  console.error("Initial stock check failed:", err);
});

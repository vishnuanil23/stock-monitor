import dotenv from "dotenv";
import cron from "node-cron";
import { fetchStoreStock } from "./scrapers/storeScraper.js";
import { fetchOfficialStock } from "./scrapers/officialScraper.js";
import { loadState, saveState } from "./utils/stateManager.js";
import { sendTelegramMessage } from "./notifier/telegram.js";

dotenv.config();

const REQUIRED_ENV = ["BOT_TOKEN", "CHAT_ID", "WATCH_NAME", "CHECK_INTERVAL_MINUTES"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const intervalMinutes = Number(process.env.CHECK_INTERVAL_MINUTES);
if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
  console.error("CHECK_INTERVAL_MINUTES must be a positive number");
  process.exit(1);
}

const CHECK_SCHEDULE = `*/${intervalMinutes} * * * *`;
const WATCH_NAME = process.env.WATCH_NAME;

async function runCheck() {
  const state = loadState();

  const [storeData, officialData] = await Promise.all([
    fetchStoreStock(),
    fetchOfficialStock()
  ]);

  const nextState = {
    ...state,
    lastRunAt: new Date().toISOString(),
    store: storeData,
    official: officialData
  };

  saveState(nextState);

  if (storeData?.inStock || officialData?.inStock) {
    await sendTelegramMessage(
      `[${WATCH_NAME}] Stock update:\nStore: ${storeData?.status || "unknown"}\nOfficial: ${officialData?.status || "unknown"}`
    );
  }
}

cron.schedule(CHECK_SCHEDULE, () => {
  runCheck().catch((err) => {
    console.error("Stock check failed:", err);
  });
});

// Run once on startup
runCheck().catch((err) => {
  console.error("Initial stock check failed:", err);
});

import dotenv from "dotenv";
import cron from "node-cron";
import { checkSearch } from "./scrapers/listingScraper.js";
import { sendNotification } from "./notifier/telegram.js";
import { getState, updateState } from "./utils/stateManager.js";

dotenv.config();

const SEARCH_TERM = process.env.SEARCH_TERM;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL_MINUTES || 5;
const COOLDOWN = (process.env.COOLDOWN_MINUTES || 60) * 60 * 1000;

let isRunning = false;

async function runCheck() {
  if (isRunning) return;
  isRunning = true;

  console.log(`\n🔎 Searching for: ${SEARCH_TERM}`);

  const result = await checkSearch(SEARCH_TERM);

  const state = getState();
  const previous = state[SEARCH_TERM];

  console.log(`In Stock: ${result.inStock}`);

  if (result.inStock) {
    const now = Date.now();
    const lastNotified = previous?.lastNotified || 0;

    if (!previous || previous.status === "OUT" || now - lastNotified > COOLDOWN) {
      const statusLines = result.results.map(r =>
        r.inStock ? `✅ AVAILABLE: ${r.url}` : `❌ NOT AVAILABLE: ${r.url}`
      ).join("\n");

      await sendNotification(
        `🔥 DROP DETECTED!\n\nSearch Term: ${SEARCH_TERM}\n\n${statusLines}`
      );

      updateState(SEARCH_TERM, "IN", now);
    }
  } else {
    updateState(SEARCH_TERM, "OUT", previous?.lastNotified || null);
  }

  isRunning = false;
}

cron.schedule(`*/${CHECK_INTERVAL} * * * *`, runCheck);

runCheck();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_PATH = path.join(__dirname, "..", "state", "state.json");

export function loadState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { lastRunAt: null, store: null, official: null };
  }
}

export function saveState(nextState) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2));
}

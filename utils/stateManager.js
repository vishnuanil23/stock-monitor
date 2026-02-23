import fs from "fs";
import path from "path";

const statePath = path.resolve("state/state.json");

export function getState() {
  if (!fs.existsSync(statePath)) {
    fs.writeFileSync(statePath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(statePath));
}

export function updateState(key, status, lastNotified) {
  const state = getState();

  state[key] = {
    status,
    lastNotified
  };

  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

const fs = require("fs");
const path = require("path");

const stateDir = path.join(__dirname, "..", "state");
const statePath = path.join(stateDir, "state.json");

async function ensureStateFile() {
  await fs.promises.mkdir(stateDir, { recursive: true });
  try {
    await fs.promises.access(statePath, fs.constants.F_OK);
  } catch {
    await fs.promises.writeFile(statePath, "{}", "utf8");
  }
}

async function readState() {
  await ensureStateFile();
  try {
    const raw = await fs.promises.readFile(statePath, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") return {};
    // If corrupted, fallback to empty to keep reads safe.
    return {};
  }
}

async function writeState(state) {
  await ensureStateFile();
  const tmpPath = `${statePath}.tmp`;
  const data = JSON.stringify(state, null, 2);
  await fs.promises.writeFile(tmpPath, data, "utf8");
  await fs.promises.rename(tmpPath, statePath);
}

async function getState() {
  return readState();
}

async function updateState(watchName, site, status) {
  if (!watchName || !site) return readState();
  const state = await readState();
  if (!state[watchName]) state[watchName] = {};
  state[watchName][site] = status;
  await writeState(state);
  return state;
}

module.exports = {
  getState,
  updateState,
};

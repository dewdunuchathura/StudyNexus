const fs = require("fs/promises");
const path = require("path");

const storePath = path.join(__dirname, "..", "data", "lecture-summary-store.json");

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

async function readStore() {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeStore(records) {
  await ensureStoreDir();
  await fs.writeFile(storePath, JSON.stringify(records, null, 2), "utf8");
}

async function getLectureSummary(workspaceId = "default") {
  const records = await readStore();
  return records.find((record) => record.workspaceId === workspaceId) || null;
}

async function saveLectureSummary(record) {
  const now = new Date().toISOString();
  const records = await readStore();
  const nextRecord = {
    ...record,
    createdAt: record.createdAt || now,
    updatedAt: now,
  };
  const index = records.findIndex((item) => item.workspaceId === record.workspaceId);
  if (index >= 0) {
    records[index] = nextRecord;
  } else {
    records.push(nextRecord);
  }
  await writeStore(records);
  return nextRecord;
}

async function clearLectureSummary(workspaceId = "default") {
  const records = await readStore();
  const nextRecords = records.filter((record) => record.workspaceId !== workspaceId);
  const deletedCount = records.length - nextRecords.length;
  await writeStore(nextRecords);
  return { deletedCount };
}

module.exports = {
  clearLectureSummary,
  getLectureSummary,
  saveLectureSummary,
};

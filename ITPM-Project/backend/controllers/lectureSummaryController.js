const crypto = require("crypto");
const LectureSummary = require("../models/LectureSummary");
const { extractLectureText } = require("../utils/pdfExtractor");
const { generateFromText, isStudyContentValid } = require("../utils/geminiSummary");
const { validateLectureFile, getExtension, formatFileSize } = require("../utils/lectureContent");

function normalizeBase64(base64 = "") {
  const value = String(base64);
  const commaIndex = value.indexOf(",");
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
}

function logRequest(req) {
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
}

function splitSentences(text, limit = 6) {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const chunks = normalized
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return [normalized];
  }

  return chunks.slice(0, limit);
}

function createFallbackContent(sourceText = "") {
  const bullets = splitSentences(sourceText, 6);
  const summary = bullets.length > 0 ? bullets : [String(sourceText || "").trim()].filter(Boolean);

  return {
    summary,
    keyPoints: summary,
    concepts: summary.map((item) => item.split(" ").slice(0, 4).join(" ")).filter(Boolean),
    revisionNotes: summary,
    questions: summary.map((item) => `What does this mean in the lecture? ${item}`),
  };
}

function hasItems(value) {
  return Array.isArray(value) && value.filter(Boolean).length > 0;
}

function hasMeaningfulContent(content) {
  if (!content || typeof content !== "object") return false;
  return (
    hasItems(content.summary) ||
    hasItems(content.keyPoints) ||
    hasItems(content.concepts) ||
    hasItems(content.revisionNotes) ||
    hasItems(content.questions)
  );
}

function ensureContent(content, sourceText) {
  if (hasMeaningfulContent(content)) {
    return content;
  }

  return createFallbackContent(sourceText);
}

function buildPayload(record) {
  const fileName = record.fileName || "lecture";
  const extension = getExtension(fileName).toUpperCase() || "FILE";
  const fallbackContent = createFallbackContent(record.summary || record.originalText);
  const content = hasMeaningfulContent(record.content) ? record.content : fallbackContent;

  return {
    id: record._id?.toString?.() || record.id || null,
    fileName,
    document: {
      name: fileName,
      extension,
      sizeLabel: record.sizeLabel || formatFileSize(record.sizeInBytes || Buffer.byteLength(record.originalText || "", "utf8")),
      updatedAt: new Date(record.uploadDate || record.createdAt || Date.now()).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
    originalText: record.originalText,
    summary: record.summary,
    content,
    uploadDate: record.uploadDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function getFileFromRequest(req) {
  const body = req.body || {};

  if (req.file?.buffer) {
    return {
      buffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeInBytes: req.file.size,
    };
  }

  const { fileName, mimeType, sizeInBytes, fileData } = body;
  if (!fileData) {
    return null;
  }

  return {
    buffer: Buffer.from(normalizeBase64(fileData), "base64"),
    fileName,
    mimeType,
    sizeInBytes: Number(sizeInBytes) || undefined,
  };
}

function ensureSupportedLectureFile(file) {
  if (!file?.fileName) {
    throw new Error("fileName is required");
  }

  const validationMessage = validateLectureFile({
    name: file.fileName,
    type: file.mimeType || "application/pdf",
    size: file.sizeInBytes || file.buffer?.length || 0,
  });

  if (validationMessage) {
    throw new Error(validationMessage);
  }
}

function createFileHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function uploadLectureSummary(req, res) {
  try {
    logRequest(req);

    const file = getFileFromRequest(req);
    if (!file) {
      return res.status(400).json({ ok: false, message: "A PDF or PPTX file is required. Send fileData and fileName." });
    }

    if (!req.body?.fileName && !req.file?.originalname) {
      return res.status(400).json({ ok: false, message: "fileName is required" });
    }

    ensureSupportedLectureFile(file);

    const fileHash = createFileHash(file.buffer);
    const existingRecord = await LectureSummary.findOne({ fileHash }).sort({ uploadDate: -1, createdAt: -1 });
    if (existingRecord) {
      console.log("Reusing existing record for fileHash:", fileHash);
      return res.status(200).json({ ok: true, data: buildPayload(existingRecord), reused: true });
    }

    console.log("Extracting...");
    const originalText = await extractLectureText(file.buffer, file.fileName, file.mimeType);
    console.log("Extracted text length:", originalText.length);
    console.log("EXTRACTED TEXT PREVIEW:", originalText.slice(0, 300));

    if (!originalText) {
      return res.status(400).json({ ok: false, message: "No text could be extracted from the lecture file" });
    }

    console.log("Summarizing...");
    const geminiContent = await generateFromText(originalText, file.fileName);
    const content = ensureContent(geminiContent, originalText);
    console.log("Summary items:", content.summary.length);
    console.log("Questions items:", content.questions.length);
    console.log("FINAL CLEANED OUTPUT:", JSON.stringify(content).slice(0, 2000));

    const savedRecord = await LectureSummary.create({
      fileHash,
      fileName: file.fileName,
      sizeInBytes: file.sizeInBytes || file.buffer.length,
      originalText,
      summary: content.summary.join(" "),
      content,
      uploadDate: new Date(),
    });

    console.log("SAVED:", savedRecord);

    return res.status(201).json({ ok: true, data: buildPayload(savedRecord), reused: false });
  } catch (err) {
    console.error("Upload failed:", err);
    const status = /fileName is required|A PDF or PPTX file is required|Only PDF and PPTX files are supported|No text could be extracted|lecture file/i.test(
      err.message
    )
      ? 400
      : 500;
    return res.status(status).json({ ok: false, message: err.message });
  }
}

async function testSave(req, res) {
  try {
    logRequest(req);

    const dummyContent = createFallbackContent("test");
    const savedRecord = await LectureSummary.create({
      fileHash: createFileHash(Buffer.from("test")),
      fileName: "test",
      sizeInBytes: 4,
      originalText: "test",
      summary: "test",
      content: dummyContent,
      uploadDate: new Date(),
    });

    console.log("SAVED:", savedRecord);
    return res.status(201).json({ ok: true, data: buildPayload(savedRecord) });
  } catch (err) {
    console.error("Test save failed:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function getLectureHistory(_req, res) {
  try {
    const records = await LectureSummary.find().sort({ uploadDate: -1, createdAt: -1 });
    return res.json({ ok: true, data: records.map(buildPayload) });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function getCurrentLectureSummary(_req, res) {
  try {
    const record = await LectureSummary.findOne().sort({ uploadDate: -1, createdAt: -1 });
    if (!record) {
      return res.json({ ok: true, data: null });
    }
    return res.json({ ok: true, data: buildPayload(record) });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function clearCurrentLectureSummary(_req, res) {
  try {
    const result = await LectureSummary.deleteMany({});
    return res.json({ ok: true, deletedCount: result.deletedCount || 0 });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  uploadLectureSummary,
  testSave,
  getLectureHistory,
  getCurrentLectureSummary,
  clearCurrentLectureSummary,
};

const { PDFParse } = require("pdf-parse");

function cleanText(text) {
  return String(text)
    .replace(/\b(Dr|Mr|Ms|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g, "")
    .replace(/.*(Lecture|Faculty|Department|University|IT\d{4}).*/gi, "")
    .replace(/[A-Za-z0-9_\-]+\.pdf/gi, "")
    .replace(/\d+\s*(of|\/)\s*\d+/gi, "")
    .replace(/[●•▪■◆◦§]/g, "")
    .replace(/[-–—]{2,}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/^.{0,20}$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function removeRepeatedHeaders(lines) {
  const counts = new Map();
  for (const line of lines) {
    if (!line) continue;
    counts.set(line, (counts.get(line) || 0) + 1);
  }

  const repeated = new Set();
  for (const [line, count] of counts.entries()) {
    if (count >= 3 && line.length <= 140) {
      repeated.add(line);
    }
  }

  return lines.filter((line) => !repeated.has(line));
}

function cleanExtractedText(text = "") {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !/\b(Dr|Mr|Ms|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g.test(line))
    .filter((line) => !/(Lecture|Faculty|Department|University|IT\d{4})/i.test(line))
    .filter((line) => !/[A-Za-z0-9_\-]+\.pdf/i.test(line))
    .filter((line) => !/^.{0,20}$/.test(line))
    .filter((line) => !/^[\s\-–—_•●▪■◆◦§]+$/.test(line));

  const cleanedLines = removeRepeatedHeaders(lines);
  return cleanText(cleanedLines.join("\n"));
}

async function extractPDFText(fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("A valid PDF buffer is required");
  }

  const parser = new PDFParse({ data: fileBuffer });
  try {
    const data = await parser.getText();
    const rawText = String(data?.text || "");
    return cleanExtractedText(rawText);
  } finally {
    await parser.destroy();
  }
}

module.exports = {
  cleanText,
  cleanExtractedText,
  extractPDFText,
};

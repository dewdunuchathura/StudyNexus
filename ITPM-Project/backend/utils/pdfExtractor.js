const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { PDFParse } = require("pdf-parse");

const execFileAsync = promisify(execFile);

function cleanText(text) {
  return String(text)
    .replace(/\b(Dr|Mr|Ms|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g, "")
    .replace(/.*(Lecture|Faculty|Department|University|IT\d{4}).*/gi, "")
    .replace(/[A-Za-z0-9_\-]+\.pdf/gi, "")
    .replace(/\d+\s*(of|\/)\s*\d+/gi, "")
    .replace(/[\u25cf\u2022\u25aa\u25a0\u25c6\u25e6\u00a7]/g, "")
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
    .filter((line) => !/^[\s\-–—_\u25cf\u2022\u25aa\u25a0\u25c6\u25e6\u00a7]+$/.test(line));

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

function buildPptxPowerShellScript(filePath) {
  const safePath = String(filePath).replace(/'/g, "''");
  return [
    "$ErrorActionPreference = 'Stop'",
    "Add-Type -AssemblyName System.IO.Compression.FileSystem",
    `$zip = [System.IO.Compression.ZipFile]::OpenRead('${safePath}')`,
    "try {",
    "  $slides = @($zip.Entries | Where-Object { $_.FullName -match '^ppt/slides/slide(\\d+)\\.xml$' } | Sort-Object { [int]([regex]::Match($_.FullName, 'slide(\\d+)\\.xml').Groups[1].Value) })",
    "  $lines = New-Object System.Collections.Generic.List[string]",
    "  foreach ($entry in $slides) {",
    "    $stream = $entry.Open()",
    "    try {",
    "      $reader = New-Object System.IO.StreamReader($stream)",
    "      $xml = $reader.ReadToEnd()",
    "    } finally {",
    "      if ($reader) { $reader.Dispose() }",
    "      if ($stream) { $stream.Dispose() }",
    "    }",
    "    $matches = [regex]::Matches($xml, '<a:t[^>]*>(.*?)</a:t>')",
    "    foreach ($match in $matches) {",
    "      $value = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)",
    "      if (-not [string]::IsNullOrWhiteSpace($value)) { $lines.Add($value.Trim()) }",
    "    }",
    "    $lines.Add('')",
    "  }",
    "  $lines -join [Environment]::NewLine",
    "} finally {",
    "  $zip.Dispose()",
    "}",
  ].join("\n");
}

async function extractPPTXText(fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("A valid PPTX buffer is required");
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "lecture-pptx-"));
  const tempFile = path.join(tempDir, "upload.pptx");

  try {
    await fs.writeFile(tempFile, fileBuffer);
    const script = buildPptxPowerShellScript(tempFile);
    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return cleanExtractedText(stdout || "");
  } catch (error) {
    throw new Error(`Unable to extract text from the PPTX file: ${error.message}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function extractLectureText(fileBuffer, fileName = "") {
  const extension = path.extname(String(fileName)).toLowerCase();
  if (extension === ".pptx") {
    return extractPPTXText(fileBuffer);
  }
  return extractPDFText(fileBuffer);
}

module.exports = {
  cleanText,
  cleanExtractedText,
  extractLectureText,
  extractPDFText,
  extractPPTXText,
};


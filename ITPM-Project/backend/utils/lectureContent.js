const SUPPORTED_TYPES = ["PDF"];
const supportedExtensions = new Set(["pdf"]);
const maxFileSizeBytes = 15 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const sizeInMb = bytes / 1024 / 1024;
  if (sizeInMb >= 1) return `${sizeInMb.toFixed(1)} MB`;
  return `${Math.max(bytes / 1024, 0.1).toFixed(1)} KB`;
}

function getExtension(fileName = "") {
  if (!fileName.includes(".")) return "";
  return fileName.split(".").pop().toLowerCase();
}

function createDocumentRecord(file) {
  return {
    name: file.name,
    extension: getExtension(file.name).toUpperCase() || "FILE",
    sizeLabel: formatFileSize(file.size),
    updatedAt: new Date(file.lastModified || Date.now()).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

function validateLectureFile(file) {
  if (!file) {
    return "Please choose a lecture file first.";
  }

  const extension = getExtension(file.name || "");
  if (!supportedExtensions.has(extension)) {
    return "Only PDF files are supported right now.";
  }

  if (file.size > maxFileSizeBytes) {
    return "That file is too large. Please upload a file smaller than 15 MB.";
  }

  return "";
}

module.exports = {
  SUPPORTED_TYPES,
  createDocumentRecord,
  formatFileSize,
  getExtension,
  validateLectureFile,
};

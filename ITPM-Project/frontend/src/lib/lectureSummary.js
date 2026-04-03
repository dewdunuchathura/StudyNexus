export const supportedTypes = ["PDF", "PPT", "PPTX", "DOC", "DOCX"];

const supportedExtensions = new Set(["pdf", "ppt", "pptx", "doc", "docx"]);
const maxFileSizeBytes = 15 * 1024 * 1024;

export function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const sizeInMb = bytes / 1024 / 1024;
  if (sizeInMb >= 1) return `${sizeInMb.toFixed(1)} MB`;
  return `${Math.max(bytes / 1024, 0.1).toFixed(1)} KB`;
}

export function validateLectureFile(file) {
  if (!file) {
    return "Please choose a lecture file first.";
  }

  const fileName = file.name || "";
  const extension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
  const isImageFile = file.type?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extension);

  if (!supportedExtensions.has(extension)) {
    if (isImageFile) {
      return "Images are not supported. Please upload a PDF, PPT, PPTX, DOC, or DOCX file.";
    }
    return "Unsupported file type. Please upload a PDF, PPT, PPTX, DOC, or DOCX file.";
  }

  if (file.size > maxFileSizeBytes) {
    return "That file is too large. Please upload a file smaller than 15 MB.";
  }

  return "";
}

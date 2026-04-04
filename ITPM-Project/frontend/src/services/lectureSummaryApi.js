const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://127.0.0.1:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export async function fetchCurrentLectureSummary(workspaceId = "default") {
  return request(`/lecture-summary/current?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export async function fetchLectureHistory() {
  return request("/lecture-summary/history");
}

export async function uploadLectureSummary({
  workspaceId = "default",
  fileName,
  sizeInBytes,
  mimeType,
  uploadedAt,
  fileData,
}) {
  if (!fileName) {
    throw new Error("fileName is required");
  }

  if (!fileData) {
    throw new Error("fileData is required");
  }

  return request("/lecture-summary/upload", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      fileName,
      sizeInBytes,
      mimeType,
      uploadedAt,
      fileData,
    }),
  });
}

export async function testLectureSummarySave() {
  return request("/lecture-summary/test", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function clearLectureSummary(workspaceId = "default") {
  return request(`/lecture-summary/current?workspaceId=${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
  });
}

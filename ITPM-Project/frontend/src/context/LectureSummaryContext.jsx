import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { validateLectureFile } from "../lib/lectureSummary.js";
import {
  clearLectureSummary,
  fetchCurrentLectureSummary,
  uploadLectureSummary,
} from "../services/lectureSummaryApi.js";

const STORAGE_KEY = "itpm-lecture-summary-record";

const LectureSummaryContext = createContext(null);

function readStoredRecord() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredRecord(record) {
  if (typeof window === "undefined") return;
  try {
    if (record) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures and keep the in-memory state working.
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function splitSentences(text, limit = 4) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks = normalized.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  if (chunks.length === 0) return [normalized.slice(0, 180)];
  return chunks.slice(0, limit).map((part) => (part.length > 180 ? `${part.slice(0, 177)}...` : part));
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function deriveStudyContent(record) {
  const sourceContent = record?.content && typeof record.content === "object" ? record.content : {};
  const summaryFromApi       = normalizeList(sourceContent.summary);
  const keyPointsFromApi     = normalizeList(sourceContent.keyPoints);
  const conceptsFromApi      = normalizeList(sourceContent.concepts);
  const revisionNotesFromApi = normalizeList(sourceContent.revisionNotes);
  const questionsFromApi     = normalizeList(sourceContent.questions);
  // NEW: answers — one per question, same order
  const answersFromApi       = normalizeList(sourceContent.answers);

  const fallbackSource  = record?.summary || record?.originalText || record?.document?.name || "";
  const fallbackBullets = splitSentences(fallbackSource, 4);
  const fallbackSummary = fallbackBullets.length > 0
    ? fallbackBullets
    : ["Upload a lecture file to generate study content."];
  const fallbackQuestions = fallbackSummary.map((item) => `What does this mean in the lecture? ${item}`);
  const fallbackAnswers   = fallbackQuestions.map(() => "Upload a lecture file to generate answers.");

  const finalQuestions = questionsFromApi.length > 0 ? questionsFromApi : fallbackQuestions;

  // Align answers with questions: pad with a fallback string if Gemini returned fewer answers
  const rawAnswers = answersFromApi.length > 0 ? answersFromApi : fallbackAnswers;
  const alignedAnswers = finalQuestions.map(
    (_, i) => rawAnswers[i] || "Refer to the lecture material for a full explanation of this topic."
  );

  return {
    summary:       summaryFromApi.length > 0       ? summaryFromApi       : fallbackSummary,
    keyPoints:     keyPointsFromApi.length > 0     ? keyPointsFromApi     : fallbackSummary,
    concepts:      conceptsFromApi.length > 0      ? conceptsFromApi      : fallbackSummary.map((item) => item.split(" ").slice(0, 4).join(" ")).filter(Boolean),
    revisionNotes: revisionNotesFromApi.length > 0 ? revisionNotesFromApi : fallbackSummary,
    questions:     finalQuestions,
    answers:       alignedAnswers,
  };
}

export function LectureSummaryProvider({ children }) {
  const [summaryRecord, setSummaryRecord] = useState(() => readStoredRecord());
  const [isHydrated, setIsHydrated]       = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncFromBackend() {
      try {
        const response = await fetchCurrentLectureSummary();
        if (!mounted) return;
        setSummaryRecord(response?.data || null);
      } catch {
        // Keep any locally stored record if the backend is temporarily unavailable.
      } finally {
        if (mounted) setIsHydrated(true);
      }
    }

    syncFromBackend();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeStoredRecord(summaryRecord);
  }, [summaryRecord, isHydrated]);

  const actions = useMemo(
    () => ({
      async uploadFile(file) {
        const validationMessage = validateLectureFile(file);
        if (validationMessage) {
          return { ok: false, error: validationMessage, data: null };
        }

        try {
          const fileData = await readFileAsBase64(file);
          const response = await uploadLectureSummary({
            fileName:    file.name,
            sizeInBytes: file.size,
            mimeType:    file.type,
            uploadedAt:  new Date(file.lastModified).toISOString(),
            fileData,
          });
          setSummaryRecord(response?.data || null);
          return { ok: true, error: "", data: response?.data || null };
        } catch (error) {
          return { ok: false, error: error?.message || "Unable to upload that file.", data: null };
        }
      },
      async clearDocument() {
        try {
          await clearLectureSummary();
        } catch {
          // Clear locally even if the API is unreachable.
        }
        setSummaryRecord(null);
      },
    }),
    []
  );

  const studyContent = useMemo(() => deriveStudyContent(summaryRecord), [summaryRecord]);

  const value = useMemo(
    () => ({
      document: summaryRecord?.document || null,
      content: studyContent,
      summaryRecord,
      ...actions,
    }),
    [actions, summaryRecord, studyContent]
  );

  return <LectureSummaryContext.Provider value={value}>{children}</LectureSummaryContext.Provider>;
}

export function useLectureSummary() {
  const context = useContext(LectureSummaryContext);
  if (!context) {
    throw new Error("useLectureSummary must be used within a LectureSummaryProvider");
  }
  return context;
}
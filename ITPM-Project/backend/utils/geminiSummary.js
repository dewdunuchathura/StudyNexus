function cleanOutput(text) {
  return String(text)
    .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, "")
    .replace(/(Lecture|Faculty|Department|University)/gi, "")
    .replace(/[●•▪■◆◦§]/g, "")
    .replace(/\d+\s*(of|\/)\s*\d+/gi, "")
    .replace(/[-–—]{2,}/g, "")
    .replace(/\b(?:Dr|Mr|Ms|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g, "")
    .replace(/\b[a-z0-9][a-z0-9._-]*\.pdf\b/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripCodeFences(text) {
  return String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanOutput(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    const cleaned = cleanOutput(value);
    return cleaned ? [cleaned] : [];
  }

  return [];
}

function normalizeQuestionList(value) {
  return normalizeList(value)
    .map((item) => item.replace(/[.]+$/g, "").trim())
    .map((item) => (/[?]$/.test(item) ? item : `${item}?`))
    .filter(Boolean)
    .filter((item) => !/file|pdf|page\s*\d+|lecture|faculty|department|university/i.test(item));
}

function normalizeContent(content) {
  if (!content || typeof content !== "object") {
    throw new Error("Gemini returned an invalid response");
  }

  return {
    summary: normalizeList(content.summary),
    keyPoints: normalizeList(content.keyPoints),
    concepts: normalizeList(content.concepts),
    revisionNotes: normalizeList(content.revisionNotes),
    questions: normalizeQuestionList(content.questions),
  };
}

function extractJson(text) {
  const value = stripCodeFences(text);
  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return value.slice(first, last + 1);
  }
  return value;
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

function splitSentences(text, limit = 10) {
  const normalized = cleanOutput(String(text || ""));
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

function toParagraph(sentenceGroup) {
  const text = cleanOutput(sentenceGroup.join(" "));
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function compressToConcept(sentence) {
  const cleaned = cleanOutput(sentence);
  if (!cleaned) return "";
  const words = cleaned.split(" ").filter(Boolean).slice(0, 6);
  return words.join(" ");
}

function finalizeList(items = []) {
  return items
    .map((item) => cleanOutput(item))
    .filter(Boolean)
    .map((item) => (item.length > 320 ? `${item.slice(0, 317)}...` : item));
}

function splitIntoParagraphs(text, sentenceLimit = 3, paragraphLimit = 6) {
  const sentences = splitSentences(text, paragraphLimit * sentenceLimit);
  const paragraphs = [];

  for (let index = 0; index < sentences.length; index += sentenceLimit) {
    const paragraph = toParagraph(sentences.slice(index, index + sentenceLimit));
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }

  return paragraphs;
}

function buildFallbackContent(text, fileName) {
  const summarySentences = splitSentences(text, 6);
  const summaryParagraphs = splitIntoParagraphs(text, 2, 6);
  const summary = summaryParagraphs.length > 0 ? summaryParagraphs : [cleanOutput(String(text || ""))].filter(Boolean);
  const keyPoints = summarySentences.slice(0, 8).map((sentence) => cleanOutput(sentence)).filter(Boolean);
  const concepts = keyPoints.map((point) => compressToConcept(point)).filter(Boolean);
  const revisionNotes = splitIntoParagraphs(text, 3, 8);
  const questions = concepts.length > 0
    ? concepts.slice(0, 8).map((concept) => `Explain ${concept}.`)
    : keyPoints.slice(0, 8).map((point) => `Explain the significance of ${compressToConcept(point) || "this topic"}.`);

  return {
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : summary,
    concepts: concepts.length > 0 ? concepts : summary.map((item) => compressToConcept(item)).filter(Boolean),
    revisionNotes: revisionNotes.length > 0 ? revisionNotes : summary,
    questions: questions.length > 0 ? questions : [fileName ? `What are the key ideas covered in ${fileName}?` : "What are the key ideas covered in this lecture?"],
  };
}

function buildExtendedRevisionNotes(content, lectureText, summaryItems = []) {
  const apiRevisionNotes = finalizeList(content.revisionNotes);
  const apiSummary = finalizeList(content.summary);
  const summaryText = summaryItems.length > 0 ? summaryItems.join(" ") : apiSummary.join(" ");

  const apiLooksLongEnough = apiRevisionNotes.some((item) => item.length >= 120) || apiRevisionNotes.join(" ").length >= 400;
  if (apiLooksLongEnough) {
    return apiRevisionNotes;
  }

  const source = cleanOutput(`${lectureText}\n${summaryText}`);
  const paragraphs = splitIntoParagraphs(source, 3, 10);
  const notes = paragraphs.length > 0 ? paragraphs : splitSentences(source, 10);

  return notes
    .map((item) => {
      const text = cleanOutput(item);
      if (!text) return "";
      const leadIn = /^(revision|note|study|remember|important|key point)/i.test(text) ? text : `Study note: ${text}`;
      return leadIn.length > 360 ? `${leadIn.slice(0, 357)}...` : leadIn;
    })
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeQuestions(questions = [], lectureText = "") {
  const cleanedQuestions = finalizeList(questions)
    .map((question) => question.replace(/[.]+$/g, "").trim())
    .map((question) => (/[?]$/.test(question) ? question : `${question}?`))
    .filter((question) => !/file|pdf|page\s*\d+|lecture|faculty|department|university/i.test(question));

  if (cleanedQuestions.length > 0) {
    return cleanedQuestions.slice(0, 8);
  }

  return splitSentences(lectureText, 8)
    .map((item) => `Explain ${compressToConcept(item) || "the concept"}.`)
    .filter(Boolean);
}

function isStudyContentValid(content) {
  if (!content || typeof content !== "object") return false;

  const summary = Array.isArray(content.summary) ? content.summary : [];
  const keyPoints = Array.isArray(content.keyPoints) ? content.keyPoints : [];
  const concepts = Array.isArray(content.concepts) ? content.concepts : [];
  const revisionNotes = Array.isArray(content.revisionNotes) ? content.revisionNotes : [];
  const questions = Array.isArray(content.questions) ? content.questions : [];

  const hasSummaryParagraph = summary.some((item) => cleanOutput(item).length >= 80 && /[.!?]/.test(cleanOutput(item)));
  const hasValidQuestions = questions.every((item) => !/file|pdf|page\s*\d+|lecture|faculty|department|university/i.test(cleanOutput(item)));

  return (
    summary.length > 0 &&
    keyPoints.length >= 4 &&
    concepts.length >= 2 &&
    revisionNotes.length > 0 &&
    questions.length >= 5 &&
    hasSummaryParagraph &&
    hasValidQuestions
  );
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      anyOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } },
      ],
    },
    keyPoints: { type: "array", items: { type: "string" } },
    concepts: { type: "array", items: { type: "string" } },
    revisionNotes: {
      anyOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } },
      ],
    },
    questions: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "keyPoints", "concepts", "revisionNotes", "questions"],
  additionalProperties: false,
};

async function callGemini(lectureText, prompt) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to backend/.env");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: OUTPUT_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  const rawText = await response.text();
  console.log("GEMINI RAW RESPONSE:", rawText.slice(0, 1500));

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status}): ${rawText || response.statusText}`);
  }

  const payloadResult = safeJsonParse(rawText);
  if (!payloadResult.ok) {
    console.warn("Gemini payload JSON parse failed:", payloadResult.error.message);
    return null;
  }

  const textResult = payloadResult.value?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  console.log("GEMINI CLEANED TEXT:", String(textResult || "").slice(0, 1500));

  if (!textResult) {
    return null;
  }

  const parsedResult = safeJsonParse(extractJson(textResult));
  if (!parsedResult.ok) {
    console.warn("Gemini content JSON parse failed:", parsedResult.error.message);
    return null;
  }

  try {
    const content = normalizeContent(parsedResult.value);
    const cleanedContent = {
      summary: finalizeList(content.summary),
      keyPoints: finalizeList(content.keyPoints),
      concepts: finalizeList(content.concepts),
      revisionNotes: buildExtendedRevisionNotes(content, lectureText, content.summary),
      questions: normalizeQuestions(content.questions, lectureText),
    };

    console.log("FINAL CLEANED OUTPUT:", JSON.stringify(cleanedContent).slice(0, 2000));
    return cleanedContent;
  } catch (error) {
    console.warn("Gemini content normalization failed:", error.message);
    return null;
  }
}

async function generateFromText(text, fileName) {
  const lectureText = String(text || "").trim();
  if (!lectureText) {
    throw new Error("No lecture text was extracted from the uploaded PDF");
  }

  const prompt = [
    "You are a professional lecturer generating CLEAN academic study material.",
    "",
    "ABSOLUTE RULES (MUST FOLLOW):",
    "- NEVER include lecturer names",
    "- NEVER include file names",
    "- NEVER include page numbers",
    "- NEVER include 'Lecture', 'Faculty', 'Department'",
    "- NEVER include slide titles like 'Outline'",
    "- NEVER include symbols like ●, ---, etc.",
    "- NEVER copy raw text",
    "",
    "- You MUST rewrite everything in clean, natural English",
    "- You MUST explain concepts clearly like teaching a student",
    "- You MUST remove ALL irrelevant metadata",
    "",
    "OUTPUT STRICT JSON ONLY:",
    "{",
    '  "summary": "A detailed explanation in paragraph form (minimum 300 words, clean and readable)",',
    '  "keyPoints": ["At least 8 clean academic points"],',
    '  "concepts": ["Concept name - simple explanation"],',
    '  "revisionNotes": "Structured notes for studying (clear and organized)",',
    '  "questions": ["5-10 exam-style questions (NO file references)"]',
    "}",
    "",
    "IMPORTANT:",
    "- If input contains names or metadata → IGNORE them",
    "- If input is messy → CLEAN and REWRITE it",
    "- Output must look like written by a human lecturer",
    "- No symbols, no garbage, no repeated phrases",
    "",
    "Lecture content:",
    lectureText.slice(0, 30000),
  ].join("\n");

  let result = await callGemini(lectureText, prompt);

  if (!isStudyContentValid(result)) {
    console.warn("Gemini output failed validation, regenerating once...");
    result = await callGemini(
      lectureText,
      `${prompt}\n\nIMPORTANT: The previous output was invalid. Return only clean JSON with no names, no file references, no lecture metadata, and no raw copied text.`
    );
  }

  if (!isStudyContentValid(result)) {
    const fallback = buildFallbackContent(lectureText, fileName);
    fallback.revisionNotes = buildExtendedRevisionNotes(fallback, lectureText, fallback.summary);
    console.log("FINAL CLEANED OUTPUT:", JSON.stringify(fallback).slice(0, 2000));
    return fallback;
  }

  return result;
}

module.exports = {
  buildFallbackContent,
  cleanOutput,
  finalizeList,
  generateFromText,
  isStudyContentValid,
};

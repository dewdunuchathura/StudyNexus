const mongoose = require("mongoose");

const studyContentSchema = new mongoose.Schema(
  {
    summary: { type: [String], default: [] },
    keyPoints: { type: [String], default: [] },
    concepts: { type: [String], default: [] },
    revisionNotes: { type: [String], default: [] },
    questions: { type: [String], default: [] },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    fileHash: { type: String, index: true },
    fileName: { type: String, required: true },
    sizeInBytes: { type: Number },
    originalText: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: studyContentSchema, default: () => ({}) },
    uploadDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LectureSummary", schema);

const express = require("express");
const router = express.Router();

const {
  uploadLectureSummary,
  testSave,
  getLectureHistory,
  getCurrentLectureSummary,
  clearCurrentLectureSummary,
} = require("../controllers/lectureSummaryController");

router.post("/upload", uploadLectureSummary);
router.post("/test", testSave);
router.get("/history", getLectureHistory);
router.get("/current", getCurrentLectureSummary);
router.delete("/current", clearCurrentLectureSummary);

module.exports = router;

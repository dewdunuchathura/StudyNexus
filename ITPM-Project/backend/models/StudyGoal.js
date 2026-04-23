const mongoose = require("mongoose");

const StudyGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Not Started", "Pending", "In Progress", "Completed", "Overdue"],
    default: "Not Started",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  deadline: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("StudyGoal", StudyGoalSchema);

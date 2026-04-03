const StudyGoal = require("../models/StudyGoal");
const User = require("../models/User");

// =====================
// GET ALL GOALS
// =====================
exports.getAllGoals = async (req, res) => {
    try {
        let query = {};
        // If not admin/lecturer, only return own goals. If admin/lecturer, return all or support filtering later.
        if (req.user.role === "student") {
            query.user = req.user.id;
        }

        // Using populate to get student details so the frontend can show "Assigned To"
        const goals = await StudyGoal.find(query)
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 })
            .lean();
        res.json(goals);
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
};

// =====================
// CREATE GOAL
// =====================
exports.createGoal = async (req, res) => {
    try {
        const { title, description, status, priority, progress, deadline, assignedTo } = req.body;

        if (!title) {
            return res.status(400).json("Title is required");
        }

        // Determine the user the goal belongs to. If an admin creates it and sends assignedTo, use that.
        const targetUser = (req.user.role !== "student" && assignedTo) ? assignedTo : req.user.id;

        const newGoal = new StudyGoal({
            title,
            description,
            status,
            priority,
            progress,
            deadline,
            user: targetUser,
        });

        const savedGoal = await newGoal.save();
        const populatedGoal = await StudyGoal.findById(savedGoal._id).populate("user", "firstName lastName email");
        res.status(201).json(populatedGoal);
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
};

// =====================
// UPDATE GOAL
// =====================
exports.updateGoal = async (req, res) => {
    try {
        const { title, description, status, priority, progress, deadline, assignedTo } = req.body;

        let goal = await StudyGoal.findById(req.params.id);
        if (!goal) return res.status(404).json("Goal not found");

        // Auth check: Only the owner or an admin/lecturer can edit
        if (goal.user.toString() !== req.user.id && req.user.role === "student") {
            return res.status(401).json("Not authorized");
        }

        goal.title = title || goal.title;
        goal.description = description !== undefined ? description : goal.description;
        goal.status = status || goal.status;
        goal.priority = priority || goal.priority;
        goal.progress = progress !== undefined ? progress : goal.progress;
        goal.deadline = deadline !== undefined ? deadline : goal.deadline;

        if (req.user.role !== "student" && assignedTo) {
            goal.user = assignedTo;
        }

        const updatedGoal = await goal.save();
        const populatedGoal = await StudyGoal.findById(updatedGoal._id).populate("user", "firstName lastName email");
        res.json(populatedGoal);
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
};

// =====================
// DELETE GOAL
// =====================
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await StudyGoal.findById(req.params.id);
        if (!goal) return res.status(404).json("Goal not found");

        // Auth check
        if (goal.user.toString() !== req.user.id && req.user.role === "student") {
            return res.status(401).json("Not authorized");
        }

        await goal.deleteOne();
        res.json("Goal deleted");
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
};

// =====================
// GET LEADERBOARD
// Aggregates all student goals, ranks by completions + progress score
// =====================
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await StudyGoal.aggregate([
            {
                $group: {
                    _id:            "$user",
                    totalGoals:     { $sum: 1 },
                    completedGoals: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    inProgress:     { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    avgProgress:    { $avg: "$progress" },
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: ["$completedGoals", 100] },
                            { $round: [{ $ifNull: ["$avgProgress", 0] }, 0] }
                        ]
                    }
                }
            },
            { $sort: { score: -1, completedGoals: -1 } },
            {
                $lookup: {
                    from:         "users",
                    localField:   "_id",
                    foreignField: "_id",
                    as:           "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            // (no role filter — show all users who have goals)
            {
                $project: {
                    _id:            1,
                    totalGoals:     1,
                    completedGoals: 1,
                    inProgress:     1,
                    avgProgress:    { $round: ["$avgProgress", 1] },
                    score:          1,
                    firstName:      "$userInfo.firstName",
                    lastName:       "$userInfo.lastName",
                    email:          "$userInfo.email",
                    role:           "$userInfo.role",
                }
            }
        ]);

        const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));
        res.json(ranked);
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
};

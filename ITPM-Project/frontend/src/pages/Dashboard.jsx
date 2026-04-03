import { useState, useEffect } from "react";
import axios from "axios";
import {
    Target, CheckSquare, BarChart2, AlertTriangle, PauseCircle,
    Plus, Calendar, Trash2, Edit
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
    const { user: currentUser } = useAuth();
    const [goals, setGoals] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All Goals");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        title: "", description: "", deadline: "", priority: "Medium", status: "Not Started", progress: 0, assignedTo: ""
    });

    useEffect(() => {
        fetchGoals();
        if (currentUser?.role !== "student") {
            fetchStudents();
        }
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/goals");
            setGoals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://localhost:5000/user");
            setStudents(res.data.filter(u => u.role === "student" && u.status === "Active"));
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (goal = null) => {
        setFormError("");
        if (goal) {
            setEditingId(goal._id);
            setFormData({
                title: goal.title,
                description: goal.description || "",
                deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "",
                priority: goal.priority || "Medium",
                status: goal.status || "Not Started",
                progress: goal.progress || 0,
                assignedTo: goal.user?._id || currentUser._id
            });
        } else {
            setEditingId(null);
            setFormData({
                title: "", description: "", deadline: "", priority: "Medium", status: "Not Started", progress: 0, assignedTo: currentUser._id
            });
        }
        setIsModalOpen(true);
    };

    const validate = () => {
        if (!formData.title.trim()) return "Goal title is required.";
        if (formData.title.trim().length < 3) return "Title must be at least 3 characters.";
        if (!formData.deadline) return "Deadline is required.";
        if (formData.progress < 0 || formData.progress > 100) return "Progress must be between 0 and 100.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        const err = validate();
        if (err) {
            setFormError(err);
            return;
        }

        try {
            if (editingId) {
                const res = await axios.put(`http://localhost:5000/api/goals/${editingId}`, formData);
                setGoals(goals.map(g => g._id === editingId ? res.data : g));
            } else {
                const res = await axios.post("http://localhost:5000/api/goals", formData);
                setGoals([res.data, ...goals]);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert("Failed to save goal.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/goals/${id}`);
            setGoals(goals.filter(g => g._id !== id));
        } catch (err) {
            alert("Failed to delete goal.");
        }
    };

    const updateProgress = async (goal) => {
        let newProgress = prompt(`Update progress for "${goal.title}" (0-100):`, goal.progress);
        if (newProgress === null) return;

        newProgress = parseInt(newProgress);
        if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
            alert("Please enter a valid number between 0 and 100.");
            return;
        }

        let newStatus = goal.status;
        if (newProgress === 100) newStatus = "Completed";
        else if (newProgress > 0 && newProgress < 100) newStatus = "In Progress";
        else if (newProgress === 0 && goal.status === "Completed") newStatus = "Not Started";

        try {
            const res = await axios.put(`http://localhost:5000/api/goals/${goal._id}`, {
                progress: newProgress, status: newStatus
            });
            setGoals(goals.map(g => g._id === goal._id ? res.data : g));
        } catch (err) {
            alert("Failed to update progress.");
        }
    };

    // Analytics
    const completedCount  = goals.filter(g => g.status === "Completed").length;
    const inProgressCount = goals.filter(g => g.status === "In Progress").length;
    const overdueCount    = goals.filter(g => g.status === "Overdue" || (g.deadline && new Date(g.deadline) < new Date() && g.status !== "Completed")).length;
    const notStartedCount = goals.filter(g => g.status === "Not Started").length;

    // Filtered Goals
    const filteredGoals = goals.filter(g => {
        if (filter === "All Goals") return true;
        if (filter === "Overdue") {
            return g.status === "Overdue" || (g.deadline && new Date(g.deadline) < new Date() && g.status !== "Completed");
        }
        return g.status === filter;
    });

    // Helpers
    const getStatusBadgeClass = (goal) => {
        const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== "Completed";
        if (isOverdue || goal.status === "Overdue") return "status-badge badge-overdue";
        if (goal.status === "Completed") return "status-badge badge-complete";
        if (goal.status === "In Progress") return "status-badge badge-progress";
        return "status-badge badge-default";
    };

    const getStatusLabel = (goal) => {
        return (goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== "Completed") ? "Overdue" : goal.status;
    };

    const getPriorityDotClass = (priority) => {
        if (priority === "High")   return "priority-dot dot-high";
        if (priority === "Medium") return "priority-dot dot-medium";
        if (priority === "Low")    return "priority-dot dot-low";
        return "priority-dot dot-default";
    };

    const stats = [
        { label: "Total Goals",  value: goals.length,  icon: Target,        iconClass: "icon-blue" },
        { label: "Completed",    value: completedCount, icon: CheckSquare,   iconClass: "icon-emerald" },
        { label: "In Progress",  value: inProgressCount,icon: BarChart2,     iconClass: "icon-indigo" },
        { label: "Overdue",      value: overdueCount,   icon: AlertTriangle, iconClass: "icon-amber" },
        { label: "Not Started",  value: notStartedCount,icon: PauseCircle,   iconClass: "icon-slate" },
    ];

    return (
        <div className="dashboard">

            {/* Header */}
            <div className="page-header">
                <h2 className="page-title">Study Goals</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus size={16} />
                    Add Goal
                </button>
            </div>

            {/* Analytics Cards */}
            <div className="stats-grid">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="stat-card">
                            <div className={`stat-card-icon ${stat.iconClass}`}>
                                <Icon size={20} />
                            </div>
                            <p className="stat-card-value">{stat.value}</p>
                            <p className="stat-card-label">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="tab-bar">
                {["All Goals", "In Progress", "Completed", "Overdue"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`tab-btn${filter === tab ? " active" : ""}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Goals Grid */}
            {loading ? (
                <div className="loading-text">Loading goals...</div>
            ) : filteredGoals.length === 0 ? (
                <div className="empty-state">
                    <Target size={48} className="empty-state-icon" />
                    <p className="empty-state-title">No goals found</p>
                    <p className="empty-state-text">Create a study goal to track your academic progress.</p>
                </div>
            ) : (
                <div className="goals-grid">
                    {filteredGoals.map(goal => (
                        <div key={goal._id} className="goal-card">

                            {/* Header */}
                            <div className="goal-card-header">
                                <h3 className={`goal-card-title${goal.status === "Completed" ? " goal-card-title--completed" : ""}`}>
                                    {goal.title}
                                </h3>
                                <span className={getStatusBadgeClass(goal)}>
                                    {getStatusLabel(goal)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="goal-desc">
                                {goal.description || "No description provided."}
                            </p>

                            {/* Progress Bar */}
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span className="progress-label">Progress</span>
                                    <span className="progress-value">{goal.progress || 0}%</span>
                                </div>
                                <div className="progress-track">
                                    <div
                                        className={`progress-fill${goal.progress === 100 ? " progress-fill--complete" : ""}`}
                                        style={{ width: `${goal.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Meta chips */}
                            <div className="goal-meta">
                                {goal.deadline && (
                                    <div className="meta-chip">
                                        <Calendar size={13} />
                                        <span>{new Date(goal.deadline).toISOString().split('T')[0]}</span>
                                    </div>
                                )}
                                <div className="meta-chip">
                                    <span className={getPriorityDotClass(goal.priority)}></span>
                                    <span>{goal.priority}</span>
                                </div>
                                {goal.user && (
                                    <div className="meta-chip">
                                        <span>{goal.user.firstName} {goal.user.lastName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="goal-actions">
                                <button onClick={() => updateProgress(goal)} className="goal-action-btn-text">
                                    Update %
                                </button>
                                <button onClick={() => handleOpenModal(goal)} className="goal-action-btn-icon goal-action-btn-icon--edit" title="Edit">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(goal._id)} className="goal-action-btn-icon goal-action-btn-icon--delete" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Target size={20} className="modal-title-icon" />
                                {editingId ? "Edit Study Goal" : "Add New Goal"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div style={{
                                        background: "rgba(239,68,68,0.12)",
                                        border: "1px solid rgba(239,68,68,0.3)",
                                        color: "#f87171",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        fontSize: 14,
                                        marginBottom: 14,
                                    }}>
                                        {formError}
                                    </div>
                                )}
                                <div className="modal-field">
                                    <label>Goal Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Complete Data Structures revision"
                                        className="modal-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="modal-field">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="What do you want to achieve?"
                                        className="modal-input modal-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="modal-row">
                                    <div className="modal-field">
                                        <label>Deadline *</label>
                                        <input
                                            type="date"
                                            required
                                            className="modal-input"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Priority</label>
                                        <select
                                            className="modal-input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                {currentUser?.role !== "student" && (
                                    <div className="modal-field">
                                        <label>Assigned To (Student)</label>
                                        <select
                                            className="modal-input"
                                            value={formData.assignedTo}
                                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        >
                                            <option value={currentUser._id}>Myself</option>
                                            {students.map(s => (
                                                <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="modal-field">
                                    <label>Progress (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="modal-input"
                                        value={formData.progress}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0;
                                            if (val > 100) val = 100;
                                            if (val < 0) val = 0;
                                            let stat = formData.status;
                                            if (val === 100) stat = "Completed";
                                            else if (val > 0) stat = "In Progress";
                                            else if (val === 0 && stat === "Completed") stat = "Not Started";
                                            setFormData({ ...formData, progress: val, status: stat });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    Save Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;

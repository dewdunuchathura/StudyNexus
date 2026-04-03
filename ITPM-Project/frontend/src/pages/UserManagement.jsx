import { useState, useEffect } from "react";
import axios from "axios";
import {
    Users, Users2, GraduationCap, CheckSquare, Clock,
    Search, Edit, Trash2, Shield, Plus, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";       /* stat-card, page-header, modal styles */
import "./UserManagement.css";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All Users");
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingUser, setEditingUser]   = useState(null);
    const [formError, setFormError]       = useState("");
    const [formSuccess, setFormSuccess]   = useState("");
    const [saving, setSaving]             = useState(false);
    const [deleteId, setDeleteId]         = useState(null); // confirm dialog

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        role: "student", status: "Active", password: ""
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/user");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        setFormError("");
        setFormSuccess("");
        if (user) {
            setEditingUser(user);
            setFormData({
                firstName: user.firstName,
                lastName:  user.lastName,
                email:     user.email,
                role:      user.role,
                status:    user.status || "Active",
                password:  "",
            });
        } else {
            setEditingUser(null);
            setFormData({ firstName: "", lastName: "", email: "", role: "student", status: "Active", password: "" });
        }
        setIsModalOpen(true);
    };

    // ── Client-side validation ──────────────────────────────────────
    const validate = () => {
        if (!formData.firstName.trim())  return "First name is required.";
        if (!formData.lastName.trim())   return "Last name is required.";
        if (!formData.email.trim())      return "Email address is required.";
        if (!isValidEmail(formData.email)) return "Please enter a valid email address.";
        if (!editingUser && !formData.password) return "Password is required for new users.";
        if (!editingUser && formData.password.length < 6)
            return "Password must be at least 6 characters.";
        if (!["student", "lecturer", "admin"].includes(formData.role))
            return "Please select a valid role.";
        return null;
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        const err = validate();
        if (err) { setFormError(err); return; }

        setSaving(true);
        try {
            if (editingUser) {
                // PUT /user/:id  — update existing
                const res = await axios.put(
                    `http://localhost:5000/user/${editingUser._id}`,
                    formData
                );
                setUsers(prev => prev.map(u =>
                    u._id === editingUser._id ? res.data.user : u
                ));
                setFormSuccess("User updated successfully.");
                setTimeout(() => setIsModalOpen(false), 900);
            } else {
                // POST /user/add  — create new user with password hashing on backend
                const res = await axios.post("http://localhost:5000/user/add", formData);
                setFormSuccess(res.data.message || "User added successfully.");
                fetchUsers();
                setTimeout(() => setIsModalOpen(false), 900);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to save user. Please try again.";
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/user/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting user.");
        } finally {
            setDeleteId(null);
        }
    };

    // ── Derived values ──────────────────────────────────────────────
    const studentsCount  = users.filter(u => u.role === "student").length;
    const lecturersCount = users.filter(u => u.role === "lecturer").length;
    const activeCount    = users.filter(u => u.status === "Active").length;
    const pendingCount   = users.filter(u => u.status !== "Active").length;

    const filteredUsers = users.filter(u => {
        const matchesFilter =
            filter === "All Users" ||
            (filter === "Students"  && u.role === "student") ||
            (filter === "Lecturers" && u.role === "lecturer") ||
            (filter === "Admins"    && u.role === "admin");
        const matchesSearch =
            u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(search.toLowerCase())  ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getAvatarClass = (role) => {
        if (role === "admin")    return "user-avatar avatar-admin";
        if (role === "lecturer") return "user-avatar avatar-lecturer";
        return "user-avatar avatar-student";
    };

    const stats = [
        { label: "Total Users",      value: users.length,    icon: Users2,        iconClass: "icon-purple"  },
        { label: "Students",         value: studentsCount,   icon: GraduationCap, iconClass: "icon-amber"   },
        { label: "Lecturers",        value: lecturersCount,  icon: Shield,        iconClass: "icon-emerald" },
        { label: "Active",           value: activeCount,     icon: CheckSquare,   iconClass: "icon-green"   },
        { label: "Pending / Inactive", value: pendingCount,  icon: Clock,         iconClass: "icon-amber"   },
    ];

    return (
        <div className="user-management">

            {/* Header */}
            <div className="page-header">
                <h2 className="page-title">User Management</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {/* Stat Cards */}
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

            {/* Tabs & Search */}
            <div className="um-toolbar">
                <div className="tab-bar">
                    {["All Users", "Students", "Lecturers", "Admins"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`tab-btn${filter === tab ? " active" : ""}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="um-search-wrap">
                    <div className="um-search-icon"><Search size={16} /></div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="um-search-input"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="um-table-card">
                <div className="um-table-header">
                    <h3 className="um-table-title">Registered Users</h3>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{filteredUsers.length} users</span>
                </div>

                <div className="um-table-wrap">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="um-empty-row">
                                    <td colSpan="5">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr className="um-empty-row">
                                    <td colSpan="5">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className={getAvatarClass(u.role)}>
                                                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="user-name">{u.firstName} {u.lastName}</div>
                                                    <div className="user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="role-badge" style={{ textTransform: "capitalize" }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={u.status === "Active"
                                                ? "status-badge--active"
                                                : "status-badge--inactive"}>
                                                {u.status || "Active"}
                                            </span>
                                        </td>
                                        <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                                            {u.createdAt
                                                ? new Date(u.createdAt).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td>
                                            <div className="um-actions">
                                                <button
                                                    onClick={() => handleOpenModal(u)}
                                                    className="um-action-btn um-action-btn--edit"
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(u._id)}
                                                    className="um-action-btn um-action-btn--delete"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── ADD / EDIT MODAL ── */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal modal--md">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Users size={20} className="modal-title-icon" />
                                {editingUser ? "Edit User" : "Add New User"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="modal-close-btn"
                                type="button"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} noValidate>
                            <div className="modal-body">

                                {/* Inline error / success banners */}
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
                                {formSuccess && (
                                    <div style={{
                                        background: "rgba(16,185,129,0.12)",
                                        border: "1px solid rgba(16,185,129,0.3)",
                                        color: "#34d399",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        fontSize: 14,
                                        marginBottom: 14,
                                    }}>
                                        {formSuccess}
                                    </div>
                                )}

                                <div className="modal-row">
                                    <div className="modal-field">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            className="modal-input"
                                            placeholder="Enter first name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-field">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            className="modal-input"
                                            placeholder="Enter last name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-field">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        className="modal-input"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="modal-row">
                                    <div className="modal-field">
                                        <label>Role *</label>
                                        <select
                                            className="modal-input"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="student">Student</option>
                                            <option value="lecturer">Lecturer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="modal-field">
                                        <label>Status *</label>
                                        <select
                                            className="modal-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password only shown when creating a new user */}
                                {!editingUser && (
                                    <div className="modal-field">
                                        <label>Password * <span style={{ color: "#475569", fontSize: 12, fontWeight: 400 }}>(min. 6 characters)</span></label>
                                        <input
                                            type="password"
                                            className="modal-input"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}

                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-cancel"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingUser ? "Update User" : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRMATION DIALOG ── */}
            {deleteId && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ color: "#f87171" }}>
                                Delete User
                            </h3>
                            <button onClick={() => setDeleteId(null)} className="modal-close-btn" type="button">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
                                Are you sure you want to delete this user?
                                This action <strong style={{ color: "#f87171" }}>cannot be undone</strong>.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => setDeleteId(null)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteUser(deleteId)}
                                className="btn-save"
                                style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserManagement;

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trophy, Medal, Search, RefreshCw, Star, Target, CheckSquare, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Leaderboard.css";

const MEDALS = ["🥇", "🥈", "🥉"];

const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [spinning, setSpinning] = useState(false);

    const fetchLeaderboard = useCallback(async (showSpin = false) => {
        if (showSpin) setSpinning(true);
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("http://localhost:5000/api/goals/leaderboard");
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
            setError("Could not load leaderboard. Make sure the backend server is running.");
        } finally {
            setLoading(false);
            if (showSpin) setTimeout(() => setSpinning(false), 600);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Filter by search
    const filtered = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const top3 = students.slice(0, 3);

    // Derived stats
    const totalStudents   = students.length;
    const totalCompleted  = students.reduce((acc, s) => acc + s.completedGoals, 0);
    const topScore        = students[0]?.score ?? 0;

    // Rank cell class
    const rankClass = (rank) => {
        if (rank === 1) return "lb-rank-number lb-rank-number--gold";
        if (rank === 2) return "lb-rank-number lb-rank-number--silver";
        if (rank === 3) return "lb-rank-number lb-rank-number--bronze";
        return "lb-rank-number";
    };

    const isMe = (s) => s.email === currentUser?.email;

    // Avatar initials
    const initials = (s) => `${s.firstName?.charAt(0) ?? ""}${s.lastName?.charAt(0) ?? ""}`;

    return (
        <div className="leaderboard">

            {/* Hero Banner */}
            <div className="lb-hero">
                <div className="lb-hero-left">
                    <h2>
                        <span className="trophy-icon">🏆</span>
                        Student Leaderboard
                    </h2>
                    <p>
                        Students are ranked by completed goals. Finish more tasks to climb the board
                        and inspire your peers!
                    </p>
                </div>
                <div className="lb-hero-stats">
                    <div className="lb-hero-stat">
                        <div className="lb-hero-stat-value">{totalStudents}</div>
                        <div className="lb-hero-stat-label">Students</div>
                    </div>
                    <div className="lb-hero-stat">
                        <div className="lb-hero-stat-value">{totalCompleted}</div>
                        <div className="lb-hero-stat-label">Completed</div>
                    </div>
                    <div className="lb-hero-stat">
                        <div className="lb-hero-stat-value">{topScore}</div>
                        <div className="lb-hero-stat-label">Top Score</div>
                    </div>
                </div>
            </div>

            {/* Top-3 Podium */}
            {!loading && top3.length >= 1 && (
                <div className="lb-podium">
                    {/* 2nd place — left */}
                    {top3[1] ? (
                        <div className="lb-podium-card lb-podium-card--2">
                            <span className="lb-podium-rank-badge rank-badge--2"># 2</span>
                            <span className="lb-podium-crown">{MEDALS[1]}</span>
                            <div className="lb-podium-avatar lb-podium-avatar--2">
                                {initials(top3[1])}
                            </div>
                            <div className="lb-podium-name">{top3[1].firstName} {top3[1].lastName}</div>
                            <div className="lb-podium-score">{top3[1].score} pts</div>
                            <div className="lb-podium-meta">
                                <span className="lb-podium-chip"><strong>{top3[1].completedGoals}</strong> done</span>
                                <span className="lb-podium-chip"><strong>{top3[1].totalGoals}</strong> total</span>
                            </div>
                        </div>
                    ) : <div />}

                    {/* 1st place — centre (tallest) */}
                    <div className="lb-podium-card lb-podium-card--1">
                        <span className="lb-podium-rank-badge rank-badge--1"># 1</span>
                        <span className="lb-podium-crown">{MEDALS[0]}</span>
                        <div className="lb-podium-avatar lb-podium-avatar--1">
                            {initials(top3[0])}
                        </div>
                        <div className="lb-podium-name">{top3[0].firstName} {top3[0].lastName}</div>
                        <div className="lb-podium-score">{top3[0].score} pts</div>
                        <div className="lb-podium-meta">
                            <span className="lb-podium-chip"><strong>{top3[0].completedGoals}</strong> done</span>
                            <span className="lb-podium-chip"><strong>{top3[0].totalGoals}</strong> total</span>
                        </div>
                    </div>

                    {/* 3rd place — right */}
                    {top3[2] ? (
                        <div className="lb-podium-card lb-podium-card--3">
                            <span className="lb-podium-rank-badge rank-badge--3"># 3</span>
                            <span className="lb-podium-crown">{MEDALS[2]}</span>
                            <div className="lb-podium-avatar lb-podium-avatar--3">
                                {initials(top3[2])}
                            </div>
                            <div className="lb-podium-name">{top3[2].firstName} {top3[2].lastName}</div>
                            <div className="lb-podium-score">{top3[2].score} pts</div>
                            <div className="lb-podium-meta">
                                <span className="lb-podium-chip"><strong>{top3[2].completedGoals}</strong> done</span>
                                <span className="lb-podium-chip"><strong>{top3[2].totalGoals}</strong> total</span>
                            </div>
                        </div>
                    ) : <div />}
                </div>
            )}

            {/* Toolbar */}
            <div className="lb-toolbar">
                <div className="lb-search-wrap">
                    <div className="lb-search-icon"><Search size={16} /></div>
                    <input
                        type="text"
                        className="lb-search-input"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    className={`lb-refresh-btn${spinning ? " spinning" : ""}`}
                    onClick={() => fetchLeaderboard(true)}
                    disabled={loading}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {/* Full Table */}
            <div className="lb-table-card">
                <div className="lb-table-header">
                    <span className="lb-table-title">Full Rankings</span>
                    <span className="lb-table-count">{filtered.length} students</span>
                </div>

                <div className="lb-table-wrap">
                    {loading ? (
                        <div className="lb-loading">
                            <div className="lb-loading-spinner"></div>
                            <span>Loading leaderboard...</span>
                        </div>
                    ) : error ? (
                        <div className="lb-empty">
                            <div className="lb-empty-icon">⚠️</div>
                            <p className="lb-empty-title">Backend not reachable</p>
                            <p>{error}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="lb-empty">
                            <div className="lb-empty-icon">🎯</div>
                            <p className="lb-empty-title">No students found</p>
                            <p>Assign some goals to students to see them appear here.</p>
                        </div>
                    ) : (
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th className="lb-rank-cell">Rank</th>
                                    <th>Student</th>
                                    <th><CheckSquare size={13} style={{marginRight:4, verticalAlign:"middle"}}/>Completed</th>
                                    <th><Target size={13} style={{marginRight:4, verticalAlign:"middle"}}/>Total</th>
                                    <th><TrendingUp size={13} style={{marginRight:4, verticalAlign:"middle"}}/>Avg Progress</th>
                                    <th><Star size={13} style={{marginRight:4, verticalAlign:"middle"}}/>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s._id} className={isMe(s) ? "lb-row--me" : ""}>
                                        <td className="lb-rank-cell">
                                            {s.rank <= 3
                                                ? <span style={{fontSize:"20px"}}>{MEDALS[s.rank - 1]}</span>
                                                : <span className={rankClass(s.rank)}>{s.rank}</span>
                                            }
                                        </td>
                                        <td>
                                            <div className="lb-user-cell">
                                                <div className="lb-avatar">{initials(s)}</div>
                                                <div>
                                                    <div className="lb-fullname">
                                                        {s.firstName} {s.lastName}
                                                        {isMe(s) && <span className="lb-you-badge">You</span>}
                                                    </div>
                                                    <div className="lb-email">
                                                        {s.email}
                                                        {s.role && (
                                                            <span style={{
                                                                marginLeft: 6,
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                textTransform: "capitalize",
                                                                background: s.role === "student" ? "rgba(16,185,129,0.12)" : s.role === "admin" ? "rgba(239,68,68,0.12)" : "rgba(168,85,247,0.12)",
                                                                color: s.role === "student" ? "#34d399" : s.role === "admin" ? "#f87171" : "#c084fc",
                                                                padding: "2px 6px",
                                                                borderRadius: 99,
                                                            }}>{s.role}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="lb-stat-cell lb-stat-cell--completed">
                                            {s.completedGoals}
                                        </td>
                                        <td className="lb-stat-cell">{s.totalGoals}</td>
                                        <td>
                                            <div className="lb-progress-cell">
                                                <div className="lb-progress-track">
                                                    <div
                                                        className="lb-progress-fill"
                                                        style={{ width: `${s.avgProgress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="lb-progress-label">{s.avgProgress ?? 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="lb-score-chip">
                                                <Star size={13} />
                                                {s.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Leaderboard;

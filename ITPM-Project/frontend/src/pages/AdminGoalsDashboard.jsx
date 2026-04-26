import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient, { getErrorMessage, getPayload } from '../services/apiClient';

const shellCard = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0, 48, 151, 0.12)',
  borderRadius: '24px',
  boxShadow: '0 12px 32px rgba(0, 48, 151, 0.08)',
};

const statusTone = (goal) => {
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'Completed';
  if (isOverdue || goal.status === 'Overdue') return { bg: '#FEF2F2', color: '#B91C1C', label: 'Overdue' };
  if (goal.status === 'Completed') return { bg: '#DCFCE7', color: '#166534', label: 'Completed' };
  if (goal.status === 'In Progress') return { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' };
  return { bg: '#E5E7EB', color: '#475569', label: 'Not Started' };
};

const priorityTone = (priority) => {
  if (priority === 'High') return '#EF4444';
  if (priority === 'Medium') return '#F59E0B';
  if (priority === 'Low') return '#10B981';
  return '#94A3B8';
};

export default function AdminGoalsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsResponse, leaderboardResponse] = await Promise.all([
          apiClient.get('/api/goals'),
          apiClient.get('/api/goals/leaderboard'),
        ]);
        setGoals(getPayload(goalsResponse) || []);
        setLeaderboard(getPayload(leaderboardResponse) || []);
      } catch (error) {
        console.error(error);
        alert(getErrorMessage(error, 'Failed to load goals dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const completed = goals.filter((goal) => goal.status === 'Completed').length;
    const inProgress = goals.filter((goal) => goal.status === 'In Progress').length;
    const overdue = goals.filter((goal) => goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'Completed').length;
    const avgProgress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) : 0;
    return {
      total: goals.length,
      completed,
      inProgress,
      overdue,
      avgProgress,
    };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const assignedName = goal.user ? `${goal.user.firstName || ''} ${goal.user.lastName || ''}`.trim() : '';
      const haystack = `${goal.title} ${goal.description || ''} ${assignedName}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'Completed';
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Completed' && goal.status === 'Completed') ||
        (filter === 'In Progress' && goal.status === 'In Progress') ||
        (filter === 'Overdue' && isOverdue) ||
        (filter === 'Not Started' && goal.status === 'Not Started');
      return matchesSearch && matchesFilter;
    });
  }, [filter, goals, search]);

  const handleDelete = async (goalId) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await apiClient.delete(`/api/goals/${goalId}`);
      setGoals((current) => current.filter((goal) => goal._id !== goalId));
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to delete goal.'));
    }
  };

  const handleProgressUpdate = async (goal) => {
    let nextProgress = window.prompt(`Update progress for "${goal.title}" (0-100):`, goal.progress ?? 0);
    if (nextProgress === null) return;

    nextProgress = parseInt(nextProgress, 10);
    if (Number.isNaN(nextProgress) || nextProgress < 0 || nextProgress > 100) {
      alert('Please enter a valid number between 0 and 100.');
      return;
    }

    let nextStatus = goal.status;
    if (nextProgress === 100) nextStatus = 'Completed';
    else if (nextProgress > 0) nextStatus = 'In Progress';
    else nextStatus = 'Not Started';

    try {
      const response = await apiClient.put(`/api/goals/${goal._id}`, {
        progress: nextProgress,
        status: nextStatus,
      });
      const updated = getPayload(response);
      setGoals((current) => current.map((item) => (item._id === goal._id ? updated : item)));
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to update progress.'));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F4F8FF', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '280px', backgroundColor: '#F0F9FF', borderRight: '1px solid rgba(0, 48, 151, 0.08)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#003097', color: '#FFFFFF', boxShadow: '0 14px 24px rgba(0, 48, 151, 0.18)' }}>
              <Target size={30} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#003097' }}>EduNexus</div>
              <div style={{ fontSize: '15px', color: '#6B7280' }}>goals admin panel</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '18px' }}>
          {[
            { label: 'Dashboard', icon: LayoutDashboard, action: () => {} },
            { label: 'Goals', icon: Target, action: () => {} },
            { label: 'Resources Admin', icon: Shield, action: () => navigate('/resources-admin') },
            { label: 'Group Admin', icon: BarChart3, action: () => navigate('/admin-groups') },
            { label: 'Settings', icon: Settings, action: () => {} },
          ].map((item, index) => {
            const Icon = item.icon;
            const active = index < 2;
            return (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: active ? '#003097' : 'transparent',
                  color: active ? '#FFFFFF' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '18px',
                  boxShadow: active ? '0 14px 24px rgba(0, 48, 151, 0.18)' : 'none',
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '18px', borderTop: '1px solid #E5E7EB' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', backgroundColor: '#003097', color: '#FFFFFF', textDecoration: 'none', fontSize: '16px' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: '#003097', padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>Goal Management Dashboard</div>
            <div style={{ marginTop: '6px', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>Track all study goals, completion trends, and overdue work in one place.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
            <TrendingUp size={20} />
            <span>{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
          </div>
        </header>

        <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Total Goals', value: stats.total, icon: Target, color: '#003097' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10B981' },
              { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: '#2563EB' },
              { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: '#F59E0B' },
              { label: 'Avg. Progress', value: `${stats.avgProgress}%`, icon: BarChart3, color: '#7C3AED' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ ...shellCard, padding: '28px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 48, 151, 0.08)', color: item.color, marginBottom: '18px' }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  <div style={{ marginTop: '12px', fontSize: '38px', fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px' }}>
            <div style={{ ...shellCard, padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: '1 1 360px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                  <input
                    type="text"
                    placeholder="Search goals by title, description, or student..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: '14px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '16px' }}
                  />
                </div>
                <select value={filter} onChange={(event) => setFilter(event.target.value)} style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '16px', minWidth: '180px' }}>
                  <option>All</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Overdue</option>
                  <option>Not Started</option>
                </select>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                    <tr>
                      {['Goal', 'Assigned To', 'Deadline', 'Progress', 'Status', 'Actions'].map((label) => (
                        <th key={label} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Loading goals...</td></tr>
                    ) : filteredGoals.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>No goals found.</td></tr>
                    ) : (
                      filteredGoals.map((goal) => {
                        const status = statusTone(goal);
                        const assignedTo = goal.user ? `${goal.user.firstName || ''} ${goal.user.lastName || ''}`.trim() : 'Unknown';
                        return (
                          <tr key={goal._id} style={{ borderBottom: '1px solid #EEF2FF' }}>
                            <td style={{ padding: '18px' }}>
                              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{goal.title}</div>
                              <div style={{ marginTop: '4px', fontSize: '13px', color: '#6B7280' }}>{goal.description || 'No description provided.'}</div>
                            </td>
                            <td style={{ padding: '18px', fontSize: '15px', color: '#111827' }}>{assignedTo}</td>
                            <td style={{ padding: '18px', fontSize: '15px', color: '#6B7280' }}>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</td>
                            <td style={{ padding: '18px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{goal.progress || 0}%</div>
                                <div style={{ width: '120px', height: '8px', borderRadius: '999px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                                  <div style={{ width: `${goal.progress || 0}%`, height: '100%', borderRadius: '999px', backgroundColor: '#003097' }} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '18px' }}>
                              <span style={{ backgroundColor: status.bg, color: status.color, padding: '8px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>{status.label}</span>
                            </td>
                            <td style={{ padding: '18px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleProgressUpdate(goal)} style={{ padding: '10px 12px', borderRadius: '12px', border: 'none', backgroundColor: '#DBEAFE', color: '#1D4ED8', cursor: 'pointer' }}>Update</button>
                                <button onClick={() => handleDelete(goal._id)} style={{ padding: '10px 12px', borderRadius: '12px', border: 'none', backgroundColor: '#FEE2E2', color: '#B91C1C', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ ...shellCard, padding: '24px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#003097', marginBottom: '18px' }}>Leaderboard</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div key={entry._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '16px', backgroundColor: '#F8FBFF' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{entry.firstName} {entry.lastName}</div>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#6B7280' }}>{entry.completedGoals} completed · {entry.totalGoals} total</div>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#003097' }}>#{entry.rank}</div>
                    </div>
                  ))}
                  {!leaderboard.length && !loading && <div style={{ fontSize: '14px', color: '#6B7280' }}>No leaderboard data yet.</div>}
                </div>
              </div>

              <div style={{ ...shellCard, padding: '24px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#003097', marginBottom: '18px' }}>Quick Insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#F0F9FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#003097' }}>
                      <Calendar size={16} />
                      <span style={{ fontWeight: 600 }}>Overdue Goals</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{stats.overdue} goals need follow-up.</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#F0F9FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#003097' }}>
                      <TrendingUp size={16} />
                      <span style={{ fontWeight: 600 }}>Completion Trend</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{stats.completed} goals are fully completed.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

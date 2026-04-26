import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Eye,
  Filter,
  Flag,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import AdminReports from './AdminReports';

const API_BASE = 'http://127.0.0.1:5000/api/groups';
const MODERATION_STORAGE_KEY = 'group_admin_moderation';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0, 48, 151, 0.12)',
  borderRadius: '24px',
  boxShadow: '0 12px 32px rgba(0, 48, 151, 0.08)',
};

const iconWrap = {
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 48, 151, 0.08)',
  color: '#003097',
};

const loadModerationState = () => {
  try {
    return JSON.parse(localStorage.getItem(MODERATION_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveModerationState = (value) => {
  localStorage.setItem(MODERATION_STORAGE_KEY, JSON.stringify(value));
};

const getGroupMeta = (group, moderationState) => {
  const moderation = moderationState[group.id] || {};
  const approved = moderation.approved ?? false;
  const status = moderation.status || (approved ? 'active' : 'pending');

  return {
    approved,
    status,
    closeReason: moderation.closeReason || '',
    closeDuration: moderation.closeDuration || '',
  };
};

const statCards = [
  { key: 'total', label: 'Total Groups', color: '#003097', icon: LayoutDashboard },
  { key: 'active', label: 'Active Groups', color: '#10B981', icon: CheckCircle },
  { key: 'pending', label: 'Pending Approval', color: '#F59E0B', icon: Flag },
  { key: 'closed', label: 'Closed Groups', color: '#EF4444', icon: Trash2 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [duration, setDuration] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [moderationState, setModerationState] = useState(loadModerationState);

  useEffect(() => {
    saveModerationState(moderationState);
  }, [moderationState]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(API_BASE);
        const data = await response.json();

        if (data.success) {
          setGroups(Array.isArray(data.data) ? data.data : []);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const enrichedGroups = useMemo(() => {
    return groups.map((group) => ({ ...group, ...getGroupMeta(group, moderationState) }));
  }, [groups, moderationState]);

  const filtered = useMemo(() => {
    return enrichedGroups.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && !group.approved) ||
        (filter === 'approved' && group.approved) ||
        (filter === 'closed' && group.status === 'closed') ||
        (filter === 'active' && group.status === 'active');

      return matchesSearch && matchesFilter;
    });
  }, [enrichedGroups, filter, search]);

  const stats = useMemo(() => ({
    total: enrichedGroups.length,
    active: enrichedGroups.filter((group) => group.status === 'active').length,
    pending: enrichedGroups.filter((group) => !group.approved).length,
    closed: enrichedGroups.filter((group) => group.status === 'closed').length,
    projects: enrichedGroups.filter((group) => group.category === 'project').length,
    study: enrichedGroups.filter((group) => group.category === 'study').length,
    discussion: enrichedGroups.filter((group) => group.category === 'discussion').length,
  }), [enrichedGroups]);

  const resetModalState = () => {
    setSelectedGroup(null);
    setActionReason('');
    setDuration('');
    setShowDeleteModal(false);
    setShowCloseModal(false);
    setShowApproveModal(false);
  };

  const handleDelete = async () => {
    if (!selectedGroup || !actionReason.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/${selectedGroup.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete group');
      }

      setGroups((current) => current.filter((group) => group.id !== selectedGroup.id));
      setModerationState((current) => {
        const next = { ...current };
        delete next[selectedGroup.id];
        return next;
      });
      resetModalState();
      alert('Group deleted successfully');
    } catch (err) {
      console.error('Delete group error:', err);
      alert(err.message || 'Failed to delete group');
    }
  };

  const handleClose = () => {
    if (!selectedGroup || !actionReason.trim() || !duration.trim()) return;

    setModerationState((current) => ({
      ...current,
      [selectedGroup.id]: {
        ...(current[selectedGroup.id] || {}),
        approved: true,
        status: 'closed',
        closeReason: actionReason,
        closeDuration: duration,
      },
    }));

    resetModalState();
    alert('Group closed temporarily');
  };

  const handleApprove = () => {
    if (!selectedGroup) return;

    setModerationState((current) => ({
      ...current,
      [selectedGroup.id]: {
        ...(current[selectedGroup.id] || {}),
        approved: true,
        status: 'active',
      },
    }));

    resetModalState();
    alert('Group approved successfully');
  };

  const handleReopen = (groupId) => {
    setModerationState((current) => ({
      ...current,
      [groupId]: {
        ...(current[groupId] || {}),
        approved: true,
        status: 'active',
        closeReason: '',
        closeDuration: '',
      },
    }));

    alert('Group reopened successfully');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} style={{ ...cardStyle, padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={iconWrap}>
                  <Icon size={24} />
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
              <div style={{ marginTop: '12px', fontSize: '40px', fontWeight: 700, color: item.color }}>{stats[item.key]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px' }}>
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#003097', marginBottom: '20px' }}>Dashboard Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Project Groups', value: stats.projects },
              { label: 'Study Groups', value: stats.study },
              { label: 'Discussion Groups', value: stats.discussion },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: '#F0F9FF', borderRadius: '18px', padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>{item.label}</div>
                <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 700, color: '#003097' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#003097', marginBottom: '20px' }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => setActiveMenuItem('groups')} style={{ padding: '16px 18px', borderRadius: '16px', border: 'none', backgroundColor: '#003097', color: '#FFFFFF', textAlign: 'left', fontSize: '16px', cursor: 'pointer' }}>Manage Groups</button>
            <button onClick={() => setActiveMenuItem('reports')} style={{ padding: '16px 18px', borderRadius: '16px', border: 'none', backgroundColor: '#DBEAFE', color: '#003097', textAlign: 'left', fontSize: '16px', cursor: 'pointer' }}>Review Reports</button>
            <button onClick={() => navigate('/create-group')} style={{ padding: '16px 18px', borderRadius: '16px', border: 'none', backgroundColor: '#F0F9FF', color: '#003097', textAlign: 'left', fontSize: '16px', cursor: 'pointer' }}>Open Create Group</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGroups = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search groups by name or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: '14px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '16px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#6B7280" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '16px', minWidth: '200px' }}>
              <option value="all">All Groups</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                {['Group', 'ID', 'Category', 'Members', 'Status', 'Created', 'Actions'].map((label) => (
                  <th key={label} style={{ padding: '18px 22px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Loading groups...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#DC2626' }}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>No groups found</td></tr>
              ) : (
                filtered.map((group) => (
                  <tr key={group.id} style={{ borderBottom: '1px solid #EEF2FF' }}>
                    <td style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, backgroundColor: group.leaderColor || '#3B82F6' }}>
                          {group.leaderAv || group.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{group.name}</div>
                          <div style={{ fontSize: '13px', color: '#6B7280' }}>{group.leader || 'Leader'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 22px', fontSize: '15px', color: '#111827', fontFamily: 'monospace' }}>{group.id}</td>
                    <td style={{ padding: '18px 22px' }}><span style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '8px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>{group.category}</span></td>
                    <td style={{ padding: '18px 22px', fontSize: '15px', color: '#111827' }}>{group.members}</td>
                    <td style={{ padding: '18px 22px' }}>
                      <span style={{ backgroundColor: !group.approved ? '#FEF3C7' : group.status === 'closed' ? '#FEE2E2' : '#DCFCE7', color: !group.approved ? '#92400E' : group.status === 'closed' ? '#991B1B' : '#166534', padding: '8px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                        {!group.approved ? 'Pending' : group.status === 'closed' ? 'Closed' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 22px', fontSize: '15px', color: '#6B7280' }}>{group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {!group.approved && <button onClick={() => { setSelectedGroup(group); setShowApproveModal(true); }} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#059669', color: '#FFFFFF', cursor: 'pointer' }}>Approve</button>}
                        {group.status === 'closed' && <button onClick={() => handleReopen(group.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', cursor: 'pointer' }}>Reopen</button>}
                        {group.status === 'active' && <button onClick={() => { setSelectedGroup(group); setShowCloseModal(true); }} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#4B5563', color: '#FFFFFF', cursor: 'pointer' }}>Close</button>}
                        <button onClick={() => navigate(`/group/${group.id}`)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer' }}><Eye size={16} /></button>
                        <button onClick={() => { setSelectedGroup(group); setShowDeleteModal(true); }} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModal = (title, description, primaryLabel, primaryAction, primaryDisabled, showDuration) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ ...cardStyle, width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{title}</div>
        <div style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, marginBottom: '18px' }}>{description}</div>
        {(showDeleteModal || showCloseModal) && (
          <textarea
            placeholder={showDeleteModal ? 'Reason for deletion (required)' : 'Reason for closing (required)'}
            value={actionReason}
            onChange={(event) => setActionReason(event.target.value)}
            rows={4}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', outline: 'none', resize: 'vertical', marginBottom: '14px' }}
          />
        )}
        {showDuration && (
          <input
            type="text"
            placeholder="Duration (e.g., 7 days, 2 weeks)"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', outline: 'none', marginBottom: '14px' }}
          />
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={primaryAction} disabled={primaryDisabled} style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: 'none', backgroundColor: primaryDisabled ? '#CBD5E1' : '#003097', color: '#FFFFFF', cursor: primaryDisabled ? 'not-allowed' : 'pointer' }}>{primaryLabel}</button>
          <button onClick={resetModalState} style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: 'none', backgroundColor: '#E5E7EB', color: '#374151', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F4F8FF', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: sidebarCollapsed ? '92px' : '280px', backgroundColor: '#F0F9FF', borderRight: '1px solid rgba(0, 48, 151, 0.08)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#003097', color: '#FFFFFF', boxShadow: '0 14px 24px rgba(0, 48, 151, 0.18)' }}>
              <Shield size={30} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#003097' }}>EduNexus</div>
                <div style={{ fontSize: '15px', color: '#6B7280' }}>group admin panel</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, padding: '18px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenuItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenuItem(item.id)}
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
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '18px', borderTop: '1px solid #E5E7EB' }}>
          <button onClick={() => setSidebarCollapsed((current) => !current)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', marginBottom: '10px', borderRadius: '16px', border: 'none', backgroundColor: '#DBEAFE', color: '#003097', cursor: 'pointer', fontSize: '16px' }}>
            {sidebarCollapsed ? <LayoutDashboard size={20} /> : <X size={20} />}
            {!sidebarCollapsed && <span>{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>}
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', backgroundColor: '#003097', color: '#FFFFFF', textDecoration: 'none', fontSize: '16px' }}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: '#003097', padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
              {activeMenuItem === 'dashboard' && 'Dashboard'}
              {activeMenuItem === 'groups' && 'Groups Management'}
              {activeMenuItem === 'reports' && 'Reports & Analytics'}
              {activeMenuItem === 'settings' && 'System Settings'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <button onClick={() => setShowNotifications((current) => !current)} style={{ width: '44px', height: '44px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </button>
            <button onClick={() => setShowProfileDropdown((current) => !current)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', cursor: 'pointer' }}>
              <UserCircle2 size={22} />
              <span>Admin</span>
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', right: '72px', top: '58px', width: '260px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)', border: '1px solid #E5E7EB' }}>
                <div style={{ fontWeight: 700, color: '#003097', marginBottom: '8px' }}>Notifications</div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Group moderation alerts will appear here.</div>
              </div>
            )}

            {showProfileDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '58px', width: '240px', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)', border: '1px solid #E5E7EB' }}>
                <button onClick={() => navigate('/admin-groups')} style={{ width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', borderRadius: '12px', cursor: 'pointer' }}>Group Admin Dashboard</button>
                <button onClick={() => navigate('/resources-admin')} style={{ width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', borderRadius: '12px', cursor: 'pointer' }}>Resources Admin</button>
              </div>
            )}
          </div>
        </header>

        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {activeMenuItem === 'dashboard' && renderDashboard()}
          {activeMenuItem === 'groups' && renderGroups()}
          {activeMenuItem === 'reports' && <div style={{ ...cardStyle, padding: '24px' }}><AdminReports /></div>}
          {activeMenuItem === 'settings' && (
            <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }}>
              <div style={{ ...iconWrap, margin: '0 auto 18px', width: '72px', height: '72px' }}><Settings size={34} /></div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>Settings</div>
              <div style={{ fontSize: '16px', color: '#6B7280' }}>Configure system settings</div>
            </div>
          )}
        </div>
      </main>

      {showDeleteModal && selectedGroup && renderModal('Delete Group', `Are you sure you want to delete "${selectedGroup.name}"? This action cannot be undone.`, 'Delete', handleDelete, !actionReason.trim(), false)}
      {showCloseModal && selectedGroup && renderModal('Close Group', `Temporarily close "${selectedGroup.name}". Members will not be able to access the group.`, 'Close', handleClose, !actionReason.trim() || !duration.trim(), true)}
      {showApproveModal && selectedGroup && renderModal('Approve Group', `Approve "${selectedGroup.name}"? This will make the group active and visible to all users.`, 'Approve', handleApprove, false, false)}
    </div>
  );
}

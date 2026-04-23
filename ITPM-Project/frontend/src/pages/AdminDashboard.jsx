import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminReports from './AdminReports'

// ─── Admin Dashboard Component ──────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [duration, setDuration] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Fetch groups from database API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/groups')
        const data = await response.json()
        
        if (data.success) {
          setGroups(data.data)
          setError('')
        } else {
          setError(data.message || 'Failed to fetch groups')
        }
      } catch (err) {
        setError('Network error. Please try again.')
        console.error('Error fetching groups:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const filtered = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
                         g.id.includes(search)
    const matchesFilter = filter === 'all' || 
                          (filter === 'pending' && !g.approved) ||
                          (filter === 'approved' && g.approved) ||
                          (filter === 'closed' && g.status === 'closed') ||
                          (filter === 'active' && g.status === 'active')
    return matchesSearch && matchesFilter
  })

  const handleDelete = async () => {
    if (!selectedGroup || !actionReason) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: actionReason })
      })
      
      if (response.ok) {
        setGroups(groups.filter(g => g.id !== selectedGroup.id))
        setShowDeleteModal(false)
        setSelectedGroup(null)
        setActionReason('')
        alert('Group deleted successfully')
      }
    } catch (err) {
      alert('Failed to delete group')
    }
  }

  const handleClose = async () => {
    if (!selectedGroup || !actionReason || !duration) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: actionReason, duration })
      })
      
      if (response.ok) {
        setGroups(groups.map(g => 
          g.id === selectedGroup.id 
            ? { ...g, status: 'closed', closeReason: actionReason, closeDuration: duration }
            : g
        ))
        setShowCloseModal(false)
        setSelectedGroup(null)
        setActionReason('')
        setDuration('')
        alert('Group closed temporarily')
      }
    } catch (err) {
      alert('Failed to close group')
    }
  }

  const handleApprove = async () => {
    if (!selectedGroup) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${selectedGroup.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setGroups(groups.map(g => 
          g.id === selectedGroup.id 
            ? { ...g, approved: true, status: 'active' }
            : g
        ))
        setShowApproveModal(false)
        setSelectedGroup(null)
        alert('Group approved successfully')
      }
    } catch (err) {
      alert('Failed to approve group')
    }
  }

  const handleReopen = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/reopen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setGroups(groups.map(g => 
          g.id === groupId 
            ? { ...g, status: 'active' }
            : g
        ))
        alert('Group reopened successfully')
      }
    } catch (err) {
      alert('Failed to reopen group')
    }
  }

  const stats = {
    total: groups.length,
    active: groups.filter(g => g.status === 'active').length,
    pending: groups.filter(g => !g.approved).length,
    closed: groups.filter(g => g.status === 'closed').length,
    projects: groups.filter(g => g.category === 'project').length,
    study: groups.filter(g => g.category === 'study').length,
    discussion: groups.filter(g => g.category === 'discussion').length
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-24' : 'w-96'} flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out shadow-2xl`} style={{ backgroundColor: '#F0F9FF' }}>
        {/* Logo */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg" style={{ backgroundColor: '#003097' }}>
              <img 
                src="/src/images/edunexus/logo.png" 
                alt="EduNexus Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>EduNexus</h1>
                <div className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>groupadmin panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'groups', icon: '👥', label: 'Groups' },
            { id: 'reports', icon: '📈', label: 'Reports' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenuItem(item.id)}
              className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 ${
                activeMenuItem === item.id 
                  ? 'text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ 
                backgroundColor: activeMenuItem === item.id ? '#003097' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '20px'
              }}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          <Link
            to="/"
            className="w-full text-left px-6 py-4 rounded-xl transition-all duration-200 flex items-center gap-4 text-white hover:shadow-lg"
            style={{ 
              backgroundColor: '#003097',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              textDecoration: 'none'
            }}
          >
            <span className="text-2xl flex-shrink-0">🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header Bar */}
        <div className="shadow-sm border-b border-gray-200 px-8 py-8 flex-shrink-0" style={{ backgroundColor: '#003097' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <h2 className="text-3xl font-bold capitalize" style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {activeMenuItem === 'dashboard' && 'Dashboard'}
                {activeMenuItem === 'groups' && 'Groups Management'}
                {activeMenuItem === 'reports' && 'Reports & Analytics'}
                {activeMenuItem === 'settings' && 'System Settings'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
             
              

              
            </div>
          </div>
        </div>

        {/* Dashboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {activeMenuItem === 'dashboard' && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Total Groups</p>
                      <p className="text-5xl font-bold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{groups.length}</p>
                      <p className="text-base mt-3" style={{ color: '#10B981', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>↑ 8% from last month</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 48, 151, 0.1)' }}>
                      <span className="text-4xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Active Groups</p>
                      <p className="text-5xl font-bold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{groups.filter(g => g.status === 'active').length}</p>
                      <p className="text-base mt-3" style={{ color: '#10B981', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>↑ 15% from last month</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(79, 195, 247, 0.1)' }}>
                      <span className="text-4xl">�</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Pending Approval</p>
                      <p className="text-5xl font-bold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{groups.filter(g => !g.approved).length}</p>
                      <p className="text-base mt-3" style={{ color: '#F59E0B', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>⚠️ Need action</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                      <span className="text-4xl">⏰</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Total Members</p>
                      <p className="text-5xl font-bold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{groups.reduce((sum, g) => sum + g.members, 0)}</p>
                      <p className="text-base mt-3" style={{ color: '#10B981', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>↑ 22% from last month</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                      <span className="text-4xl">�</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Image Section */}
              <div className="rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                <h3 className="text-2xl font-semibold mb-6" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Dashboard Overview</h3>
                <div className="flex items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: '#F0F9FF', minHeight: '400px' }}>
                  <img 
                    src="/api/placeholder/800/300" 
                    alt="Dashboard Overview" 
                    className="w-full h-full object-cover rounded-xl"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                <div className="mt-6 text-center">
                  <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>System performance and metrics overview</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <h3 className="text-2xl font-semibold mb-6" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Revenue Overview</h3>
                  <div className="h-80 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#F0F9FF' }}>
                    <div className="text-center">
                      <svg className="w-24 h-24 mx-auto mb-4" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Chart Placeholder</p>
                      <p className="text-base mt-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>Revenue trend visualization</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                  <h3 className="text-2xl font-semibold mb-6" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>User Activity</h3>
                  <div className="h-80 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#F0F9FF' }}>
                    <div className="text-center">
                      <svg className="w-24 h-24 mx-auto mb-4" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Chart Placeholder</p>
                      <p className="text-base mt-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>User activity analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold" style={{ color: '#003097', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#003097' }}>
                              JD
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>John Doe</div>
                              <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>john@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Created new group</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>2 hours ago</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4FC3F7' }}>
                              JS
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Jane Smith</div>
                              <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>jane@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Updated profile</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>5 hours ago</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(79, 195, 247, 0.1)', color: '#4FC3F7', fontFamily: 'Inter, sans-serif' }}>
                            In Progress
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#F59E0B' }}>
                              MJ
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Mike Johnson</div>
                              <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>mike@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Submitted report</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>1 day ago</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenuItem === 'groups' && (
            <div className="space-y-8">
              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search groups by name or ID..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="all">All Groups</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Groups Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Group</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>ID</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Category</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Members</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Status</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Created</th>
                        <th className="px-8 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-8 py-16 text-center">
                            <div className="text-4xl mb-4 animate-bounce">🔄</div>
                            <div className="text-gray-500" style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>Loading groups...</div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="7" className="px-8 py-16 text-center">
                            <div className="text-4xl mb-4">❌</div>
                            <div className="text-red-600">{error}</div>
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="text-2xl mb-2">�</div>
                            <div className="text-gray-500">No groups found</div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map(group => (
                          <tr key={group.id} className="hover:bg-gray-50">
                            <td className="px-8 py-6">
                              <div className="flex items-center">
                                <div
                                  className="w-14 h-14 rounded-lg flex items-center justify-center text-base font-bold text-white"
                                  style={{ background: group.leaderColor || '#3B82F6' }}
                                >
                                  {group.leaderAv || group.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="ml-6">
                                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px' }}>{group.name}</div>
                                  <div className="text-sm text-gray-500" style={{ fontSize: '14px' }}>{group.leader}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-base text-gray-900 font-mono" style={{ fontSize: '16px' }}>{group.id}</td>
                            <td className="px-8 py-6">
                              <span className="px-4 py-2 text-base font-medium rounded-full bg-blue-100 text-blue-800" style={{ fontSize: '14px' }}>
                                {group.category}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-base text-gray-900" style={{ fontSize: '16px' }}>{group.members}</td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-2 text-base font-medium rounded-full ${
                                !group.approved ? 'bg-amber-100 text-amber-800' :
                                group.status === 'closed' ? 'bg-red-100 text-red-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`} style={{ fontSize: '14px' }}>
                                {!group.approved ? 'Pending' : 
                                 group.status === 'closed' ? 'Closed' : 'Active'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-base text-gray-500" style={{ fontSize: '16px' }}>
                              {new Date(group.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex gap-3">
                                {!group.approved && (
                                  <button
                                    onClick={() => {
                                      setSelectedGroup(group)
                                      setShowApproveModal(true)
                                    }}
                                    className="px-4 py-2 bg-emerald-600 text-white text-base rounded hover:bg-emerald-700 transition-colors"
                                    style={{ fontSize: '14px' }}
                                  >
                                    Approve
                                  </button>
                                )}
                                {group.status === 'closed' && (
                                  <button
                                    onClick={() => handleReopen(group.id)}
                                    className="px-4 py-2 bg-blue-600 text-white text-base rounded hover:bg-blue-700 transition-colors"
                                    style={{ fontSize: '14px' }}
                                  >
                                    Reopen
                                  </button>
                                )}
                                {group.status === 'active' && (
                                  <button
                                    onClick={() => handleClose(group.id)}
                                    className="px-4 py-2 bg-gray-600 text-white text-base rounded hover:bg-gray-700 transition-colors"
                                    style={{ fontSize: '14px' }}
                                  >
                                    Close
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedGroup(group)
                                    setShowDeleteModal(true)
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white text-base rounded hover:bg-red-700 transition-colors"
                                  style={{ fontSize: '14px' }}
                                >
                                  Delete
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
            </div>
          )}

          {activeMenuItem === 'reports' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <AdminReports />
            </div>
          )}

          {activeMenuItem === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-5xl">⚙️</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Settings</h3>
                <p className="text-gray-500" style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>Configure system settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Group</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{selectedGroup.name}"? This action cannot be undone.
            </p>
            <textarea
              placeholder="Reason for deletion (required)"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={!actionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGroup(null)
                  setActionReason('')
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Close Group</h3>
            <p className="text-slate-600 mb-4">
              Temporarily close "{selectedGroup.name}". Members will not be able to access the group.
            </p>
            <textarea
              placeholder="Reason for closing (required)"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
              rows="3"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 7 days, 2 weeks)"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={!actionReason || !duration}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false)
                  setSelectedGroup(null)
                  setActionReason('')
                  setDuration('')
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
=======
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, Download, AlertTriangle, CheckCircle, XCircle, BarChart3, Users, FileText, TrendingUp, Calendar, Shield, Settings, LogOut, Menu, X } from 'lucide-react';

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showReportedOnly, setShowReportedOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch resources from MongoDB
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5003/api/resources');
        const data = await response.json();
        
        if (data.success) {
          setResources(data.data);
          setLoading(false);
        } else {
          setError(data.message);
          setLoading(false);
        }
      } catch (error) {
        setError('Error fetching resources');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const categories = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'];
  const statuses = ['All', 'approved', 'pending', 'reported'];

  const stats = {
    totalResources: resources.length,
    approvedResources: resources.filter(r => r.status === 'approved').length,
    pendingResources: resources.filter(r => r.status === 'pending').length,
    reportedResources: resources.filter(r => r.status === 'reported').length,
    totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
    totalViews: resources.reduce((sum, r) => sum + r.views, 0)
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || resource.status === selectedStatus;
    const matchesReports = !showReportedOnly || resource.reports.length > 0;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesReports;
  });

  const handleApprove = async (resourceId) => {
    try {
      // Update resource status in MongoDB
      const response = await fetch(`http://127.0.0.1:5003/api/resources/${resourceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' })
      });
      
      const data = await response.json();
      
      if (data.success) {
          // Update local state
          setResources(resources.map(resource => {
            if (resource._id === resourceId || resource.id === resourceId) {
              return { ...resource, status: 'approved', reports: [] };
            }
            return resource;
          }));
          alert('Resource approved successfully!');
        } else {
        alert('Error approving resource: ' + data.message);
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Error approving resource. Please try again.');
    }
  };

  const handleReject = async (resourceId) => {
    if (confirm('Are you sure you want to reject this resource? This action cannot be undone.')) {
      try {
        // Delete resource from MongoDB
        const response = await fetch(`http://127.0.0.1:5003/api/resources/${resourceId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Remove from local state
          setResources(resources.filter(resource => resource._id !== resourceId && resource.id !== resourceId));
          alert('Resource rejected and deleted from MongoDB!');
        } else {
          alert('Error rejecting resource: ' + data.message);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error rejecting resource. Please try again.');
      }
    }
  };

  const handleDismissReports = (resourceId) => {
    setResources(resources.map(resource => {
      if (resource._id === resourceId || resource.id === resourceId) {
        return { ...resource, status: 'approved', reports: [] };
      }
      return resource;
    }));
    alert('Reports dismissed and resource approved!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: '#dcfce7', color: '#166534', icon: CheckCircle };
      case 'pending': return { bg: '#fef3c7', color: '#92400e', icon: AlertTriangle };
      case 'reported': return { bg: '#fee2e2', color: '#991b1b', icon: XCircle };
      default: return { bg: '#f3f4f6', color: '#374151', icon: FileText };
    }
  };

  const viewResourceDetails = (resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const viewReports = (resource) => {
    setSelectedResource(resource);
    setShowReportsModal(true);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4ff', fontFamily: 'Sora, "DM Sans", sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '280px' : '0px', 
        backgroundColor: '#0f1b6b', 
        color: '#ffffff',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 40,
        boxShadow: '4px 0 6px -1px rgba(15, 27, 107, 0.12)'
      }}>
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
            <Shield size={28} />
            Admin Panel
          </h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              padding: '16px 20px', 
              backgroundColor: '#2563eb', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}>
              <BarChart3 size={20} />
              Dashboard
            </div>
            <div style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a2fa8';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <FileText size={20} />
              Resources
            </div>
            <div style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a2fa8';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <Users size={20} />
              Users
            </div>
            <div style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              fontWeight: '400',
              backgroundColor: showAnalytics ? '#1a2fa8' : 'transparent'
            }}
            onClick={() => setShowAnalytics(!showAnalytics)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a2fa8';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              if (!showAnalytics) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <TrendingUp size={20} />
              Analytics
            </div>
            <div style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a2fa8';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <Settings size={20} />
              Settings
            </div>
          </nav>
          
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px',
            padding: '16px 20px',
            backgroundColor: '#374151',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <LogOut size={20} />
            Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? '280px' : '0px', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          boxShadow: '0 2px 24px rgba(15, 27, 107, 0.12)', 
          borderBottom: '1px solid rgba(37, 99, 235, 0.12)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ 
                padding: '8px', 
                backgroundColor: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif' }}>Admin Dashboard</h1>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Resources</h3>
                <FileText size={24} style={{ color: '#3b82f6' }} />
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif', lineHeight: '1' }}>{stats.totalResources}</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</h3>
                <CheckCircle size={24} style={{ color: '#10b981' }} />
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif', lineHeight: '1' }}>{stats.approvedResources}</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</h3>
                <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif', lineHeight: '1' }}>{stats.pendingResources}</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reported</h3>
                <XCircle size={24} style={{ color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif', lineHeight: '1' }}>{stats.reportedResources}</p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '32px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(37, 99, 235, 0.12)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
                <input
                  type="text"
                  placeholder="Search resources by title, description, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', 
                    paddingLeft: '52px', 
                    paddingRight: '20px', 
                    paddingTop: '14px', 
                    paddingBottom: '14px', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '12px', 
                    outline: 'none', 
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #2563eb';
                    e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '2px solid #e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Filter size={20} style={{ color: '#6b7280' }} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ 
                    paddingLeft: '20px', 
                    paddingRight: '20px', 
                    paddingTop: '14px', 
                    paddingBottom: '14px', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '12px', 
                    outline: 'none', 
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #2563eb';
                    e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '2px solid #e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ 
                    paddingLeft: '20px', 
                    paddingRight: '20px', 
                    paddingTop: '14px', 
                    paddingBottom: '14px', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '12px', 
                    outline: 'none', 
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #2563eb';
                    e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '2px solid rgba(37, 99, 235, 0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: 'pointer',
                padding: '14px 20px',
                borderRadius: '12px',
                border: showReportedOnly ? '2px solid #ef4444' : '2px solid #e2e8f0',
                backgroundColor: showReportedOnly ? '#fef2f2' : '#ffffff',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}>
                <input
                  type="checkbox"
                  checked={showReportedOnly}
                  onChange={(e) => setShowReportedOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px', color: '#111827' }}>Reported Only</span>
              </label>
            </div>
          </div>

          {/* Analytics Content */}
        {showAnalytics && (
          <div style={{ 
            position: 'fixed',
            top: '0',
            left: '280px',
            right: '0',
            bottom: '0',
            backgroundColor: '#f8fafc',
            zIndex: 30,
            overflowY: 'auto',
            padding: '32px'
          }}>
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#111827', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <BarChart3 size={24} />
                Analytics Dashboard
              </h3>
              
              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px', 
                marginBottom: '32px' 
              }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <FileText style={{ color: '#3b82f6' }} size={20} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Total Resources</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                    {resources.length}
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Eye style={{ color: '#10b981' }} size={20} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Total Views</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                    {resources.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Download style={{ color: '#f59e0b' }} size={20} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Total Downloads</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                    {resources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Category Distribution */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                  Category Distribution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'].map(category => {
                    const count = resources.filter(r => r.category === category).length;
                    const percentage = resources.length > 0 ? ((count / resources.length) * 100).toFixed(1) : 0;
                    return (
                      <div key={category} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#475569' }}>{category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '100px', 
                            height: '8px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              backgroundColor: '#3b82f6',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Status Distribution */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                  Status Distribution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { status: 'approved', color: '#10b981', label: 'Approved' },
                    { status: 'pending', color: '#f59e0b', label: 'Pending' },
                    { status: 'reported', color: '#ef4444', label: 'Reported' }
                  ].map(({ status, color, label }) => {
                    const count = resources.filter(r => r.status === status).length;
                    const percentage = resources.length > 0 ? ((count / resources.length) * 100).toFixed(1) : 0;
                    return (
                      <div key={status} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#475569' }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '100px', 
                            height: '8px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              backgroundColor: color,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Table */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(37, 99, 235, 0.12)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stats</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reports</th>
                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map(resource => {
                    const statusInfo = getStatusColor(resource.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={resource.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '20px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                              {resource.title}
                            </div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px', lineHeight: '1.5' }}>
                              {resource.description.length > 80 ? resource.description.substring(0, 80) + '...' : resource.description}
                            </div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} />
                              {resource.date} • {resource.fileSize}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                              {resource.author}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              {resource.authorEmail}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af', 
                            paddingLeft: '12px', 
                            paddingRight: '12px', 
                            paddingTop: '4px', 
                            paddingBottom: '4px', 
                            borderRadius: '9999px', 
                            fontSize: '13px', 
                            fontWeight: '600' 
                          }}>
                            {resource.category}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            width: 'fit-content'
                          }}>
                            <StatusIcon size={16} />
                            {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <Download size={14} />
                              {resource.downloads} downloads
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Eye size={14} />
                              {resource.views} views
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          {resource.reports.length > 0 ? (
                            <button
                              onClick={() => viewReports(resource)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            >
                              <AlertTriangle size={14} />
                              {resource.reports.length} reports
                            </button>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>No reports</span>
                          )}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => viewResourceDetails(resource)}
                              style={{ 
                                padding: '8px', 
                                backgroundColor: '#f1f5f9', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              title="View Details"
                            >
                              <Eye size={16} style={{ color: '#64748b' }} />
                            </button>
                            
                            {resource.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(resource._id || resource.id)}
                                  style={{ 
                                    padding: '8px', 
                                    backgroundColor: '#dcfce7', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                                  title="Approve"
                                >
                                  <CheckCircle size={16} style={{ color: '#166534' }} />
                                </button>
                                <button
                                  onClick={() => handleReject(resource._id || resource.id)}
                                  style={{ 
                                    padding: '8px', 
                                    backgroundColor: '#fef2f2', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                  title="Reject"
                                >
                                  <XCircle size={16} style={{ color: '#dc2626' }} />
                                </button>
                              </>
                            )}
                            
                            {resource.status === 'reported' && (
                              <>
                                <button
                                  onClick={() => handleDismissReports(resource._id || resource.id)}
                                  style={{ 
                                    padding: '8px', 
                                    backgroundColor: '#dcfce7', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                                  title="Dismiss Reports & Approve"
                                >
                                  <CheckCircle size={16} style={{ color: '#166534' }} />
                                </button>
                                <button
                                  onClick={() => handleReject(resource._id || resource.id)}
                                  style={{ 
                                    padding: '8px', 
                                    backgroundColor: '#fef2f2', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                  title="Reject & Remove"
                                >
                                  <Trash2 size={16} style={{ color: '#dc2626' }} />
                                </button>
                              </>
                            )}
                            
                            {resource.status === 'approved' && (
                              <button
                                onClick={() => handleReject(resource._id || resource.id)}
                                style={{ 
                                  padding: '8px', 
                                  backgroundColor: '#fef2f2', 
                                  border: 'none', 
                                  borderRadius: '8px', 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                title="Remove Resource"
                              >
                                <Trash2 size={16} style={{ color: '#dc2626' }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredResources.length === 0 && (
                <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={64} style={{ margin: '0 auto 20px', color: '#cbd5e1' }} />
                  <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>No resources found</p>
                  <p style={{ fontSize: '15px' }}>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      {showDetailsModal && selectedResource && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50, 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            maxWidth: '600px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '32px', 
              borderBottom: '1px solid #e2e8f0' 
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Resource Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{ 
                  color: '#64748b', 
                  cursor: 'pointer', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                  {selectedResource.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px', fontSize: '15px' }}>
                  {selectedResource.description}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.author}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{selectedResource.authorEmail}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.category}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Date</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.date}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Size</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.fileSize}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Downloads</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.downloads}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</label>
                    <p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{selectedResource.views}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Approve Group</h3>
            <p className="text-slate-600 mb-6">
              Approve "{selectedGroup.name}"? This will make the group active and visible to all users.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedGroup(null)
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>

      {/* Reports Modal */}
      {showReportsModal && selectedResource && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50, 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            maxWidth: '600px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '32px', 
              borderBottom: '1px solid #e2e8f0' 
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Reports for "{selectedResource.title}"</h2>
              <button
                onClick={() => setShowReportsModal(false)}
                style={{ 
                  color: '#64748b', 
                  cursor: 'pointer', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px' }}>
              {selectedResource.reports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedResource.reports.map(report => (
                    <div key={report.id} style={{ 
                      backgroundColor: '#fef2f2', 
                      border: '1px solid #fecaca', 
                      borderRadius: '12px', 
                      padding: '24px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>
                            {report.reason}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#b91c1c', lineHeight: '1.5' }}>
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        Reported by {report.reporter} on {report.date}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <button
                      onClick={() => {
                        handleDismissReports(selectedResource._id || selectedResource.id);
                        setShowReportsModal(false);
                      }}
                      style={{ 
                        flex: 1, 
                        padding: '16px 24px', 
                        backgroundColor: '#dcfce7', 
                        color: '#166534', 
                        border: 'none', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                    >
                      Dismiss Reports & Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedResource.id);
                        setShowReportsModal(false);
                      }}
                      style={{ 
                        flex: 1, 
                        padding: '16px 24px', 
                        backgroundColor: '#fef2f2', 
                        color: '#dc2626', 
                        border: 'none', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    >
                      Reject & Remove Resource
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 20px' }} />
                  <p style={{ fontSize: '18px', color: '#1e293b', fontWeight: '600', marginBottom: '8px' }}>
                    No Reports Found
                  </p>
                  <p style={{ fontSize: '15px', color: '#64748b' }}>
                    This resource has not been reported by any users.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
  );
};

export default AdminDashboard;

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
            { id: 'orders', icon: '📦', label: 'Orders' },
            { id: 'products', icon: '🛍️', label: 'Products' },
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
                {activeMenuItem === 'orders' && 'Order Management'}
                {activeMenuItem === 'products' && 'Product Management'}
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

          {activeMenuItem === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-5xl">📦</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Order Management</h3>
                <p className="text-gray-500" style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>Track and manage orders</p>
              </div>
            </div>
          )}

          {activeMenuItem === 'products' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-5xl">🛍️</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Product Management</h3>
                <p className="text-gray-500" style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>Manage products and inventory</p>
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
          </div>
        </div>
      )}
    </div>
  )
}

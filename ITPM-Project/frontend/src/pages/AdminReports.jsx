import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ─── Admin Reports Page ──────────────────────────────────────────────────────
export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Initialize with some sample reports
  useEffect(() => {
    // Load reports from localStorage or initialize with sample data
    const savedReports = localStorage.getItem('group_reports')
    if (savedReports) {
      setReports(JSON.parse(savedReports))
    } else {
      // Sample reports for demonstration
      const sampleReports = [
        {
          id: 'RPT001',
          groupId: 'IT23665798',
          groupName: 'Final Year Project',
          category: 'project',
          reason: 'Inappropriate content and spam messages in group chat',
          reportedBy: 'John Doe',
          reporterId: 'IT23665799',
          reportedAt: '2024-03-15T10:30:00Z',
          status: 'pending',
          priority: 'high',
          description: 'Group members are posting spam content and inappropriate links. This is affecting the learning environment.',
          actionTaken: 'none'
        },
        {
          id: 'RPT002',
          groupId: 'IT23665800',
          groupName: 'Study Group - Mathematics',
          category: 'study',
          reason: 'False information being shared as study material',
          reportedBy: 'Jane Smith',
          reporterId: 'IT23665801',
          reportedAt: '2024-03-14T15:45:00Z',
          status: 'under_review',
          priority: 'medium',
          description: 'Members are sharing incorrect mathematical formulas and solutions that could mislead other students.',
          actionTaken: 'Investigation started'
        },
        {
          id: 'RPT003',
          groupId: 'IT23665802',
          groupName: 'Discussion Forum',
          category: 'discussion',
          reason: 'Harassment and bullying behavior',
          reportedBy: 'Mike Johnson',
          reporterId: 'IT23665803',
          reportedAt: '2024-03-13T09:20:00Z',
          status: 'resolved',
          priority: 'high',
          description: 'Multiple instances of harassment reported. Offending members have been identified.',
          actionTaken: 'Offending members removed, warning issued'
        }
      ]
      setReports(sampleReports)
      localStorage.setItem('group_reports', JSON.stringify(sampleReports))
    }
    setLoading(false)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.groupName.toLowerCase().includes(search.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
      report.reason.toLowerCase().includes(search.toLowerCase()) ||
      report.groupId.includes(search)
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = (reportId, newStatus) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
        : report
    )
    setReports(updatedReports)
    localStorage.setItem('group_reports', JSON.stringify(updatedReports))
  }

  const handleActionTaken = (reportId, action) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, actionTaken: action, updatedAt: new Date().toISOString() }
        : report
    )
    setReports(updatedReports)
    localStorage.setItem('group_reports', JSON.stringify(updatedReports))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'dismissed': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-amber-100 text-amber-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    underReview: reports.filter(r => r.status === 'under_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    high: reports.filter(r => r.priority === 'high').length
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      {/* Main Content */}
      <div className="flex-1 p-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Total Reports</p>
                <p className="text-4xl font-bold" style={{ color: '#1F2937', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{stats.total}</p>
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 48, 151, 0.1)' }}>
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Pending</p>
                <p className="text-4xl font-bold" style={{ color: '#003097', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{stats.pending}</p>
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Under Review</p>
                <p className="text-4xl font-bold" style={{ color: '#003097', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{stats.underReview}</p>
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(79, 195, 247, 0.1)' }}>
                <span className="text-3xl">👁️</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Resolved</p>
                <p className="text-4xl font-bold" style={{ color: '#003097', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{stats.resolved}</p>
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>High Priority</p>
                <p className="text-4xl font-bold" style={{ color: '#003097', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{stats.high}</p>
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <span className="text-3xl">🚨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-12" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
          <div className="flex gap-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by group name, reporter, or reason..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              style={{ fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg" style={{ boxShadow: '0 4px 6px -1px rgba(0, 48, 151, 0.1), 0 2px 4px -2px rgba(0, 48, 151, 0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Report ID</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Group Info</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Reporter</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Priority</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Status</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Date</th>
                  <th className="px-8 py-4 text-left text-base font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <div className="text-4xl mb-4 animate-bounce">🔄</div>
                      <div style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>Loading reports...</div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <div style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '18px' }}>No reports found</div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div className="font-mono text-base" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>{report.id}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <div className="font-medium text-base" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>{report.groupName}</div>
                          <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{report.groupId}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-base" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>{report.reportedBy}</span>
                          <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{report.reporterId}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 text-base font-medium rounded-full ${getPriorityColor(report.priority)}`} style={{ fontSize: '14px' }}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 text-base font-medium rounded-full border ${getStatusColor(report.status)}`} style={{ fontSize: '14px' }}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-base" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>{new Date(report.reportedAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6">
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedReport(report)
                              setShowDetails(true)
                            }}
                            className="px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                            style={{ 
                              backgroundColor: '#4FC3F7', 
                              color: '#FFFFFF', 
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              const updatedReports = reports.map(r => 
                                r.id === report.id ? { ...r, status: r.status === 'pending' ? 'under_review' : 'resolved' } : r
                              )
                              setReports(updatedReports)
                              localStorage.setItem('group_reports', JSON.stringify(updatedReports))
                            }}
                            className="px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                            style={{ 
                              backgroundColor: report.status === 'pending' ? '#F59E0B' : '#10B981', 
                              color: '#FFFFFF', 
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          >
                            {report.status === 'pending' ? 'Review' : 'Resolve'}
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

      {/* Report Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Report Details - {selectedReport.id}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Group Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Group Name</label>
                  <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.groupName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Group ID</label>
                  <div className="text-sm font-mono" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.groupId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Category</label>
                  <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.category}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Reported At</label>
                  <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{new Date(selectedReport.reportedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Reported By</label>
                  <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.reportedBy}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Reporter ID</label>
                  <div className="text-sm font-mono" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.reporterId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Priority</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Report Reason */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Report Reason</label>
                <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.reason}</div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Description</label>
                <div className="text-sm" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{selectedReport.description}</div>
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Action Taken</label>
                <textarea
                  value={selectedReport.actionTaken || ''}
                  onChange={(e) => {
                    const updatedReports = reports.map(r => 
                      r.id === selectedReport.id ? { ...r, actionTaken: e.target.value } : r
                    )
                    setReports(updatedReports)
                    localStorage.setItem('group_reports', JSON.stringify(updatedReports))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  rows="3"
                  placeholder="Describe actions taken..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: '#E5E7EB', 
                  color: '#6B7280', 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AdminReports.css'

// ─── Admin Reports Page ──────────────────────────────────────────────────────
export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')

  // Fetch groups and generate reports based on criteria
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups
        const groupsResponse = await fetch('http://localhost:5000/api/groups')
        const groupsData = await groupsResponse.json()
        
        if (groupsData.success) {
          setGroups(groupsData.data)
          
          // Generate reports based on group conditions
          const generatedReports = generateReportsFromGroups(groupsData.data || [])
          
          // Load existing reports from localStorage
          const savedReports = localStorage.getItem('group_reports')
          if (savedReports) {
            const existingReports = JSON.parse(savedReports)
            // Merge with generated reports, avoiding duplicates
            const mergedReports = [...existingReports]
            generatedReports.forEach(genReport => {
              if (!existingReports.find(r => r.groupId === genReport.groupId && r.reason === genReport.reason)) {
                mergedReports.push(genReport)
              }
            })
            setReports(mergedReports)
            localStorage.setItem('group_reports', JSON.stringify(mergedReports))
          } else {
            setReports(generatedReports)
            localStorage.setItem('group_reports', JSON.stringify(generatedReports))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to sample data
        const sampleReports = [
          {
            id: 'RPT001',
            groupId: 'IT23665798',
            groupName: 'Final Year Project',
            category: 'project',
            reason: 'Multiple reports received',
            reportedBy: 'System',
            reporterId: 'SYSTEM',
            reportedAt: new Date().toISOString(),
            status: 'pending',
            priority: 'high',
            description: 'Group has exceeded report threshold',
            actionTaken: 'none',
            canTempDelete: true
          }
        ]
        setReports(sampleReports)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Generate reports based on group conditions
  const generateReportsFromGroups = (groups) => {
    const reports = []
    
    groups.forEach(group => {
      // Count existing reports for this group
      const groupReports = reports.filter(r => r.groupId === group.id).length
      
      // Project groups with 2-3 reports
      if (group.category === 'project' && groupReports >= 2 && groupReports <= 3) {
        reports.push({
          id: `RPT${group.id}`,
          groupId: group.id,
          groupName: group.name,
          category: group.category,
          reason: `Project group has ${groupReports} reports - eligible for temporary deletion`,
          reportedBy: 'System',
          reporterId: 'SYSTEM',
          reportedAt: new Date().toISOString(),
          status: 'pending',
          priority: 'high',
          description: `Project group "${group.name}" has received ${groupReports} reports. According to policy, admin can temporarily delete this group.`,
          actionTaken: 'none',
          canTempDelete: true
        })
      }
      
      // Study/Discussion groups with 15%+ members reporting
      if ((group.category === 'study' || group.category === 'discussion') && group.panelMembers) {
        const memberCount = group.panelMembers.length
        const reportThreshold = Math.ceil(memberCount * 0.15) // 15% threshold
        
        if (groupReports >= reportThreshold) {
          reports.push({
            id: `RPT${group.id}`,
            groupId: group.id,
            groupName: group.name,
            category: group.category,
            reason: `${group.category} group has ${groupReports} reports (${Math.round((groupReports/memberCount)*100)}% of members) - eligible for temporary deletion`,
            reportedBy: 'System',
            reporterId: 'SYSTEM',
            reportedAt: new Date().toISOString(),
            status: 'pending',
            priority: 'high',
            description: `${group.category} group "${group.name}" has received reports from ${Math.round((groupReports/memberCount)*100)}% of members. According to policy, admin can temporarily delete this group.`,
            actionTaken: 'none',
            canTempDelete: true
          })
        }
      }
    })
    
    return reports
  }

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

  const handleTempDelete = async () => {
    if (!selectedGroup || !deleteReason) return

    try {
      // Call API to temporarily delete group
      const response = await fetch(`http://localhost:5000/api/groups/${selectedGroup.groupId}/temp-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: deleteReason,
          reportId: selectedReport.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update report status
        const updatedReports = reports.map(report => 
          report.id === selectedReport.id 
            ? { ...report, status: 'temp_deleted', actionTaken: `Group temporarily deleted: ${deleteReason}`, updatedAt: new Date().toISOString() }
            : report
        )
        setReports(updatedReports)
        localStorage.setItem('group_reports', JSON.stringify(updatedReports))
        
        // Close modal and reset state
        setShowDeleteModal(false)
        setSelectedGroup(null)
        setDeleteReason('')
        
        alert(`Group "${selectedGroup.groupName}" has been temporarily deleted.`)
      } else {
        alert(data.message || 'Failed to temporarily delete group')
      }
    } catch (error) {
      console.error('Error temporarily deleting group:', error)
      alert('Network error. Please try again.')
    }
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
    <div className="admin-reports-container">
      {/* Main Content */}
      <div className="flex-1 p-12">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Total Reports</p>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 48, 151, 0.1)' }}>
                <span>📊</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value">{stats.pending}</p>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <span>⏳</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Under Review</p>
                <p className="stat-value">{stats.underReview}</p>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 195, 247, 0.1)' }}>
                <span>👁️</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Resolved</p>
                <p className="stat-value">{stats.resolved}</p>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <span>✅</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">High Priority</p>
                <p className="stat-value">{stats.high}</p>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <span>🚨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-container">
          <div className="search-filter-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by group name, reporter, or reason..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="filter-select"
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
        <div className="reports-table-container">
          <div className="overflow-x-auto">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Group Info</th>
                  <th>Reporter</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-state">
                      <div className="loading-icon">🔄</div>
                      <div className="loading-text">Loading reports...</div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <div className="empty-text">No reports found</div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <div className="report-id">{report.id}</div>
                      </td>
                      <td>
                        <div className="group-info">
                          <div className="group-name">{report.groupName}</div>
                          <div className="group-id">{report.groupId}</div>
                        </div>
                      </td>
                      <td>
                        <div className="reporter-info">
                          <span className="reporter-name">{report.reportedBy}</span>
                          <div className="reporter-id">{report.reporterId}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`priority-badge ${report.priority}`}>
                          {report.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${report.status}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(report.reportedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setSelectedReport(report)
                              setShowDetails(true)
                            }}
                            className="btn btn-view-details"
                          >
                            View Details
                          </button>
                          {report.canTempDelete && report.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedReport(report)
                                setSelectedGroup({
                                  groupId: report.groupId,
                                  groupName: report.groupName,
                                  category: report.category
                                })
                                setShowDeleteModal(true)
                              }}
                              className="btn btn-temp-delete"
                            >
                              Temp Delete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const updatedReports = reports.map(r => 
                                r.id === report.id ? { ...r, status: r.status === 'pending' ? 'under_review' : 'resolved' } : r
                              )
                              setReports(updatedReports)
                              localStorage.setItem('group_reports', JSON.stringify(updatedReports))
                            }}
                            className={`btn ${report.status === 'pending' ? 'btn-review' : 'btn-resolve'}`}
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
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Report Details - {selectedReport.id}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="modal-close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              {/* Group Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Group Name</label>
                  <div className="form-value">{selectedReport.groupName}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Group ID</label>
                  <div className="form-value">{selectedReport.groupId}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="form-value">{selectedReport.category}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reported At</label>
                  <div className="form-value">{new Date(selectedReport.reportedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Reporter Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Reported By</label>
                  <div className="form-value">{selectedReport.reportedBy}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reporter ID</label>
                  <div className="form-value">{selectedReport.reporterId}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <span className={`priority-badge ${selectedReport.priority}`}>
                    {selectedReport.priority}
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <span className={`status-badge ${selectedReport.status}`}>
                    {selectedReport.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Report Reason */}
              <div className="form-group">
                <label className="form-label">Report Reason</label>
                <div className="form-value">{selectedReport.reason}</div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="form-value">{selectedReport.description}</div>
              </div>

              {/* Action Taken */}
              <div className="form-group">
                <label className="form-label">Action Taken</label>
                <textarea
                  value={selectedReport.actionTaken || ''}
                  onChange={(e) => {
                    const updatedReports = reports.map(r => 
                      r.id === selectedReport.id ? { ...r, actionTaken: e.target.value } : r
                    )
                    setReports(updatedReports)
                    localStorage.setItem('group_reports', JSON.stringify(updatedReports))
                  }}
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe actions taken..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                onClick={() => setShowDetails(false)}
                className="btn btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Delete Modal */}
      {showDeleteModal && selectedGroup && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '28rem' }}>
            <div className="modal-header">
              <h3 className="modal-title">Temporarily Delete Group</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGroup(null)
                  setDeleteReason('')
                }}
                className="modal-close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to temporarily delete <strong>{selectedGroup.groupName}</strong>?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This action can be reversed later. Group will be inaccessible but not permanently deleted.
              </p>
              
              <div className="form-group">
                <label className="form-label">Reason for temporary deletion</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter reason..."
                  required
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGroup(null)
                  setDeleteReason('')
                }}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleTempDelete}
                disabled={!deleteReason}
                className="btn btn-delete"
              >
                Temporarily Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

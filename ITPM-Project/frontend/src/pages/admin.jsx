import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Filter,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';

const shell = { backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid rgba(37,99,235,0.12)' };
const button = { border: 'none', borderRadius: '8px', cursor: 'pointer' };
const categories = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'];
const statuses = ['All', 'approved', 'pending', 'reported'];

const ResourcesAdmin = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showReportedOnly, setShowReportedOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/resources');
        const data = await response.json();
        if (data.success) {
          setResources(Array.isArray(data.data) ? data.data : []);
        } else {
          setError(data.message || 'Error fetching resources');
        }
      } catch {
        setError('Error fetching resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const reports = Array.isArray(resource.reports) ? resource.reports : [];
      const haystack = `${resource.title || ''} ${resource.description || ''} ${resource.author || ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'All' || resource.category === selectedCategory) &&
        (selectedStatus === 'All' || resource.status === selectedStatus) &&
        (!showReportedOnly || reports.length > 0);
    });
  }, [resources, searchTerm, selectedCategory, selectedStatus, showReportedOnly]);

  const stats = useMemo(() => ({
    totalResources: resources.length,
    approvedResources: resources.filter((r) => r.status === 'approved').length,
    pendingResources: resources.filter((r) => r.status === 'pending').length,
    reportedResources: resources.filter((r) => r.status === 'reported').length,
    totalDownloads: resources.reduce((sum, r) => sum + (r.downloads || 0), 0),
    totalViews: resources.reduce((sum, r) => sum + (r.views || 0), 0),
  }), [resources]);

  const statusStyles = (status) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', color: '#166534', icon: CheckCircle };
      case 'pending': return { bg: '#fef3c7', color: '#92400e', icon: AlertTriangle };
      case 'reported': return { bg: '#fee2e2', color: '#991b1b', icon: XCircle };
      default: return { bg: '#f3f4f6', color: '#374151', icon: FileText };
    }
  };

  const patchLocalResource = (resourceId, updater) => {
    setResources((current) => current.map((resource) => (
      resource._id === resourceId || resource.id === resourceId ? updater(resource) : resource
    )));
  };

  const handleApprove = async (resourceId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/resources/${resourceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      const data = await response.json();
      if (data.success) {
        patchLocalResource(resourceId, (resource) => ({ ...resource, status: 'approved', reports: [] }));
        alert('Resource approved successfully!');
      } else {
        alert(`Error approving resource: ${data.message}`);
      }
    } catch {
      alert('Error approving resource. Please try again.');
    }
  };

  const handleReject = async (resourceId) => {
    if (!confirm('Are you sure you want to reject this resource? This action cannot be undone.')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/resources/${resourceId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setResources((current) => current.filter((resource) => resource._id !== resourceId && resource.id !== resourceId));
        alert('Resource rejected and deleted from MongoDB!');
      } else {
        alert(`Error rejecting resource: ${data.message}`);
      }
    } catch {
      alert('Error rejecting resource. Please try again.');
    }
  };

  const handleDismissReports = (resourceId) => {
    patchLocalResource(resourceId, (resource) => ({ ...resource, status: 'approved', reports: [] }));
    alert('Reports dismissed and resource approved!');
  };

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div style={{ ...shell, padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</h3>
        <Icon size={24} style={{ color }} />
      </div>
      <p style={{ fontSize: '36px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>{value}</p>
    </div>
  );

  const ModalShell = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{ ...button, backgroundColor: 'transparent', padding: '8px', color: '#64748b' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '32px' }}>{children}</div>
      </div>
    </div>
  );

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#475569' }}>Loading resources...</div>;
  if (error) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#b91c1c' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4ff', fontFamily: 'Sora, "DM Sans", sans-serif' }}>
      <div style={{ width: sidebarOpen ? '280px' : '0px', backgroundColor: '#0f1b6b', color: '#ffffff', transition: 'width 0.3s ease', overflow: 'hidden', position: 'fixed', height: '100vh', zIndex: 40, boxShadow: '4px 0 6px -1px rgba(15,27,107,0.12)' }}>
        <div style={{ padding: '32px 24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}><Shield size={28} />Resources Admin</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '16px 20px', backgroundColor: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600' }}><BarChart3 size={20} />Resources Admin</div>
            <div onClick={() => setShowAnalytics(!showAnalytics)} style={{ padding: '16px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: showAnalytics ? '#1a2fa8' : 'transparent' }}><TrendingUp size={20} />Analytics</div>
            <div onClick={() => setShowSettings(!showSettings)} style={{ padding: '16px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: showSettings ? '#1a2fa8' : 'transparent' }}><Settings size={20} />Settings</div>
          </nav>
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', padding: '16px 20px', backgroundColor: '#374151', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}><LogOut size={20} />Logout</div>
        </div>
      </div>

      <div style={{ flex: 1, marginLeft: sidebarOpen ? '280px' : '0px', transition: 'margin-left 0.3s ease' }}>
        <div style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 24px rgba(15,27,107,0.12)', borderBottom: '1px solid rgba(37,99,235,0.12)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ ...button, backgroundColor: 'transparent', padding: '8px' }}>{sidebarOpen ? <X size={24} /> : <Menu size={24} />}</button>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>Resources Admin</h1>
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Last updated: {new Date().toLocaleString()}</div>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <StatCard label="Total Resources" value={stats.totalResources} icon={FileText} color="#3b82f6" />
            <StatCard label="Approved" value={stats.approvedResources} icon={CheckCircle} color="#10b981" />
            <StatCard label="Pending" value={stats.pendingResources} icon={AlertTriangle} color="#f59e0b" />
            <StatCard label="Reported" value={stats.reportedResources} icon={XCircle} color="#ef4444" />
          </div>

          <div style={{ ...shell, padding: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search resources by title, description, or author..." style={{ width: '100%', padding: '14px 20px 14px 52px', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none', fontSize: '15px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Filter size={20} style={{ color: '#6b7280' }} />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '12px' }}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
              </div>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '12px' }}>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 20px', borderRadius: '12px', border: showReportedOnly ? '2px solid #ef4444' : '2px solid #e2e8f0', backgroundColor: showReportedOnly ? '#fef2f2' : '#ffffff' }}>
                <input type="checkbox" checked={showReportedOnly} onChange={(e) => setShowReportedOnly(e.target.checked)} />
                <span>Reported Only</span>
              </label>
            </div>
          </div>

          {showAnalytics && (
            <div style={{ ...shell, padding: '32px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart3 size={24} />Analytics Dashboard</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <StatCard label="Total Resources" value={stats.totalResources} icon={FileText} color="#3b82f6" />
                <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} color="#10b981" />
                <StatCard label="Total Downloads" value={stats.totalDownloads.toLocaleString()} icon={Download} color="#f59e0b" />
              </div>
            </div>
          )}

          {showSettings && (
            <ModalShell title="Settings" onClose={() => setShowSettings(false)}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>General Settings</h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>Manage your admin dashboard preferences and system settings</p>
                </div>
                <input type="number" defaultValue="50" style={{ padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', maxWidth: '200px' }} />
                <input type="text" defaultValue="StudyNexus" style={{ padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', maxWidth: '300px' }} />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowSettings(false)} style={{ ...button, padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Cancel</button>
                  <button style={{ ...button, padding: '10px 20px', backgroundColor: '#3b82f6', color: '#ffffff' }}>Save Changes</button>
                </div>
              </div>
            </ModalShell>
          )}

          <div style={{ ...shell, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    {['Resource', 'Author', 'Category', 'Status', 'Stats', 'Reports', 'Actions'].map((heading) => (
                      <th key={heading} style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => {
                    const reports = Array.isArray(resource.reports) ? resource.reports : [];
                    const statusInfo = statusStyles(resource.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={resource._id || resource.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{resource.title}</div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px', lineHeight: '1.5' }}>{(resource.description || '').length > 80 ? `${resource.description.substring(0, 80)}...` : resource.description}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} />{resource.uploadDate ? new Date(resource.uploadDate).toLocaleDateString() : "N/A"} • {resource.fileSize}</div>
                        </td>
                        <td style={{ padding: '20px' }}><div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{resource.author}</div><div style={{ fontSize: '13px', color: '#64748b' }}>{resource.authorEmail}</div></td>
                        <td style={{ padding: '20px' }}><span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>{resource.category}</span></td>
                        <td style={{ padding: '20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: statusInfo.bg, color: statusInfo.color, padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', width: 'fit-content' }}><StatusIcon size={16} />{resource.status}</div></td>
                        <td style={{ padding: '20px', fontSize: '13px', color: '#64748b' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Download size={14} />{resource.downloads || 0} downloads</div><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={14} />{resource.views || 0} views</div></td>
                        <td style={{ padding: '20px' }}>{reports.length > 0 ? <button onClick={() => { setSelectedResource(resource); setShowReportsModal(true); }} style={{ ...button, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}><AlertTriangle size={14} />{reports.length} reports</button> : <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>No reports</span>}</td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setSelectedResource(resource); setShowDetailsModal(true); }} style={{ ...button, padding: '8px', backgroundColor: '#f1f5f9' }} title="View Details"><Eye size={16} style={{ color: '#64748b' }} /></button>
                            {resource.status === 'pending' && <button onClick={() => handleApprove(resource._id || resource.id)} style={{ ...button, padding: '8px', backgroundColor: '#dcfce7' }} title="Approve"><CheckCircle size={16} style={{ color: '#166534' }} /></button>}
                            {resource.status !== 'pending' && resource.status !== 'approved' && <button onClick={() => handleDismissReports(resource._id || resource.id)} style={{ ...button, padding: '8px', backgroundColor: '#dcfce7' }} title="Dismiss"><CheckCircle size={16} style={{ color: '#166534' }} /></button>}
                            <button onClick={() => handleReject(resource._id || resource.id)} style={{ ...button, padding: '8px', backgroundColor: '#fef2f2' }} title="Remove"><Trash2 size={16} style={{ color: '#dc2626' }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredResources.length === 0 && <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}><FileText size={64} style={{ margin: '0 auto 20px', color: '#cbd5e1' }} /><p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>No resources found</p><p style={{ fontSize: '15px' }}>Try adjusting your search or filters</p></div>}
            </div>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedResource && (
        <ModalShell title="Resource Details" onClose={() => setShowDetailsModal(false)}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>{selectedResource.title}</h3>
          <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px', fontSize: '15px' }}>{selectedResource.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              ['Author', selectedResource.author],
              ['Category', selectedResource.category],
              ['Upload Date', selectedResource.uploadDate ? new Date(selectedResource.uploadDate).toLocaleDateString() : 'N/A'],
              ['File Size', selectedResource.fileSize],
              ['Downloads', selectedResource.downloads],
              ['Views', selectedResource.views],
            ].map(([label, value]) => (
              <div key={label}><label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label><p style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>{value}</p>{label === 'Author' && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{selectedResource.authorEmail}</p>}</div>
            ))}
          </div>
        </ModalShell>
      )}

      {showReportsModal && selectedResource && (
        <ModalShell title={`Reports for "${selectedResource.title}"`} onClose={() => setShowReportsModal(false)}>
          {Array.isArray(selectedResource.reports) && selectedResource.reports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedResource.reports.map((report, index) => (
                <div key={report.id || index} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: '700', marginBottom: '10px' }}><AlertTriangle size={18} />Report {index + 1}</div>
                  <p style={{ color: '#7f1d1d', lineHeight: '1.6', marginBottom: '10px' }}>{report.reason || report.message || 'No reason provided.'}</p>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>Reported by: {report.reportedBy || report.user || 'Anonymous'}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => { handleDismissReports(selectedResource._id || selectedResource.id); setShowReportsModal(false); }} style={{ ...button, padding: '10px 18px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '600' }}>Dismiss Reports</button>
                <button onClick={() => { handleReject(selectedResource._id || selectedResource.id); setShowReportsModal(false); }} style={{ ...button, padding: '10px 18px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: '600' }}>Delete Resource</button>
              </div>
            </div>
          ) : <div style={{ textAlign: 'center', color: '#64748b' }}>No reports available for this resource.</div>}
        </ModalShell>
      )}
    </div>
  );
};

export default ResourcesAdmin;




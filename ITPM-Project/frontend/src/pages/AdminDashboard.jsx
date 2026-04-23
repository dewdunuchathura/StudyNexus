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
  );
};

export default AdminDashboard;

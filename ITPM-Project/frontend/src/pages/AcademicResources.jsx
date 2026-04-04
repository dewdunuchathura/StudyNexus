import React, { useState, useEffect } from 'react';
import { Search, Upload, Heart, MessageCircle, Flag, Filter, X, ThumbsUp, Send, User, Calendar, FileText, Tag } from 'lucide-react';

const AcademicResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    pdfFile: null,
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleLike = async (resourceId) => {
    try {
      // Find the current resource to get its current state
      const currentResource = resources.find(r => (r._id === resourceId || r.id === resourceId));
      
      if (!currentResource) {
        alert('Resource not found');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:5003/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentLikes: currentResource.likes || 0,
          isLiked: currentResource.liked || false
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state with new like count and liked status from MongoDB
        setResources(prevResources => 
          prevResources.map(resource => {
            if (resource._id === resourceId || resource.id === resourceId) {
              return {
                ...resource,
                likes: data.data.likes,
                liked: !resource.liked
              };
            }
            return resource;
          })
        );
      } else {
        alert('Error toggling like: ' + data.message);
      }
    } catch (error) {
      console.error('Like error:', error);
      alert('Error toggling like. Please try again.');
    }
  };

  const handleReport = async (resourceId) => {
    // Show a dropdown with predefined reasons instead of a prompt
    const predefinedReasons = [
      'Inappropriate content',
      'Misleading information', 
      'Copyright violation',
      'Other'
    ];
    
    const reasonSelect = prompt(`Select a reason for reporting this resource:\n\n${predefinedReasons.map((reason, index) => `${index + 1}. ${reason}`).join('\n')}\n\nEnter the number (1-4):`);
    
    const reasonIndex = parseInt(reasonSelect) - 1;
    
    if (reasonIndex >= 0 && reasonIndex < predefinedReasons.length) {
      const selectedReason = predefinedReasons[reasonIndex];
      const description = prompt('Please provide additional details (optional):');
      
      try {
        const response = await fetch(`http://127.0.0.1:5003/api/resources/${resourceId}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reporter: 'Current User',
            reason: selectedReason,
            description: description || `Reported as: ${selectedReason}`
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update local state to show resource has been reported
          setResources(prevResources => 
            prevResources.map(resource => {
              if (resource._id === resourceId || resource.id === resourceId) {
                return { 
                  ...resource, 
                  status: 'reported', 
                  reported: true,
                  reports: [...(resource.reports || []), data.data.report]
                };
              }
              return resource;
            })
          );
          alert('Resource has been reported for review. Admin will be notified.');
        } else {
          alert('Error reporting resource: ' + data.message);
        }
      } catch (error) {
        console.error('Report error:', error);
        alert('Error reporting resource. Please try again.');
      }
    } else if (reasonSelect !== null) {
      alert('Invalid selection. Please try again.');
    }
  };

  const handleComment = async (resourceId) => {
    const commentText = newComments[resourceId];
    if (commentText && commentText.trim()) {
      try {
        const response = await fetch(`http://127.0.0.1:5003/api/resources/${resourceId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: 'Current User',
            text: commentText
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update local state with new comment from MongoDB
          setResources(prevResources => 
            prevResources.map(resource => {
              if (resource._id === resourceId || resource.id === resourceId) {
                return {
                  ...resource,
                  comments: [...resource.comments, data.data.comment]
                };
              }
              return resource;
            })
          );
          
          // Clear comment input
          setNewComments({
            ...newComments,
            [resourceId]: ''
          });
        } else {
          alert('Error adding comment: ' + data.message);
        }
      } catch (error) {
        console.error('Comment error:', error);
        alert('Error adding comment. Please try again.');
      }
    }
  };

  const handleViewPDF = (resource) => {
    if (resource.filePath) {
      setSelectedPDF({
        url: `http://127.0.0.1:5003/${resource.filePath}`,
        title: resource.title
      });
      setShowPDFModal(true);
    } else {
      alert('PDF file not available for this resource');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    // PDF file validation
    if (!formData.pdfFile) {
      errors.pdfFile = 'Please select a PDF file';
    } else if (formData.pdfFile.type !== 'application/pdf') {
      errors.pdfFile = 'Only PDF files are allowed';
    } else if (formData.pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      errors.pdfFile = 'File size must be less than 10MB';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleInputChange('pdfFile', file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('author', 'Current User');
      formDataToSend.append('authorEmail', 'user@example.com');
      
      if (formData.pdfFile) {
        formDataToSend.append('pdfFile', formData.pdfFile);
      }
      
      const response = await fetch('http://127.0.0.1:5003/api/resources', {
        method: 'POST',
        body: formDataToSend // Don't set Content-Type header, let browser set it for FormData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add new resource to local state
        setResources(prev => [data.data, ...prev]);
        
        // Reset form
        setFormData({
          title: '',
          category: '',
          pdfFile: null,
          description: ''
        });
        setFormErrors({});
        setShowUploadModal(false);
        
        alert('Resource uploaded successfully and saved to MongoDB!');
      } else {
        alert('Error uploading resource: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = (resourceId) => {
    setShowComments({
      ...showComments,
      [resourceId]: !showComments[resourceId]
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4ff', fontFamily: 'Sora, "DM Sans", sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 24px rgba(15, 27, 107, 0.12)', borderBottom: '1px solid rgba(37, 99, 235, 0.12)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Sora, sans-serif' }}>Academic Resources</h1>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#ffffff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif', fontWeight: '700' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1a2fa8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <Upload size={20} />
              Upload Resource
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '2px solid rgba(37, 99, 235, 0.12)', borderRadius: '12px', outline: 'none', fontSize: '14px', fontFamily: 'Sora, "DM Sans", sans-serif', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} style={{ color: '#6b7280' }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '2px solid rgba(37, 99, 235, 0.12)', borderRadius: '12px', outline: 'none', fontSize: '14px', cursor: 'pointer', fontFamily: 'Sora, "DM Sans", sans-serif', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Feed */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', paddingTop: '24px', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredResources.map(resource => (
            <div key={resource._id || resource.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
            >
              {/* Resource Header */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{resource.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={16} />
                        <span>{resource.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={16} />
                        <span>{resource.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={16} />
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
                          {resource.category}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.5' }}>{resource.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
                      onClick={() => handleViewPDF(resource)}
                    >
                      <FileText size={16} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>View PDF Document</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => handleLike(resource._id || resource.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '14px', fontWeight: '500',
                        backgroundColor: resource.liked ? '#dbeafe' : '#f3f4f6',
                        color: resource.liked ? '#2563eb' : '#4b5563'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = resource.liked ? '#bfdbfe' : '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = resource.liked ? '#dbeafe' : '#f3f4f6';
                      }}
                    >
                      <ThumbsUp size={18} style={{ fill: resource.liked ? 'currentColor' : 'none' }} />
                      <span style={{ fontWeight: '500' }}>{resource.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(resource._id || resource.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '14px', fontWeight: '500', backgroundColor: '#f3f4f6', color: '#4b5563' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      <MessageCircle size={18} />
                      <span style={{ fontWeight: '500' }}>{resource.comments ? resource.comments.length : 0}</span>
                    </button>
                    <button
                      onClick={() => handleReport(resource._id || resource.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '14px', fontWeight: '500',
                        backgroundColor: resource.reported ? '#fee2e2' : '#f3f4f6',
                        color: resource.reported ? '#dc2626' : '#4b5563'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = resource.reported ? '#fecaca' : '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = resource.reported ? '#fee2e2' : '#f3f4f6';
                      }}
                    >
                      <Flag size={18} style={{ fill: resource.reported ? 'currentColor' : 'none' }} />
                      <span style={{ fontWeight: '500' }}>Report</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[resource._id || resource.id] && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {(resource.comments || []).map(comment => (
                        <div key={comment._id || comment.id} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{comment.author}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(comment.createdAt || comment.date).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.4' }}>{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComments[resource._id || resource.id] || ''}
                        onChange={(e) => setNewComments({ ...newComments, [resource._id || resource.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(resource._id || resource.id)}
                        style={{ flex: 1, paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '14px' }}
                        onFocus={(e) => {
                      e.target.style.border = '2px solid #2563eb';
                      e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)';
                    }}
                        onBlur={(e) => {
                      e.target.style.border = '2px solid rgba(37, 99, 235, 0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                      />
                      <button
                        onClick={() => handleComment(resource._id || resource.id)}
                        style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#1a2fa8'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '672px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Upload Academic Resource</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ color: '#9ca3af', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', padding: '4px' }}
                onMouseEnter={(e) => e.target.style.color = '#4b5563'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmit}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '12px', 
                      paddingRight: '12px', 
                      paddingTop: '8px', 
                      paddingBottom: '8px', 
                      border: formErrors.title ? '2px solid #ef4444' : '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      outline: 'none', 
                      fontSize: '14px' 
                    }}
                    onFocus={(e) => {
                      if (!formErrors.title) e.target.style.border = '2px solid #3b82f6';
                    }}
                    onBlur={(e) => {
                      if (!formErrors.title) e.target.style.border = '1px solid #d1d5db';
                    }}
                    placeholder="Enter resource title"
                  />
                  {formErrors.title && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.title}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '12px', 
                      paddingRight: '12px', 
                      paddingTop: '8px', 
                      paddingBottom: '8px', 
                      border: formErrors.category ? '2px solid #ef4444' : '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      outline: 'none', 
                      fontSize: '14px', 
                      cursor: 'pointer' 
                    }}
                    onFocus={(e) => {
                      if (!formErrors.category) e.target.style.border = '2px solid #3b82f6';
                    }}
                    onBlur={(e) => {
                      if (!formErrors.category) e.target.style.border = '1px solid #d1d5db';
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.category}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>PDF File</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '12px', 
                      paddingRight: '12px', 
                      paddingTop: '8px', 
                      paddingBottom: '8px', 
                      border: formErrors.pdfFile ? '2px solid #ef4444' : '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      outline: 'none', 
                      fontSize: '14px' 
                    }}
                    onFocus={(e) => {
                      if (!formErrors.pdfFile) e.target.style.border = '2px solid #3b82f6';
                    }}
                    onBlur={(e) => {
                      if (!formErrors.pdfFile) e.target.style.border = '1px solid #d1d5db';
                    }}
                  />
                  {formData.pdfFile && !formErrors.pdfFile && (
                    <div style={{ color: '#059669', fontSize: '12px', marginTop: '4px' }}>
                      Selected: {formData.pdfFile.name} ({(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  {formErrors.pdfFile && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.pdfFile}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    style={{ 
                      width: '100%', 
                      paddingLeft: '12px', 
                      paddingRight: '12px', 
                      paddingTop: '8px', 
                      paddingBottom: '8px', 
                      border: formErrors.description ? '2px solid #ef4444' : '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      outline: 'none', 
                      fontSize: '14px', 
                      resize: 'vertical', 
                      minHeight: '96px' 
                    }}
                    onFocus={(e) => {
                      if (!formErrors.description) e.target.style.border = '2px solid #3b82f6';
                    }}
                    onBlur={(e) => {
                      if (!formErrors.description) e.target.style.border = '1px solid #d1d5db';
                    }}
                    placeholder="Describe your resource..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formData.description.length}/500 characters
                    </div>
                    {formErrors.description && (
                      <div style={{ color: '#ef4444', fontSize: '12px' }}>
                        {formErrors.description}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    style={{ flex: 1, paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ 
                      flex: 1, 
                      paddingLeft: '16px', 
                      paddingRight: '16px', 
                      paddingTop: '8px', 
                      paddingBottom: '8px', 
                      backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb', 
                      color: '#ffffff', 
                      borderRadius: '8px', 
                      border: 'none', 
                      cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                      transition: 'background-color 0.2s',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.target.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.target.style.backgroundColor = '#2563eb';
                    }}
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {showPDFModal && selectedPDF && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '90%',
            height: '90%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {selectedPDF.title}
              </h3>
              <button
                onClick={() => setShowPDFModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>
            
            {/* PDF Content */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflow: 'auto'
            }}>
              <iframe
                src={selectedPDF.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title={selectedPDF.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicResources;

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FileUpload from '../components/chat/FileUpload.jsx'
import VoiceRecorder from '../components/chat/VoiceRecorder.jsx'

// ─── Constants (same rules as CreateGroup.jsx) ───────────────────────
const PREFIXES = ['it', 'bm', 'hs', 'en']
const idRegex = new RegExp(`^(${PREFIXES.join('|')})\\d{8}$`, 'i')

const CAT_STYLES = {
  project:    { chip: 'bg-indigo-50 text-indigo-700 border border-indigo-200',   dot: 'bg-indigo-500',  header: 'from-indigo-500 to-blue-500'  },
  study:      { chip: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', header: 'from-emerald-500 to-teal-500'  },
  discussion: { chip: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: 'bg-amber-500',   header: 'from-amber-500 to-orange-500'  },
}

// ─── Group Card Component (same as AllGroups) ─────────────────────────────
function GroupCard({ group, onOpen }) {
  const cat = CAT_STYLES[group.category]

  return (
    <div
      onClick={() => onOpen(group)}
      className="group relative bg-white/90 backdrop-blur rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105 hover:-translate-y-2"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cat.header} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Animated corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${cat.header} rounded-bl-full opacity-0 group-hover:opacity-20 transition-all duration-300 transform translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0`} />

      {/* Colour stripe with animation */}
      <div className={`h-2 bg-gradient-to-r ${cat.header} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.header} flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {group.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-bold leading-tight transition-colors duration-300" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{group.name}</div>
              <div className="font-mono text-sm mt-1" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>{group.id}</div>
            </div>
          </div>
          {group.unread > 0 && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r text-white text-sm font-bold flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg" style={{ background: 'linear-gradient(to right, #003097, #4FC3F7)' }}>
              {group.unread}
            </div>
          )}
        </div>

        {/* Category + member info */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${CAT_STYLES[group.category].chip} group-hover:scale-105 transition-transform duration-300`}>
            {group.category}
          </span>
          <span className="text-sm text-slate-400 flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400">
              <path d="M8 2a4 4 0 00-4 4c0 3-1.5 4-1.5 4h11S12 9 12 6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {group.category === 'project' && group.memberLimit
              ? `${group.members}/${group.memberLimit} members`
              : `${group.members} members`}
          </span>
          {group.online > 0 && (
            <span className="flex items-center gap-2 text-sm text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {group.online} online
            </span>
          )}
        </div>

        {/* Project member bar */}
        {group.category === 'project' && group.memberLimit && (
          <div className="mb-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  Math.round((group.members / group.memberLimit) * 100) >= 100 ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : Math.round((group.members / group.memberLimit) * 100) >= 75  ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
                style={{ width: `${Math.round((group.members / group.memberLimit) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Last message */}
        <div className="text-sm text-slate-400 truncate mb-4 group-hover:text-slate-600 transition-colors duration-300">{group.lastMsg}</div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{ background: group.leaderColor }}
            >
              {group.leaderAv}
            </div>
            <span className="text-sm text-slate-400 truncate max-w-[120px] group-hover:text-slate-600 transition-colors duration-300">{group.leader}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{group.time}</span>
            <button
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:scale-105 duration-300"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main GroupJoined page ──────────────────────────────────────────────
export default function GroupJoined() {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [activeView, setActiveView] = useState('chat') // 'chat' or 'settings'
  const [showLeaderChange, setShowLeaderChange] = useState(false)
  const [selectedLeader, setSelectedLeader] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showReportGroup, setShowReportGroup] = useState(false)
  const [showExitGroup, setShowExitGroup] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [exitReason, setExitReason] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [groupMessages, setGroupMessages] = useState({}) // Store messages per group
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false) // Flag to prevent duplication

  // Fetch groups from database API
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      setError('')
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
  }, []) // Remove searchParams dependency to avoid re-fetching

  // Auto-select group if groupId is in URL
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      if (groupId) {
        const group = groups.find(g => g.id === groupId)
        if (group) {
          setSelectedGroup(group)
        }
      }
    }
  }, [groups, selectedGroup, groupId])

  // Load messages when group is selected
  useEffect(() => {
    if (selectedGroup) {
      // First try to load from localStorage
      const storedMessages = localStorage.getItem(`group_messages_${selectedGroup.id}`)
      if (storedMessages && !groupMessages[selectedGroup.id]) {
        setIsLoadingFromStorage(true)
        try {
          const messages = JSON.parse(storedMessages)
          setGroupMessages(prev => ({
            ...prev,
            [selectedGroup.id]: messages
          }))
          
          // Update group with stored messages only if group doesn't already have messages
          if (!selectedGroup.messages || selectedGroup.messages.length === 0) {
            const updatedGroup = {
              ...selectedGroup,
              messages: messages
            }
            setSelectedGroup(updatedGroup)
            setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
          }
        } catch (error) {
          console.error('Error loading messages from localStorage:', error)
        } finally {
          setIsLoadingFromStorage(false)
        }
      }
      
      // Load from database if not already loaded
      if (!groupMessages[selectedGroup.id]) {
        loadGroupMessages(selectedGroup.id)
      }
    }
  }, [selectedGroup]) // Only load if group changes and messages not already loaded

  // Load messages for a specific group from database
  const loadGroupMessages = async (groupId) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`http://localhost:5000/api/chat/groups/${groupId}/messages`)
      const data = await response.json()
      
      if (data.success) {
        setGroupMessages(prev => ({
          ...prev,
          [groupId]: data.data.reverse() // Reverse to show oldest first
        }))
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const filtered = useMemo(() => {
    return groups.filter(g =>
      (g.name.toLowerCase().includes(search.toLowerCase()) || g.id.includes(search))
    )
  }, [groups, search])

  const onlineCount = groups.reduce((a, g) => a + g.online, 0)
  const projectCount = groups.filter(g => g.category === 'project').length
  const studyCount = groups.filter(g => g.category === 'study').length
  const discussionCount = groups.filter(g => g.category === 'discussion').length

  // Action handlers
  const handleExportGroup = useCallback(() => {
    if (!selectedGroup) return
    
    const groupData = {
      id: selectedGroup.id,
      name: selectedGroup.name,
      category: selectedGroup.category,
      members: selectedGroup.members,
      online: selectedGroup.online,
      leader: selectedGroup.leader,
      createdAt: selectedGroup.createdAt,
      description: selectedGroup.description,
      avatar: selectedGroup.avatar
    }
    
    const dataStr = JSON.stringify(groupData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedGroup.name}-export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert(`Group "${selectedGroup.name}" exported successfully!`)
  }, [selectedGroup])

  const handleAddMember = () => {
    if (!selectedGroup || !newMemberEmail.trim()) return
    
    // Simulate adding member (in real app, this would call API)
    const newMember = {
      id: `IT${Math.floor(Math.random() * 10000000)}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: 'member',
      online: false,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      av: newMemberEmail.split('@')[0].slice(0, 2).toUpperCase()
    }
    
    const updatedGroup = {
      ...selectedGroup,
      members: selectedGroup.members + 1,
      panelMembers: [...(selectedGroup.panelMembers || []), newMember]
    }
    
    setSelectedGroup(updatedGroup)
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
    setNewMemberEmail('')
    setShowAddMember(false)
    
    alert(`${newMember.name} has been added to the group!`)
  }

  const handleReportGroup = () => {
    if (!selectedGroup || !reportReason.trim()) return
    
    // Generate unique report ID
    const reportId = `RPT${Date.now()}`
    
    // Create report data
    const reportData = {
      id: reportId,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      category: selectedGroup.category,
      reason: reportReason,
      description: reportReason, // Using reason as description for now
      reportedBy: 'Current User',
      reporterId: 'IT23665798', // Current user ID
      reportedAt: new Date().toISOString(),
      status: 'pending',
      priority: 'medium', // Default priority
      actionTaken: 'none'
    }
    
    // Get existing reports from localStorage
    const existingReports = JSON.parse(localStorage.getItem('group_reports') || '[]')
    
    // Add new report
    const updatedReports = [...existingReports, reportData]
    
    // Save to localStorage
    localStorage.setItem('group_reports', JSON.stringify(updatedReports))
    
    console.log('Group Report:', reportData)
    setReportReason('')
    setShowReportGroup(false)
    
    alert(`Group "${selectedGroup.name}" has been reported. Report ID: ${reportId}`)
  }

  const handleExitGroup = () => {
    if (!selectedGroup || !exitReason.trim()) return
    
    // Simulate exiting group (in real app, this would call API)
    const exitData = {
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      reason: exitReason,
      exitedBy: 'Current User',
      exitedAt: new Date().toISOString()
    }
    
    console.log('Group Exit:', exitData)
    
    // Remove group from user's groups list
    setGroups(groups.filter(g => g.id !== selectedGroup.id))
    setSelectedGroup(null)
    setExitReason('')
    setShowExitGroup(false)
    
    alert(`You have left group "${selectedGroup.name}".`)
  }

  // File handling functions
  const handleFileSelect = (files) => {
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0 || !selectedGroup) return
    
    try {
      // Create message object for API
      const messageData = {
        groupId: selectedGroup.id,
        senderId: 'JD',
        senderName: 'James Doe',
        senderAvatar: 'JD',
        senderColor: '#3B82F6',
        messageType: attachedFiles.length > 0 ? 'file' : 'text',
        content: inputMessage.trim(),
        files: attachedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          url: f.url
        }))
      }
      
      // Try to send to database first
      try {
        const response = await fetch('http://localhost:5000/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Add message to local state from database
          const newMessage = {
            ...data.data,
            isOwn: true
          }
          
          setGroupMessages(prev => ({
            ...prev,
            [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage]
          }))
          
          // Also add to group's message array for persistence
          const updatedGroup = {
            ...selectedGroup,
            messages: [...(selectedGroup.messages || []), newMessage]
          }
          setSelectedGroup(updatedGroup)
          setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
          
          // Only save to localStorage if not loading from storage (prevents duplication)
          if (!isLoadingFromStorage) {
            localStorage.setItem(`group_messages_${selectedGroup.id}`, JSON.stringify(updatedGroup.messages))
          }
          
          console.log('Message saved to database:', data.data)
        } else {
          throw new Error(data.message || 'Database save failed')
        }
      } catch (dbError) {
        console.warn('Database save failed, using localStorage:', dbError.message)
        
        // Fallback: Save to localStorage and local state
        const localMessage = {
          id: `msg_${Date.now()}`,
          groupId: selectedGroup.id,
          senderId: 'JD',
          senderName: 'James Doe',
          senderAvatar: 'JD',
          senderColor: '#3B82F6',
          messageType: attachedFiles.length > 0 ? 'file' : 'text',
          content: inputMessage.trim(),
          files: attachedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url
          })),
          timestamp: new Date(),
          isOwn: true,
          isLocal: true // Mark as locally saved
        }
        
        setGroupMessages(prev => ({
          ...prev,
          [selectedGroup.id]: [...(prev[selectedGroup.id] || []), localMessage]
        }))
        
        // Also add to group's message array for persistence
        const updatedGroup = {
          ...selectedGroup,
          messages: [...(selectedGroup.messages || []), localMessage]
        }
        setSelectedGroup(updatedGroup)
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
        
        // Only save to localStorage if not loading from storage (prevents duplication)
        if (!isLoadingFromStorage) {
          localStorage.setItem(`group_messages_${selectedGroup.id}`, JSON.stringify(updatedGroup.messages))
        }
        
        console.log('Message saved locally:', localMessage)
      }
      
      // Clear input and files
      setInputMessage('')
      setAttachedFiles([])
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Don't show alert for fallback mode
      if (!error.message.includes('Database save failed')) {
        alert('Failed to send message. Please try again.')
      }
    }
  }

  // Voice message handling
  const sendVoiceMessage = async (voiceData) => {
    if (!selectedGroup) return
    
    try {
      // Create voice message object for API
      const voiceMessageData = {
        groupId: selectedGroup.id,
        senderId: 'JD',
        senderName: 'James Doe',
        senderAvatar: 'JD',
        senderColor: '#3B82F6',
        messageType: 'audio',
        content: '', // Voice messages don't have text content
        fileUrl: voiceData.audioUrl,
        fileName: `voice_${Date.now()}.webm`,
        fileSize: voiceData.audioBlob.size,
        mimeType: 'audio/webm',
        duration: voiceData.duration,
        waveform: voiceData.waveform
      }
      
      // Send to database
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(voiceMessageData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Add voice message to local state
        const newVoiceMessage = {
          ...data.data,
          isOwn: true,
          voice: {
            url: voiceData.audioUrl,
            duration: voiceData.duration,
            size: voiceData.audioBlob.size,
            waveform: voiceData.waveform
          }
        }
        
        setGroupMessages(prev => ({
          ...prev,
          [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newVoiceMessage]
        }))
        
        console.log('Voice message saved to database:', data.data)
      } else {
        // Fallback: Save to local state only
        const localVoiceMessage = {
          id: `voice_${Date.now()}`,
          groupId: selectedGroup.id,
          senderId: 'JD',
          senderName: 'James Doe',
          senderAvatar: 'JD',
          senderColor: '#3B82F6',
          messageType: 'audio',
          content: '',
          fileUrl: voiceData.audioUrl,
          fileName: `voice_${Date.now()}.webm`,
          fileSize: voiceData.audioBlob.size,
          mimeType: 'audio/webm',
          duration: voiceData.duration,
          waveform: voiceData.waveform,
          timestamp: new Date().toISOString(),
          isOwn: true,
          voice: {
            url: voiceData.audioUrl,
            duration: voiceData.duration,
            size: voiceData.audioBlob.size,
            waveform: voiceData.waveform
          }
        }
        
        // Add to group messages
        setGroupMessages(prev => ({
          ...prev,
          [selectedGroup.id]: [...(prev[selectedGroup.id] || []), localVoiceMessage]
        }))
        
        // Also add to group's message array for others to see
        const updatedGroup = {
          ...selectedGroup,
          messages: [...(selectedGroup.messages || []), localVoiceMessage]
        }
        setSelectedGroup(updatedGroup)
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
        
        // Save to localStorage for persistence
        localStorage.setItem(`group_messages_${selectedGroup.id}`, JSON.stringify(updatedGroup.messages))
        
        console.log('Voice message saved locally:', localVoiceMessage)
        console.log('API Error:', data.message || 'Voice message API not available')
      }
    } catch (error) {
      console.error('Error sending voice message:', error)
      // Fallback: Save to local state only
      const localVoiceMessage = {
        id: `voice_${Date.now()}`,
        groupId: selectedGroup.id,
        senderId: 'JD',
        senderName: 'James Doe',
        senderAvatar: 'JD',
        senderColor: '#3B82F6',
        messageType: 'audio',
        content: '',
        fileUrl: voiceData.audioUrl,
        fileName: `voice_${Date.now()}.webm`,
        fileSize: voiceData.audioBlob.size,
        mimeType: 'audio/webm',
        duration: voiceData.duration,
        waveform: voiceData.waveform,
        timestamp: new Date().toISOString(),
        isOwn: true,
        voice: {
          url: voiceData.audioUrl,
          duration: voiceData.duration,
          size: voiceData.audioBlob.size,
          waveform: voiceData.waveform
        }
      }
      
      // Add to group messages
      setGroupMessages(prev => ({
        ...prev,
        [selectedGroup.id]: [...(prev[selectedGroup.id] || []), localVoiceMessage]
      }))
      
      // Also add to group's message array for others to see
      const updatedGroup = {
        ...selectedGroup,
        messages: [...(selectedGroup.messages || []), localVoiceMessage]
      }
      setSelectedGroup(updatedGroup)
      setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
      
      // Save to localStorage for persistence
      localStorage.setItem(`group_messages_${selectedGroup.id}`, JSON.stringify(updatedGroup.messages))
      
      console.log('Voice message saved locally (catch fallback):', localVoiceMessage)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F9FF', fontFamily: 'Inter, sans-serif' }}>
      {/* WhatsApp-style layout */}
      <div className="flex-1 flex relative z-10">
        {/* Left sidebar - Groups list */}
        <div className="w-[450px] bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#003097', color: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>My Groups</h2>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg transition-colors text-base"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Inter, sans-serif' }}
              >
                Create New
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 14 14" fill="none" className="flex-shrink-0" style={{ color: '#4FC3F7' }}>
                <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input
                className="flex-1 bg-transparent outline-none text-xl text-slate-700 placeholder-slate-400"
                placeholder="Search groups..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Groups list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3 animate-bounce">🔄</div>
                <div className="text-base text-slate-400">Loading groups...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">❌</div>
                <div className="text-base text-red-600">{error}</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">🔍</div>
                <div className="text-base text-slate-400">No groups found</div>
              </div>
            ) : (
              filtered.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex items-center gap-4 p-5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-blue-200 ${
                    selectedGroup?.id === group.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg"
                    style={{ background: group.leaderColor || '#3B82F6' }}
                  >
                    {group.leaderAv || group.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-slate-800 truncate">{group.name}</div>
                    <div className="text-base text-slate-500 truncate">{group.category} • {group.members} members</div>
                    {group.lastMsg && (
                      <div className="text-sm text-slate-400 truncate mt-1">{group.lastMsg}</div>
                    )}
                  </div>
                  {group.unread > 0 && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                      {group.unread}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom stats */}
          <div className="p-6 border-t border-blue-200 bg-blue-50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="text-sm">
                <div className="font-bold text-blue-600 text-lg">{projectCount}</div>
                <div className="text-slate-400">Projects</div>
              </div>
              <div className="text-sm">
                <div className="font-bold text-blue-500 text-lg">{studyCount}</div>
                <div className="text-slate-400">Study</div>
              </div>
              <div className="text-sm">
                <div className="font-bold text-blue-400 text-lg">{discussionCount}</div>
                <div className="text-slate-400">Discussion</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Chat or Settings interface */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedGroup ? (
            <>
              {/* Group header */}
              <div className="bg-blue-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{ background: selectedGroup.leaderColor || '#3B82F6' }}
                  >
                    {selectedGroup.leaderAv || selectedGroup.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                    <div className="text-blue-100">{selectedGroup.category} • {selectedGroup.members} members • {selectedGroup.online} online</div>
                  </div>
                  <button
                    onClick={() => setActiveView(activeView === 'chat' ? 'settings' : 'chat')}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                      activeView === 'settings' 
                        ? 'bg-white text-blue-600 hover:bg-blue-50' 
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {activeView === 'settings' ? 'Chat' : 'Settings'}
                  </button>
                </div>
              </div>

              {/* Chat View */}
              {activeView === 'chat' && (
                <>
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="space-y-4">
                      {/* Welcome message */}
                      <div className="flex gap-3 items-end">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: selectedGroup.leaderColor || '#3B82F6' }}
                        >
                          {selectedGroup.leaderAv || 'L'}
                        </div>
                        <div className="max-w-[70%] items-start flex flex-col">
                          <div className="text-xs font-bold text-slate-400 mb-1">
                            {selectedGroup.leader || 'Group Leader'}
                          </div>
                          <div className="px-4 py-2 text-sm leading-relaxed break-words bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm">
                            Welcome to {selectedGroup.name}! This is a great group for collaboration. Feel free to introduce yourself and share your goals!
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                            <span>10:30 AM</span>
                          </div>
                        </div>
                      </div>

                      {/* Display all messages for current group */}
                      {((selectedGroup?.messages) || (groupMessages[selectedGroup?.id] || [])).map((message) => (
                        <div key={message.id} className={`flex gap-3 items-end ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: message.senderColor || '#3B82F6' }}
                          >
                            {message.senderAvatar || 'U'}
                          </div>
                          <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`text-xs font-bold text-slate-400 mb-1 ${message.isOwn ? 'text-right' : ''}`}>
                              {message.senderName}
                            </div>
                            <div className={`px-4 py-2 text-sm leading-relaxed break-words ${
                              message.isOwn 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm'
                            }`}>
                              {message.content}
                              
                              {/* Display voice messages */}
                              {message.voice && (
                                <div className="mt-2 flex items-center gap-2 bg-white/10 rounded-lg p-2">
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                      <line x1="12" y1="19" x2="12" y2="23"/>
                                      <line x1="8" y1="23" x2="16" y2="23"/>
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs opacity-75">Voice message</div>
                                    <div className="text-xs opacity-60">{Math.round(message.voice.duration)}s</div>
                                    {/* Audio player with speed controls */}
                                    <div className="flex items-center gap-2 mt-1">
                                      <audio 
                                        ref={`audio_${message.id}`}
                                        controls
                                        className="h-6 w-full"
                                        style={{ maxHeight: '24px' }}
                                      >
                                        <source src={message.voice.url} type="audio/webm" />
                                      </audio>
                                      {/* Speed controls */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            const audio = document.getElementById(`audio_${message.id}`) || document.querySelector(`[ref="audio_${message.id}"]`)
                                            if (audio) audio.playbackRate = 0.5
                                          }}
                                          className="text-xs px-1 py-0.5 bg-white/20 hover:bg-white/30 rounded"
                                        >
                                          0.5x
                                        </button>
                                        <button
                                          onClick={() => {
                                            const audio = document.getElementById(`audio_${message.id}`) || document.querySelector(`[ref="audio_${message.id}"]`)
                                            if (audio) audio.playbackRate = 1
                                          }}
                                          className="text-xs px-1 py-0.5 bg-white/20 hover:bg-white/30 rounded"
                                        >
                                          1x
                                        </button>
                                        <button
                                          onClick={() => {
                                            const audio = document.getElementById(`audio_${message.id}`) || document.querySelector(`[ref="audio_${message.id}"]`)
                                            if (audio) audio.playbackRate = 2
                                          }}
                                          className="text-xs px-1 py-0.5 bg-white/20 hover:bg-white/30 rounded"
                                        >
                                          2x
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Display attached files */}
                              {message.files && message.files.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                      {file.type === 'image' ? (
                                        <div className="relative group">
                                          <img 
                                            src={file.url} 
                                            alt={file.name}
                                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => window.open(file.url, '_blank')}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                              <path d="M15 12a3 3 0 1 1-3 3 3 3 0 0 1-3-3zm0 2a1 1 0 1 1 1 0 0 1 1-1 0z"/>
                                              <path d="M2 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"/>
                                            </svg>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-lg">
                                          {file.type === 'video' ? '🎥' : 
                                           file.type === 'audio' ? '🎵' : '📄'}
                                        </span>
                                      )}
                                      <div className="flex-1">
                                        <div className="text-sm text-slate-600 truncate">{file.name}</div>
                                        <div className="text-xs text-slate-400">{file.size || ''}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {message.isOwn && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 7l3.5 3.5 6.5-6.5" stroke="rgba(99,102,241,.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message input with file upload */}
                  <div className="px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0">
                    {/* File Attachments */}
                    {attachedFiles.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm">
                              {file.type === 'image' ? '🖼️' : 
                               file.type === 'video' ? '🎥' : 
                               file.type === 'audio' ? '🎵' : '📄'} 
                              {file.name}
                            </span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-600 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* File Upload Button */}
                      <FileUpload onFileSelect={handleFileSelect} />
                      
                      {/* Voice Recorder Button */}
                      <VoiceRecorder onRecordingComplete={sendVoiceMessage} />
                      
                      {/* Text Input */}
                      <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                          placeholder="Type a message..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                      </div>
                      
                      {/* Send Button */}
                      <button 
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() && attachedFiles.length === 0}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center text-white transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Settings View */}
              {activeView === 'settings' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-blue-600 px-4 py-3">
                        <h3 className="text-white font-bold">Group Settings</h3>
                      </div>
                      <div className="p-6 space-y-6">
                        {/* Group Information */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 mb-4">Group Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Group Name:</label>
                              <input
                                type="text"
                                value={selectedGroup.name || ''}
                                onChange={(e) => {
                                  const updatedGroup = { ...selectedGroup, name: e.target.value }
                                  setSelectedGroup(updatedGroup)
                                  setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
                                }}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Group ID:</label>
                              <input
                                type="text"
                                value={selectedGroup.id || ''}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
                                readOnly
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Category:</label>
                              <select
                                value={selectedGroup.category || ''}
                                onChange={(e) => {
                                  const updatedGroup = { ...selectedGroup, category: e.target.value }
                                  setSelectedGroup(updatedGroup)
                                  setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
                                }}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                              >
                                <option value="project">Project</option>
                                <option value="study">Study</option>
                                <option value="discussion">Discussion</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Member Limit:</label>
                              <input
                                type="number"
                                value={selectedGroup.memberLimit || ''}
                                onChange={(e) => {
                                  const updatedGroup = { ...selectedGroup, memberLimit: parseInt(e.target.value) }
                                  setSelectedGroup(updatedGroup)
                                  setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
                                }}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                min="4"
                                max="8"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Current Members:</label>
                              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-slate-700">
                                {selectedGroup.members} members
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Online Now:</label>
                              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-slate-700">
                                {selectedGroup.online} members
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <label className="text-sm font-medium text-slate-700 w-32">Created Date:</label>
                              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-slate-700">
                                {selectedGroup.createdAt ? new Date(selectedGroup.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Leader Management (Only for Project Groups) */}
                        {selectedGroup.category === 'project' && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-800 mb-4">Group Leader Management</h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <label className="text-sm font-medium text-slate-700 w-32">Current Leader:</label>
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: selectedGroup.leaderColor || '#3B82F6' }}
                                  >
                                    {selectedGroup.leaderAv || 'L'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-800">{selectedGroup.leader || 'Not Assigned'}</div>
                                    <div className="text-sm text-slate-500">Current Group Leader</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <label className="text-sm font-medium text-slate-700 w-32">New Leader:</label>
                                <div className="flex gap-3 flex-1">
                                  <select
                                    value={selectedLeader}
                                    onChange={e => setSelectedLeader(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                  >
                                    <option value="">Select a member...</option>
                                    {(selectedGroup.panelMembers || []).map(member => (
                                      <option key={member.id} value={member.id}>
                                        {member.name} ({member.id})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => setShowLeaderChange(true)}
                                    disabled={!selectedLeader}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Group Actions */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 mb-4">Group Actions</h4>
                          <div className="space-y-3">
                            <button 
                              onClick={() => setShowReportGroup(true)}
                              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center gap-3"
                            >
                              � Report Group
                            </button>
                            <button 
                              onClick={() => setShowAddMember(true)}
                              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-left flex items-center gap-3"
                            >
                              👥 Add Member
                            </button>
                            <button 
                              onClick={() => handleExportGroup()}
                              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left flex items-center gap-3"
                            >
                              📁 Export Group
                            </button>
                            <button 
                              onClick={() => setShowExitGroup(true)}
                              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left flex items-center gap-3"
                            >
                              � Exit Group
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-6">💬</div>
                <div className="text-3xl font-semibold text-slate-600 mb-4">Select a Group</div>
                <div className="text-lg text-slate-400">Choose a group from the left to start chatting</div>
              </div>
            </div>
          )}
        </div>

        {/* Leader Change Confirmation Modal */}
        {showLeaderChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Group Leader</h3>
              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Are you sure you want to change the group leader?
                </p>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-slate-700">
                    <strong>Current Leader:</strong> {selectedGroup.leader}<br/>
                    <strong>New Leader:</strong> {(selectedGroup.panelMembers || []).find(m => m.id === selectedLeader)?.name || 'Not selected'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Update group leader
                    const newLeader = (selectedGroup.panelMembers || []).find(m => m.id === selectedLeader)
                    if (newLeader) {
                      const updatedGroup = {
                        ...selectedGroup,
                        leader: newLeader.name,
                        leaderAv: newLeader.av,
                        leaderColor: newLeader.color
                      }
                      setSelectedGroup(updatedGroup)
                      // Update groups list
                      setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g))
                      alert(`Group leader changed to ${newLeader.name}`)
                    }
                    setShowLeaderChange(false)
                    setSelectedLeader('')
                  }}
                  disabled={!selectedLeader}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Confirm Change
                </button>
                <button
                  onClick={() => {
                    setShowLeaderChange(false)
                    setSelectedLeader('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Member</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter member email address
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddMember}
                  disabled={!newMemberEmail.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  Add Member
                </button>
                <button
                  onClick={() => {
                    setShowAddMember(false)
                    setNewMemberEmail('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Group Modal */}
        {showReportGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Report Group</h3>
              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Why are you reporting "{selectedGroup?.name}"?
                </p>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="4"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReportGroup}
                  disabled={!reportReason.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => {
                    setShowReportGroup(false)
                    setReportReason('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Group Modal */}
        {showExitGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Exit Group</h3>
              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Are you sure you want to leave "{selectedGroup?.name}"?
                </p>
                <p className="text-sm text-slate-500 mb-3">
                  You will need to be re-invited to join this group again.
                </p>
                <textarea
                  value={exitReason}
                  onChange={e => setExitReason(e.target.value)}
                  placeholder="Reason for leaving (optional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExitGroup}
                  disabled={!exitReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Exit Group
                </button>
                <button
                  onClick={() => {
                    setShowExitGroup(false)
                    setExitReason('')
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
    </div>
  )
}

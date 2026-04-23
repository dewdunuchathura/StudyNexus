import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import WhatsAppChat from '../components/chat/WhatsAppChat.jsx'

// ─── Category styles ───────────────────────────────────────────────────────
const CAT_STYLES = {
  project: {
    header: 'from-blue-500 to-blue-600',
    chip: 'bg-blue-100 text-blue-700 border-blue-200',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
  },
  study: {
    header: 'from-emerald-500 to-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
  },
  discussion: {
    header: 'from-purple-500 to-purple-600',
    chip: 'bg-purple-100 text-purple-700 border-purple-200',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
  },
}

// ─── Category chip ───────────────────────────────────────────────────────
function CatChip({ cat }) {
  const style = CAT_STYLES[cat]
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${style.chip}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {cat === 'project' ? 'Project' : cat === 'study' ? 'Study' : 'Discussion'}
    </span>
  )
}

// ─── File icon ───────────────────────────────────────────────────────
function FileIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V6.5l-4.5-4.5H3z" stroke={color} strokeWidth="1.3" fill="none"/>
      <path d="M8 2v4.5h4.5" stroke={color} strokeWidth="1.3" fill="none"/>
    </svg>
  )
}

// ─── Main Group Detail page ──────────────────────────────────────────────────────
export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [group, setGroup] = useState(null)
  const [activeTab, setActiveTab] = useState('chat') // Default to chat
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLeaderChange, setShowLeaderChange] = useState(false)
  const [members, setMembers] = useState([])
  const [selectedLeader, setSelectedLeader] = useState('')

  // Load group data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ss_groups')
      const groups = saved ? JSON.parse(saved) : []
      const foundGroup = groups.find(g => g.id === groupId)
      
      if (foundGroup) {
        setGroup(foundGroup)
        // Set up members for leader selection
        setMembers(foundGroup.panelMembers || [])
        
        // Check if tab parameter is set
        const tabParam = searchParams.get('tab')
        if (tabParam && ['chat', 'members', 'files', 'settings'].includes(tabParam)) {
          setActiveTab(tabParam)
        } else {
          setActiveTab('chat') // Default to chat
        }
        
        
      } else {
        navigate('/groups')
      }
    } catch (err) {
      navigate('/groups')
    }
  }, [groupId, navigate])

  const sendMessage = () => {
    if (!input.trim()) return
    
    const newMessage = {
      from: 'JD',
      name: 'You',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      me: true,
      color: '#3B82F6'
    }
    
    setMessages([...messages, newMessage])
    setInput('')
    setTyping(false)
    
    // Simulate typing indicator
    setTimeout(() => setTyping(true), 1000)
    setTimeout(() => setTyping(false), 3000)
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      </div>
    )
  }

  const cat = CAT_STYLES[group.category]
  const onlineMembers = group.panelMembers?.filter(m => m.online) || []
  const offlineMembers = group.panelMembers?.filter(m => !m.online) || []
  const memberLimitPct = group.memberLimit ? Math.round((group.members / group.memberLimit) * 100) : 0
  const limitColor = memberLimitPct >= 100 ? 'bg-red-400' : memberLimitPct >= 75 ? 'bg-amber-400' : 'bg-blue-500'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F9FF', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Top navigation ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#003097' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 8v7c0 5.5-4.5 10-10 11.5C6.5 25 2 20.5 2 15V8l10-6z" fill="white" opacity="0.9"/>
              <circle cx="12" cy="12" r="3" fill="#4FC3F7"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#003097', fontFamily: 'Inter, sans-serif' }}>StudySpace</span>
            <div className="text-sm font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Group Management System</div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Link to="/groups" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.target.style.color = '#003097'; e.target.style.backgroundColor = '#F0F9FF'; }} onMouseLeave={(e) => { e.target.style.color = '#6B7280'; e.target.style.backgroundColor = 'transparent'; }}>All Groups</Link>
          <Link to="/" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.target.style.color = '#003097'; e.target.style.backgroundColor = '#F0F9FF'; }} onMouseLeave={(e) => { e.target.style.color = '#6B7280'; e.target.style.backgroundColor = 'transparent'; }}>Create Group</Link>
          <Link to="/join" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.target.style.color = '#003097'; e.target.style.backgroundColor = '#F0F9FF'; }} onMouseLeave={(e) => { e.target.style.color = '#6B7280'; e.target.style.backgroundColor = 'transparent'; }}>Join Group</Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#F0F9FF'; e.target.style.color = '#003097'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#F3F4F6'; e.target.style.color = '#6B7280'; }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a4 4 0 00-4 4c0 3-1.5 4-1.5 4h11S12 9 12 6a4 4 0 00-4-4zM6.5 12a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer shadow-lg" style={{ backgroundColor: '#003097' }} title="James Doe · IT23665798">
            JD
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>James Doe</div>
            <div className="text-xs font-medium" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Creator</div>
            <div className="font-mono text-xs" style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>IT23665798</div>
          </div>
        </div>
      </nav>

      {/* ── Group header ── */}
      <div className="px-6 py-6 flex-shrink-0" style={{ background: 'linear-gradient(to right, #003097, #4FC3F7)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/groups"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5l-5 5 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div className="text-white">
              <h1 className="text-2xl font-black" style={{ fontFamily: 'Inter, sans-serif' }}>{group.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <CatChip cat={group.category} />
                <span className="text-white/80 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {group.members} members · {group.online} online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-6 flex-shrink-0">
        {['chat', 'members', 'files', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-1 border-b-2 transition-all font-medium text-sm capitalize ${
              activeTab === tab
                ? 'text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ 
              borderBottomColor: activeTab === tab ? '#003097' : 'transparent',
              color: activeTab === tab ? '#003097' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseEnter={(e) => { if (activeTab !== tab) e.target.style.color = '#1F2937'; }}
            onMouseLeave={(e) => { if (activeTab !== tab) e.target.style.color = '#6B7280'; }}
          >
            {tab === 'chat' ? 'Chat' : tab === 'members' ? 'Members' : tab === 'files' ? 'Files' : 'Settings'}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <WhatsAppChat 
            groupId={groupId} 
            currentUserId="JD" // This should come from auth context
          />
        )}

        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className={`bg-gradient-to-r ${cat.header} px-4 py-3`}>
                  <h3 className="text-white font-bold">Group Members</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Total Members</span>
                    <span className="text-sm font-bold text-blue-600">{group.members}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">JD</div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">James Doe</div>
                        <div className="text-xs text-slate-500">Group Leader</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className={`bg-gradient-to-r ${cat.header} px-4 py-3`}>
                  <h3 className="text-white font-bold">Shared Files</h3>
                </div>
                <div className="p-4">
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-3">📁</div>
                    <div className="text-sm font-medium">No files shared yet</div>
                    <div className="text-xs mt-1">Files will appear here when members share them</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className={`bg-gradient-to-r ${cat.header} px-4 py-3`}>
                  <h3 className="text-white font-bold">Group Settings</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Group Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Group Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Group Name</label>
                        <input
                          type="text"
                          value={group?.name || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Group ID</label>
                        <input
                          type="text"
                          value={group?.id || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select
                          value={group?.category || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="project">Project</option>
                          <option value="study">Study</option>
                          <option value="discussion">Discussion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Member Limit</label>
                        <input
                          type="number"
                          value={group?.memberLimit || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          min="4"
                          max="8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leader Management (Only for Project Groups) */}
                  {group?.category === 'project' && (
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Group Leader</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Current Leader</label>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ background: group?.leaderColor || '#3B82F6' }}
                            >
                              {group?.leaderAv || 'L'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{group?.leader}</div>
                              <div className="text-sm text-slate-500">Current Group Leader</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Change Group Leader</label>
                          <div className="flex gap-3">
                            <select
                              value={selectedLeader}
                              onChange={e => setSelectedLeader(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select a member...</option>
                              {members.map(member => (
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
                              Change Leader
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
                      <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left">
                        📝 Edit Group Details
                      </button>
                      <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-left">
                        👥 Invite Members
                      </button>
                      <button className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-left">
                        📊 Group Statistics
                      </button>
                      <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left">
                        📁 Export Group Data
                      </button>
                      <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left">
                        🗑️ Delete Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                  <strong>Current Leader:</strong> {group?.leader}<br/>
                  <strong>New Leader:</strong> {members.find(m => m.id === selectedLeader)?.name || 'Not selected'}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Update group leader
                  const newLeader = members.find(m => m.id === selectedLeader)
                  if (newLeader) {
                    setGroup({
                      ...group,
                      leader: newLeader.name,
                      leaderAv: newLeader.av,
                      leaderColor: newLeader.color
                    })
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
    </div>
  )
}

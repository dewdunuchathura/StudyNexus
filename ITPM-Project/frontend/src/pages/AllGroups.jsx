import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ─── Constants (same rules as CreateGroup.jsx) ───────────────────────────────
const PREFIXES = ['it', 'bm', 'hs', 'en']
const idRegex = new RegExp(`^(${PREFIXES.join('|')})\\d{8}$`, 'i')

const CAT_STYLES = {
  project:    { chip: 'bg-indigo-50 text-indigo-700 border border-indigo-200',   dot: 'bg-indigo-500',  header: 'from-indigo-500 to-blue-500'  },
  study:      { chip: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', header: 'from-emerald-500 to-teal-500'  },
  discussion: { chip: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: 'bg-amber-500',   header: 'from-amber-500 to-orange-400'  },
}

// ─── Seed groups (mirrors CreateGroup field structure) ────────────────────────
const SEED_GROUPS = [
  { id: 'it23665798', name: 'Final Year Project',      category: 'project',    memberLimit: 8,    members: 6,  online: 4, membersVisible: true,  leader: 'Dr. Chen Wei',  leaderAv: 'CW', leaderColor: '#0066CC', lastMsg: 'Dr. Chen: Final deadline reminder',   time: '10:44', unread: 2,
    messages: [
      { from: 'AH', name: 'Amir Hassan',  color: '#F59E0B', text: 'Has everyone started on the final report? I\'m halfway through the methodology section.', time: '10:32 AM', me: false },
      { from: 'SN', name: 'Sara Nwosu',   color: '#8B5CF6', text: 'Yes! My section is almost done. Will share on the drive tonight.',                          time: '10:35 AM', me: false, file: { name: 'Sara_Methodology_v2.docx', size: '142 KB', color: '#1E90FF' } },
      { from: 'JD', name: 'You',          color: '#1E90FF', text: 'I\'ve finished the literature review. Starting on results now. Let\'s sync on Friday?',      time: '10:41 AM', me: true  },
      { from: 'MT', name: 'Mia Torres',   color: '#10B981', text: 'Friday 2pm works for me! Great progress everyone.',                                          time: '10:44 AM', me: false },
      { from: 'JD', name: 'You',          color: '#1E90FF', text: 'Perfect! I\'ll set up the calendar invite now.',                                             time: '10:46 AM', me: true  },
    ],
    announcement: { author: 'Dr. Chen Wei', authorId: 'it23000001', text: 'Final submission deadline is Dec 15. Push all code to main branch by Dec 12. Formatting guidelines in shared doc. Friday sync is mandatory.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe',   id: 'it23665798', online: true,  role: 'you'    },
      { av: 'CW', color: '#0066CC', name: 'Dr. Chen Wei',id: 'it23000001', online: true,  role: 'leader' },
      { av: 'AH', color: '#F59E0B', name: 'Amir Hassan', id: 'it23445566', online: true,  role: ''       },
      { av: 'MT', color: '#10B981', name: 'Mia Torres',  id: 'hs23998877', online: true,  role: ''       },
      { av: 'SN', color: '#8B5CF6', name: 'Sara Nwosu',  id: 'bm23112233', online: false, role: ''       },
      { av: 'PK', color: '#EF4444', name: 'Priya Kapoor',id: 'en23001122', online: false, role: ''       },
    ],
    sharedFiles: [
      { name: 'Sara_Methodology_v2.docx', date: 'Today · 142 KB',  color: '#1E90FF' },
      { name: 'Project_Checklist.xlsx',   date: 'Dec 3 · 48 KB',   color: '#10B981' },
      { name: 'Presentation_Draft.pptx',  date: 'Dec 1 · 3.2 MB',  color: '#EF4444' },
    ],
  },
  { id: 'it23112200', name: 'Algorithms Study Circle', category: 'study',      memberLimit: null, members: 14, online: 3, membersVisible: false, leader: 'Prof. Ramos',   leaderAv: 'PR', leaderColor: '#0D9488', lastMsg: 'Great, 3pm works for everyone!',           time: '9:30',  unread: 0,
    messages: [
      { from: 'PR', name: 'Prof. Ramos', color: '#0D9488', text: 'Everyone please review the graph chapter before Thursday.',      time: '9:10 AM', me: false },
      { from: 'JD', name: 'You',         color: '#1E90FF', text: 'Sure! Should we go through the BFS or DFS problems first?',      time: '9:20 AM', me: true  },
      { from: 'KL', name: 'Kenji Lowe',  color: '#8B5CF6', text: 'Great, 3pm works for everyone!',                                 time: '9:30 AM', me: false },
    ],
    announcement: { author: 'Prof. Ramos', authorId: 'it23000010', text: 'Next session covers Dijkstra and A* — please prepare examples in advance.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe',  id: 'it23665798', online: true,  role: 'you'    },
      { av: 'PR', color: '#0D9488', name: 'Prof. Ramos',id: 'it23000010', online: true,  role: 'leader' },
      { av: 'KL', color: '#8B5CF6', name: 'Kenji Lowe', id: 'bm23001233', online: true,  role: ''       },
    ],
    sharedFiles: [
      { name: 'Graph_Problems.pdf', date: 'Dec 4 · 320 KB', color: '#0D9488' },
    ],
  },
  { id: 'bm23445500', name: 'AI Ethics Forum',         category: 'discussion', memberLimit: null, members: 24, online: 7, membersVisible: false, leader: 'Nadia Okon',    leaderAv: 'NO', leaderColor: '#F59E0B', lastMsg: 'Anyone read the Zuboff paper?',             time: 'Yest.', unread: 1,
    messages: [
      { from: 'NO', name: 'Nadia Okon', color: '#F59E0B', text: 'Great discussion last week. This week: surveillance capitalism.', time: 'Yesterday', me: false },
      { from: 'JD', name: 'You',        color: '#1E90FF', text: 'Anyone read the Zuboff paper?',                                   time: 'Yesterday', me: true  },
    ],
    announcement: { author: 'Nadia Okon', authorId: 'bm23445500', text: 'This week\'s theme: AI bias in hiring algorithms. Share readings in the drive.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe', id: 'it23665798', online: true,  role: 'you'    },
      { av: 'NO', color: '#F59E0B', name: 'Nadia Okon',id: 'bm23445500', online: true,  role: 'leader' },
    ],
    sharedFiles: [
      { name: 'Zuboff_Surveillance.pdf', date: 'Dec 2 · 1.1 MB', color: '#F59E0B' },
    ],
  },
  { id: 'hs23887700', name: 'Mobile App Dev Team',     category: 'project',    memberLimit: 6,    members: 5,  online: 1, membersVisible: true,  leader: 'Kenji Lowe',    leaderAv: 'KL', leaderColor: '#8B5CF6', lastMsg: 'PR merged! Great work everyone',            time: 'Mon',   unread: 0,
    messages: [
      { from: 'KL', name: 'Kenji Lowe', color: '#8B5CF6', text: 'PR merged to main! Great work everyone.',             time: 'Mon 3:00 PM', me: false },
      { from: 'JD', name: 'You',        color: '#1E90FF', text: 'Awesome! Next sprint planning on Wednesday at 2pm?',   time: 'Mon 3:05 PM', me: true  },
    ],
    announcement: { author: 'Kenji Lowe', authorId: 'hs23887700', text: 'Sprint 3 targets: finish profile screen, fix auth bug, and write unit tests.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe',   id: 'it23665798', online: true,  role: 'you'    },
      { av: 'KL', color: '#8B5CF6', name: 'Kenji Lowe',  id: 'hs23887700', online: true,  role: 'leader' },
      { av: 'AH', color: '#F59E0B', name: 'Amir Hassan', id: 'it23445566', online: false, role: ''       },
    ],
    sharedFiles: [
      { name: 'Sprint3_Plan.xlsx', date: 'Mon · 28 KB', color: '#8B5CF6' },
    ],
  },
  { id: 'en23990011', name: 'Quantum Computing Prep',  category: 'study',      memberLimit: null, members: 18, online: 3, membersVisible: false, leader: 'Dr. Park',      leaderAv: 'DP', leaderColor: '#EF4444', lastMsg: 'Problem set 4 shared doc is ready',        time: 'Sun',   unread: 0,
    messages: [
      { from: 'DP', name: 'Dr. Park', color: '#EF4444', text: 'Problem set 4 shared doc is ready. Due next Friday.', time: 'Sun 11:00 AM', me: false },
    ],
    announcement: { author: 'Dr. Park', authorId: 'en23990011', text: 'Midterm covers Chapters 4–7. Practice problems now uploaded.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe', id: 'it23665798', online: true,  role: 'you'    },
      { av: 'DP', color: '#EF4444', name: 'Dr. Park',  id: 'en23990011', online: false, role: 'leader' },
    ],
    sharedFiles: [
      { name: 'ProblemSet4.pdf', date: 'Sun · 210 KB', color: '#EF4444' },
    ],
  },
  { id: 'bm23001122', name: 'Web Dev Masters',         category: 'project',    memberLimit: 8,    members: 4,  online: 0, membersVisible: true,  leader: 'Sara Nwosu',    leaderAv: 'SN', leaderColor: '#0D9488', lastMsg: 'Sprint 3 kickoff next Monday',              time: 'Sat',   unread: 0,
    messages: [
      { from: 'SN', name: 'Sara Nwosu', color: '#0D9488', text: 'Sprint 3 kickoff next Monday at 10am. Please be on time.', time: 'Sat 2:00 PM', me: false },
    ],
    announcement: { author: 'Sara Nwosu', authorId: 'bm23001122', text: 'Next sprint: API integration and dashboard charts. Assign tasks by Monday.' },
    panelMembers: [
      { av: 'JD', color: '#1E90FF', name: 'James Doe', id: 'it23665798', online: false, role: 'you'    },
      { av: 'SN', color: '#0D9488', name: 'Sara Nwosu',id: 'bm23001122', online: false, role: 'leader' },
    ],
    sharedFiles: [
      { name: 'API_Docs.pdf', date: 'Sat · 540 KB', color: '#0D9488' },
    ],
  },
]

const AUTO_REPLIES = [
  "Sounds good, I'll review my section tonight.",
  'Should we split the results section between us?',
  'The methodology looks solid — nice work!',
  "Friday sync confirmed. I'll bring my notes.",
  'Can someone share the bibliography template?',
  'Just pushed my changes to the main branch.',
  'Thanks everyone — great progress this week!',
]

// ─── Helper: format time ──────────────────────────────────────────────────────
function nowTime() {
  const d = new Date()
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

// ─── File icon SVG ────────────────────────────────────────────────────────────
function FileIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h7l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={color} strokeWidth="1.3" />
      <path d="M10 2v4h4" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

// ─── Category chip ────────────────────────────────────────────────────────────
function CatChip({ cat }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_STYLES[cat].chip}`}>
      {cat}
    </span>
  )
}

// ─── Group Chat Panel ─────────────────────────────────────────────────────────
function GroupChatPanel({ group, onClose }) {
  const [messages, setMessages] = useState(group.messages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [replyIdx, setReplyIdx] = useState(0)
  const [activeTab, setActiveTab] = useState('chat') // chat | members | files
  const [zoomLevel, setZoomLevel] = useState(100) // zoom percentage
  const bodyRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, typing])

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const myMsg = { from: 'JD', name: 'You', color: '#1E90FF', text, time: nowTime(), me: true }
    setMessages(prev => [...prev, myMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const replyPerson = group.panelMembers.find(m => m.role !== 'you') || group.panelMembers[1]
      const reply = {
        from: replyPerson.av,
        name: replyPerson.name,
        color: replyPerson.color,
        text: AUTO_REPLIES[replyIdx % AUTO_REPLIES.length],
        time: nowTime(),
        me: false,
      }
      setMessages(prev => [...prev, reply])
      setReplyIdx(i => i + 1)
    }, 2000)
  }

  const onlineMembers  = group.panelMembers.filter(m => m.online)
  const offlineMembers = group.panelMembers.filter(m => !m.online)

  const memberLimitPct = group.memberLimit ? Math.round((group.members / group.memberLimit) * 100) : 0
  const limitColor =
    memberLimitPct >= 100 ? 'bg-red-500'
    : memberLimitPct >= 75  ? 'bg-amber-400'
    : 'bg-blue-500'

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Chat header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: CAT_STYLES[group.category].dot }}
        >
          {group.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 truncate">{group.name}</span>
            <CatChip cat={group.category} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[11px] text-slate-400">
              {group.category === 'project' && group.memberLimit
                ? `${group.members}/${group.memberLimit} members · ${group.online} online`
                : `${group.members} members · ${group.online} online`}
            </span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {group.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Tab buttons */}
          {['chat','members','files'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            onClick={onClose}
            className="ml-1 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Member limit bar (project only) ── */}
      {group.category === 'project' && group.memberLimit && memberLimitPct >= 75 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-[11px] font-semibold flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L2 12h10L7 1.5z" fill="#F59E0B"/>
            <path d="M7 6v3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Group at {memberLimitPct}% capacity ({group.members}/{group.memberLimit}). Project limit: 4–8 members.
        </div>
      )}

      {/* ── TAB: CHAT ── */}
      {activeTab === 'chat' && (
        <>
          {/* Announcement */}
          <div className="mx-4 mt-3 mb-1 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl px-3 py-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L2 11h8L6 1z" fill="#1E90FF"/>
                <path d="M6 5v3" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Announcement · {group.announcement.author}
                <span className="font-mono font-normal ml-1 opacity-60">· {group.announcement.authorId}</span>
              </span>
            </div>
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all"
                title="Zoom out"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4v4M4 8h8M6 6l2 2M10 6l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <span className="text-[12px] font-semibold text-gray-600 min-w-[50px] text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all"
                title="Zoom in"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4v4M4 8h8M6 10l2-2M10 10l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-[12px] text-blue-900 leading-relaxed">{group.announcement.text}</p>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 items-end ${msg.me ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ 
                    background: msg.color,
                    width: `${Math.round(28 * zoomLevel / 100)}px`,
                    height: `${Math.round(28 * zoomLevel / 100)}px`,
                    fontSize: `${Math.round(10 * zoomLevel / 100)}px`
                  }}
                >
                  {msg.from}
                </div>
                <div className={`max-w-[65%] ${msg.me ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`font-bold text-slate-400 mb-1 ${msg.me ? 'text-right' : ''}`} style={{ fontSize: `${Math.round(10 * zoomLevel / 100)}px` }}>
                    {msg.name}
                    {!msg.me && (
                      <span className="font-mono font-normal ml-1 opacity-60">
                        · {group.panelMembers.find(m => m.av === msg.from)?.id || ''}
                      </span>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 leading-relaxed break-words ${
                      msg.me
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm'
                    }`}
                    style={{ fontSize: `${Math.round(16 * zoomLevel / 100)}px` }}
                  >
                    {msg.text}
                  </div>
                  {msg.file && (
                    <div className="mt-1.5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileIcon color={msg.file.color} />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-700">{msg.file.name}</div>
                        <div className="text-[10px] text-slate-400">{msg.file.size}</div>
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${msg.me ? 'flex-row-reverse' : ''}`}>
                    <span>{msg.time}</span>
                    {msg.me && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5 6.5-6.5" stroke="rgba(99,102,241,.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 7l3.5 3.5 6.5-6.5" stroke="rgba(99,102,241,.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(-4,0)"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2 items-end">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: group.panelMembers.find(m => m.role !== 'you')?.color || '#888' }}
                >
                  {group.panelMembers.find(m => m.role !== 'you')?.av || '??'}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-all" title="Attach file">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 8L8 13.5a4.5 4.5 0 01-6.36-6.36L7.5 1.5a3 3 0 014.24 4.24L5.88 11.1a1.5 1.5 0 01-2.12-2.12l5.66-5.66" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-all" title="Voice record">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zM4 15a1 1 0 001 1h6a1 1 0 001-1H4a1 1 0 00-1 1z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 12L6 10l2 2v-2z" fill="currentColor"/>
                <path d="M12 8a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                className="flex-1 bg-transparent outline-none text-[16px] text-slate-700 placeholder-slate-400"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
            </div>
            <button
              onClick={sendMessage}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 flex items-center justify-center text-white transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* ── TAB: MEMBERS ── */}
      {activeTab === 'members' && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Project group: show limit bar */}
          {group.category === 'project' && group.memberLimit && (
            <div className="mb-4 bg-slate-50 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-slate-500">Member limit (4–8 rule)</span>
                <span className="text-[11px] font-bold text-blue-700">{group.members}/{group.memberLimit}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${limitColor}`}
                  style={{ width: `${memberLimitPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {memberLimitPct >= 100
                  ? 'Group is full. No new members can join.'
                  : `${group.memberLimit - group.members} slot(s) remaining`}
              </p>
            </div>
          )}

          {/* Study/Discussion: members hidden note */}
          {group.category !== 'project' && (
            <div className="mb-4 text-[12px] text-slate-400 bg-slate-50 rounded-xl p-3 italic">
              Member lists are not shown publicly for Study and Discussion groups.
            </div>
          )}

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Online — {onlineMembers.length}
          </p>
          {onlineMembers.map((m, i) => (
            <MemberRow key={i} m={m} />
          ))}

          {offlineMembers.length > 0 && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-4">
                Offline — {offlineMembers.length}
              </p>
              {offlineMembers.map((m, i) => (
                <MemberRow key={i} m={m} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── TAB: FILES ── */}
      {activeTab === 'files' && (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Shared files</p>
          {group.sharedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: f.color + '18' }}>
                <FileIcon color={f.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">All Groups</h1>
                <Link
                  to="/create-group"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M7 1.5L11 1.5M6.5 7.5c0-3-3 0-1.5-1.5S4.5 6.5 0 01-6.36-6.36L4.5 1.5a1.5 1.5 0 01-2.12-2.12l6.5-6.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M2 12h10M2 12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  New Group
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────
function MemberRow({ m }) {
  return (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
      <div className="relative flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: m.color }}
        >
          {m.av}
        </div>
        {m.online && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-700 truncate">{m.name}</div>
        <div className="font-mono text-[10px] text-slate-400">{m.id}</div>
      </div>
      {m.role === 'leader' && (
        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Leader</span>
      )}
      {m.role === 'you' && (
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">You</span>
      )}
    </div>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────
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
              <div className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors duration-300">{group.name}</div>
              <div className="font-mono text-sm text-slate-400 mt-1">{group.id}</div>
            </div>
          </div>
          {group.unread > 0 && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg">
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

// ─── Main AllGroups page ──────────────────────────────────────────────────────
export default function AllGroups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

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

  const filtered = groups.filter(g =>
    (catFilter === 'all' || g.category === catFilter) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.id.includes(search))
  )

  const onlineCount = groups.reduce((a, g) => a + g.online, 0)
  const projectCount = groups.filter(g => g.category === 'project').length
  const studyCount = groups.filter(g => g.category === 'study').length
  const discussionCount = groups.filter(g => g.category === 'discussion').length

  // persist groups whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ss_groups', JSON.stringify(groups))
    } catch (e) {
      // ignore
    }
  }, [groups])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#aed7ea', fontFamily: 'Inter, sans-serif' }}>
      {/* Main content - full width, no header */}
      <div className="flex-1 px-8 py-8 relative z-10">
        
        {/* Page header with blue text */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black tracking-tight mb-2" style={{ color: '#003097', fontFamily: 'Inter, sans-serif' }}>All Groups</h1>
              <p className="text-xl" style={{ color: '#4FC3F7', fontFamily: 'Inter, sans-serif' }}>
                {groups.length} groups · {onlineCount} people online
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/create-group"
                className="flex items-center gap-3 text-white text-xl font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#003097', fontFamily: 'Inter, sans-serif' }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path d="M7 1.5L11 1.5M6.5 7.5c0-3-3 0-1.5-1.5S4.5 6.5 0 01-6.36-6.36L4.5 1.5a1.5 1.5 0 01-2.12-2.12l6.5-6.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M2 12h10M2 12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                New Group
              </Link>
              <Link
                to="/groupjoined"
                className="flex items-center gap-3 text-white text-xl font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#4FC3F7', fontFamily: 'Inter, sans-serif' }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                My Groups
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row with theme */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Project',    count: projectCount,    cat: 'project',    icon: '🚀', color: '#003097' },
            { label: 'Study',      count: studyCount,      cat: 'study',      icon: '📚', color: '#4FC3F7' },
            { label: 'Discussion', count: discussionCount, cat: 'discussion', icon: '💬', color: '#6B7280' }
          ].map(s => (
            <button
              key={s.cat}
              onClick={() => setCatFilter(catFilter === s.cat ? 'all' : s.cat)}
              className={`group relative overflow-hidden rounded-xl p-6 text-left border-2 transition-all duration-300 hover:scale-105 ${
                catFilter === s.cat
                  ? 'text-white border-transparent shadow-lg'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 shadow-lg'
              }`}
              style={{ 
                backgroundColor: catFilter === s.cat ? s.color : 'white',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-4xl font-black" style={{ fontFamily: 'Inter, sans-serif' }}>{s.count}</div>
                <div className="text-lg font-semibold mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Search + filter with theme */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-6 py-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300 shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none" className="flex-shrink-0" style={{ color: '#4FC3F7' }}>
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              className="flex-1 bg-transparent outline-none text-xl placeholder-gray-400"
              style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {['all','project','study','discussion'].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`text-lg font-bold px-6 py-4 rounded-xl border-2 transition-all duration-300 capitalize hover:scale-105 ${
                catFilter === c
                  ? 'text-white border-transparent shadow-lg'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400 shadow-lg'
              }`}
              style={{ 
                backgroundColor: catFilter === c ? '#003097' : 'white',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Group cards grid - exactly 3 per row with enhanced cards */}
        {loading ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-6 animate-bounce">🔄</div>
            <div className="text-2xl font-semibold text-slate-400">Loading groups...</div>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">❌</div>
            <div className="text-2xl font-semibold text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-lg font-bold px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🔍</div>
            <div className="text-2xl font-semibold">No groups found</div>
            <div className="text-xl mt-3">Try a different search or filter</div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-3">
            {filtered.map(g => (
              <GroupCard
                key={g.id}
                group={g}
                onOpen={grp => navigate(`/group-joined/${grp.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

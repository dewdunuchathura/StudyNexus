import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { joinGroupForUser } from '../utils/groupMembership'
import '../styles/index.css'

const PREFIXES = ['it', 'bm', 'hs', 'en']
const idRegex = new RegExp(`^(${PREFIXES.join('|')})\\d{8}$`, 'i')

export default function CreateGroup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [groupCode, setGroupCode] = useState('')
  const [category, setCategory] = useState('project')
  const [groupName, setGroupName] = useState('')
  const [memberLimit, setMemberLimit] = useState('')
  const [membersVisible, setMembersVisible] = useState(true)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  function validate() {
    const e = {}
    if (!idRegex.test(groupCode.trim())) e.groupCode = 'ID must be 10 chars: it/bm/hs/en + 8 digits.'
    if (!groupName.trim()) e.groupName = 'Group name is required.'
    if (category === 'project') {
      const n = Number(memberLimit)
      if (!Number.isInteger(n) || n < 4 || n > 8) e.memberLimit = 'Project groups must have 4–8 members.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    setStatus('')
    if (!validate()) return
    
    // Show loading status
    setStatus('Creating group...')
    
    // Prepare data for API
    const groupData = {
      id: groupCode.trim(),
      name: groupName.trim(),
      category,
      memberLimit: category === 'project' ? Number(memberLimit) : null,
      membersVisible,
      creatorId: groupCode.trim()
    }

    // Call API to create group
    fetch('http://localhost:5000/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success alert
        alert(`✅ Group "${groupName}" created successfully!\n\nGroup ID: ${groupCode}\nCategory: ${category}\n\nRedirecting to All Groups...`)
        
        setStatus('Group created successfully. Redirecting...')
        setTimeout(() => navigate('/groups'), 1500)
      } else {
        // Handle API errors
        const e = {}
        if (data.message.includes('ID already exists')) {
          e.groupCode = data.message
        } else if (data.message.includes('name already exists')) {
          e.groupName = data.message
        } else if (data.message.includes('4-8 members')) {
          e.memberLimit = data.message
        } else {
          e.general = data.message
        }
        setErrors(e)
        setStatus('')
      }
    })
    .catch(error => {
      console.error('Error creating group:', error)
      setErrors({ general: 'Failed to create group. Please try again.' })
      setStatus('')
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-blue-600">Create Group</h2>
          <div className="flex gap-3">
            <Link to="/groups" className="text-lg text-blue-600 hover:text-blue-800 transition-colors">View All Groups</Link>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">Creator Group ID</label>
              <input
                className="mt-1 block w-full px-4 py-4 text-lg rounded-xl border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
                placeholder="it23665798"
                value={groupCode}
                maxLength={10}
                onChange={(ev) => setGroupCode(ev.target.value)}
              />
              {errors.groupCode && <p className="text-lg text-red-600 mt-2">{errors.groupCode}</p>}
            </div>

            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); if (e.target.value !== 'project') { setMembersVisible(false); setMemberLimit('') } else setMembersVisible(true) }}
                className="mt-1 block w-full px-4 py-4 text-lg rounded-xl border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
              >
                <option value="project">Project</option>
                <option value="study">Study</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">Group Name</label>
            <input
              className="mt-1 block w-full px-4 py-4 text-lg rounded-xl border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            {errors.groupName && <p className="text-lg text-red-600 mt-2">{errors.groupName}</p>}
          </div>

          {category === 'project' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">Member Limit (4–8)</label>
                <input
                  type="number"
                  min={4}
                  max={8}
                  value={memberLimit}
                  onChange={(e) => setMemberLimit(e.target.value)}
                  className="mt-1 block w-full px-4 py-4 text-lg rounded-xl border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
                />
                {errors.memberLimit && <p className="text-lg text-red-600 mt-2">{errors.memberLimit}</p>}
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={membersVisible} 
                  onChange={(e) => setMembersVisible(e.target.checked)} 
                  className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                />
                <label className="text-lg cursor-pointer" style={{ color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Members visible</label>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-6" style={{ backgroundColor: '#F0F9FF', border: '1px solid #4FC3F7' }}>
              <p className="text-lg" style={{ color: '#003097', fontFamily: 'Inter, sans-serif' }}>Study & Discussion groups do not show member lists publicly.</p>
            </div>
          )}

          <div className="pt-8">
            <button
              type="submit"
              className="w-full text-xl font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#003097', 
                color: '#FFFFFF', 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600
              }}
              disabled={status === 'Creating group...'}
            >
              {status === 'Creating group...' ? 'Creating group...' : 'Create Group'}
            </button>
          </div>

          {status && (
            <div className="mt-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#F0F9FF', border: '1px solid #4FC3F7' }}>
              <p className="text-lg" style={{ color: '#003097', fontFamily: 'Inter, sans-serif' }}>{status}</p>
            </div>
          )}

          {errors.general && (
            <div className="mt-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444' }}>
              <p className="text-lg" style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>{errors.general}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

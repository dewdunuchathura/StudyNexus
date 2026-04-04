import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import VoiceRecorder from './VoiceRecorder.jsx';
import FileUpload from './FileUpload.jsx';

export default function WhatsAppChat({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😎', '🤔', '😊', '👏', '🙏', '💯'];

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [groupId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/chat/groups/${groupId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Add some mock messages for demo
      setMessages([
        {
          _id: '1',
          senderId: 'user1',
          senderName: 'John Doe',
          senderAvatar: 'JD',
          senderColor: '#38BDF8',
          messageType: 'text',
          content: 'Welcome to the group chat! 👋',
          createdAt: new Date(Date.now() - 10000),
          status: 'read'
        },
        {
          _id: '2',
          senderId: currentUserId,
          senderName: 'You',
          senderAvatar: 'YU',
          senderColor: '#10B981',
          messageType: 'text',
          content: 'Thanks! Excited to be here! 🎉',
          createdAt: new Date(Date.now() - 5000),
          status: 'read'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Handle typing indicators (simplified)
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText && attachedFiles.length === 0) return;

    const messageData = {
      groupId,
      senderId: currentUserId,
      senderName: 'You',
      senderAvatar: 'YU',
      senderColor: '#10B981',
      replyTo: null
    };

    // Always add message locally first for immediate feedback
    if (messageText) {
      const newMessage = {
        _id: Date.now().toString(),
        ...messageData,
        messageType: 'text',
        content: messageText,
        createdAt: new Date(),
        status: 'sent',
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      scrollToBottom();
    }

    // Try to send to backend (optional)
    try {
      if (messageText) {
        const response = await fetch('http://localhost:5000/api/chat/groups/' + groupId + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...messageData,
            content: messageText
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update message with server response if needed
          console.log('Message sent to server:', data);
        }
      } else if (attachedFiles.length > 0) {
        // Handle file uploads
        for (const file of attachedFiles) {
          const formData = new FormData();
          formData.append('file', file.file);
          formData.append('groupId', groupId);
          formData.append('senderId', currentUserId);
          formData.append('senderName', 'You');
          formData.append('senderAvatar', 'YU');
          formData.append('senderColor', '#10B981');

          const response = await fetch('http://localhost:5000/api/chat/groups/' + groupId + '/upload', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [...prev, data.data]);
          }
        }
      }
    } catch (error) {
      console.log('Backend not available, message saved locally:', error);
      // Don't show error to user, message is already displayed locally
    }
    
    setAttachedFiles([]);
  };

  const handleFileSelect = (files) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${f} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Group Chat</h3>
            <p className="text-sm text-gray-500">
              {messages.length} messages • {isTyping ? 'Someone typing...' : 'Active'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <path d="M12 1v6M12 17v6M8 12h8"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span>Someone is typing...</span>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
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
                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Emoji Picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              😊
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 grid grid-cols-6 gap-1 z-10">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <FileUpload onFileSelect={handleFileSelect} />

          {/* Voice Recorder */}
          <VoiceRecorder onRecordingComplete={(voiceData) => {
            // Send voice message
            sendVoiceMessage(voiceData);
          }} />

          {/* Text Input */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              style={{ color: '#1F2937' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!input.trim() && attachedFiles.length === 0}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12l-4.93-4.93L4.93 15.93 3 21h4.02L16 8.4 5.6 6.6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  async function sendVoiceMessage(voiceData) {
    try {
      const formData = new FormData();
      formData.append('audio', voiceData.audioBlob);
      formData.append('groupId', groupId);
      formData.append('senderId', currentUserId);
      formData.append('senderName', 'You');
      formData.append('senderAvatar', 'YU');
      formData.append('senderColor', '#10B981');
      formData.append('duration', voiceData.duration);

      const response = await fetch('http://localhost:5000/api/chat/groups/' + groupId + '/voice', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Voice message will be received via socket or we can add it directly
        setMessages(prev => [...prev, data.data]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  }
}

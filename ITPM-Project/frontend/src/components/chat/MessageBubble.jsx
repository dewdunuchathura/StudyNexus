import React from 'react';

export default function MessageBubble({ message, isOwn }) {
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.fileUrl} 
              alt={message.fileName}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            <p className="text-xs text-gray-600">{message.fileName}</p>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-2">
            <video 
              controls
              className="max-w-xs rounded-lg"
              preload="metadata"
            >
              <source src={message.fileUrl} type={message.mimeType} />
            </video>
            <p className="text-xs text-gray-600">{message.fileName}</p>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-3 bg-black/10 rounded-lg p-3">
            <button 
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white"
              onClick={() => {
                const audio = document.getElementById(`audio-${message._id}`);
                if (audio.paused) {
                  audio.play();
                } else {
                  audio.pause();
                }
              }}
            >
              {message.isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded-full flex items-center px-2">
                {message.waveform && message.waveform.length > 0 ? (
                  <div className="flex items-center gap-0.5 h-full">
                    {message.waveform.map((point, index) => (
                      <div 
                        key={index}
                        className="bg-blue-400 rounded-full"
                        style={{ 
                          width: '2px', 
                          height: `${point.amplitude}%`,
                          alignSelf: 'center'
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-1 bg-blue-400 rounded-full w-1/3"></div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 min-w-[40px]">{message.duration}</span>
            <audio 
              id={`audio-${message._id}`}
              src={message.fileUrl}
              className="hidden"
              onPlay={() => message.isPlaying = true}
              onPause={() => message.isPlaying = false}
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B82F6">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{message.fileName}</p>
              <p className="text-xs text-gray-500">
                {(message.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <button 
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              onClick={() => window.open(message.fileUrl, '_blank')}
            >
              Download
            </button>
          </div>
        );
      
      default:
        return <p className="text-sm text-gray-500">Unsupported message type</p>;
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: message.senderColor }}
        >
          {message.senderAvatar || message.senderName?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name & Time */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="font-semibold" style={{ color: isOwn ? '#38BDF8' : '#6B7280' }}>
            {isOwn ? 'You' : message.senderName}
          </span>
          <span style={{ color: '#9CA3AF' }}>
            {message.formattedTime}
          </span>
        </div>

        {/* Message Bubble */}
        <div 
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
          }`}
        >
          {renderMessageContent()}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 rounded-full px-2 py-1 hover:bg-gray-200 transition-colors cursor-pointer"
                  title={`${reaction.userName} reacted at ${new Date(reaction.addedAt).toLocaleTimeString()}`}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span style={{ color: '#9CA3AF' }}>
            {message.status === 'read' && '✓✓'}
            {message.status === 'delivered' && '✓'}
            {message.status === 'sent' && '○'}
          </span>
          {message.isEdited && (
            <span className="text-gray-500 italic">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}

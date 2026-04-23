import React, { useRef, useState } from 'react';

export default function FileUpload({ onFileSelect, accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: getFileType(file.type)
    }));

    setPreviewFiles(prev => [...prev, ...newFiles]);
    onFileSelect(newFiles);
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${f} ${sizes[i]}`;
  };

  const removeFile = (index) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
        title="Attach file"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19-9.19a6 6 0 0 0-8.49 0L2.5 2.5a6 6 0 0 0 0 8.49l9.19 9.19a6 6 0 0 0 8.49 0l2.5-2.5z"/>
          <path d="M7.5 15.5V9a1.5 1.5 0 0 1 3h8a1.5 1.5 0 0 1 3v6.5a1.5 1.5 0 0 1-3h-8a1.5 1.5 0 0 1-3z"/>
        </svg>
      </button>

      {/* File Preview */}
      {previewFiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {previewFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  {file.type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : file.type === 'video' ? (
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
                        <path d="M17 10.5V7c0-.55-.45-1-1H4c-.55 0-1 .45-1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                  ) : file.type === 'audio' ? (
                    <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#10B981">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5s-5-2.24-5-5"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  title="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 17 5.41 15.59 4 7 4 7.41 6.59 12 11.59 13.41 15 13.41 16.83 12 19 17.59 18.41 20 6.41z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                onFileSelect(previewFiles.map(f => f.file));
                setPreviewFiles([]);
              }}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Upload {previewFiles.length} file{previewFiles.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        className={`absolute inset-0 border-2 border-dashed rounded-lg transition-colors pointer-events-none ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-transparent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}

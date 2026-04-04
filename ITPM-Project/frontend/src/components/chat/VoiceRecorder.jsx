import React, { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        
        // Generate waveform data (simplified)
        const duration = recordingTime;
        const waveform = Array.from({ length: 20 }, (_, i) => ({
          time: i * (duration / 20),
          amplitude: Math.random() * 80 + 20
        }));
        
        onRecordingComplete({
          audioBlob: blob,
          audioUrl: url,
          duration: formatTime(duration),
          waveform
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start animation
      if (animationRef.current) {
        animationRef.current.style.animationPlayState = 'running';
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record voice messages');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop animation
      if (animationRef.current) {
        animationRef.current.style.animationPlayState = 'paused';
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioURL('');
    chunksRef.current = [];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center text-white"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              )}
            </button>
            
            <button
              onClick={stopRecording}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-white animate-pulse"
              title="Stop"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </button>
            
            <button
              onClick={cancelRecording}
              className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors flex items-center justify-center text-white"
              title="Cancel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 17 5.41 15.59 4 7 4 7.41 6.59 12 11.59 13.41 15 13.41 16.83 12 19 17.59 18.41 20 6.41z"/>
              </svg>
            </button>
          </div>
          
          {/* Recording Timer */}
          <div className="flex items-center gap-2 text-red-500 font-medium">
            <div className="flex items-center gap-1">
              <div 
                ref={animationRef}
                className="w-1 h-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  animation: 'pulse 1.5s infinite'
                }}
              ></div>
              <span>{formatTime(recordingTime)}</span>
            </div>
            <span className="text-sm">Recording...</span>
          </div>
        </>
      ) : (
        <>
          {/* Start Recording Button */}
          <button
            onClick={startRecording}
            className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors flex items-center justify-center text-white"
            title="Record voice message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        </>
      )}
      
      {/* Audio Preview */}
      {audioURL && (
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
          <audio controls className="h-8">
            <source src={audioURL} type="audio/webm" />
          </audio>
          <button
            onClick={() => {
              setAudioURL('');
              setAudioBlob(null);
              setRecordingTime(0);
            }}
            className="text-red-500 hover:text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

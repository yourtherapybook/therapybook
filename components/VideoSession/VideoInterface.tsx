import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  FileText,
  AlertTriangle,
  Settings,
  Maximize,
  Send,
  Paperclip
} from 'lucide-react';

interface VideoInterfaceProps {
  therapistName: string;
  sessionDuration: number;
}

const VideoInterface: React.FC<VideoInterfaceProps> = ({ therapistName, sessionDuration }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'therapist',
      content: 'Hello! I\'m glad you could make it today. How are you feeling?',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      sender: 'client',
      content: 'Hi Dr. Chen! I\'m doing okay, a bit nervous but excited to get started.',
      timestamp: new Date(Date.now() - 240000)
    }
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'client',
          content: message,
          timestamp: new Date()
        }
      ]);
      setMessage('');
    }
  };

  return (
    <div className="h-screen bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-neutral-900">
                Session with {therapistName}
              </span>
            </div>
            <div className="text-sm text-neutral-600">
              {formatTime(sessionDuration)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Video area */}
        <div className="flex-1 relative">
          {/* Therapist video */}
          <div className="h-full bg-neutral-800 flex items-center justify-center relative">
            <img
              src="https://images.pexels.com/photos/5214329/pexels-photo-5214329.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt={therapistName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
              {therapistName}
            </div>
            <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70">
              <Maximize className="h-5 w-5" />
            </button>
          </div>

          {/* Client video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-neutral-700 rounded-lg overflow-hidden shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <div className="text-white text-4xl font-bold">You</div>
            </div>
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              You {!isVideoEnabled && '(Camera Off)'}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-white border-l border-neutral-200 flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-neutral-600 hover:text-neutral-900 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === 'client'
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Video controls */}
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-3 rounded-full ${
              isVideoEnabled
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-full ${
              isAudioEnabled
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* End call */}
          <button className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600">
            <Phone className="h-5 w-5" />
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full ${
              isChatOpen
                ? 'bg-primary-100 text-primary-600'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* Notes */}
          <button className="p-3 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200">
            <FileText className="h-5 w-5" />
          </button>

          {/* Emergency resources */}
          <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm font-medium">
            Crisis Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInterface;
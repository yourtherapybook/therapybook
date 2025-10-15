import React, { useState, useEffect } from 'react';
import VideoInterface from '../components/VideoSession/VideoInterface';

const VideoSession: React.FC = () => {
  const [sessionDuration, setSessionDuration] = useState(1847); // 30:47 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <VideoInterface
      therapistName="Dr. Sarah Chen"
      sessionDuration={sessionDuration}
    />
  );
};

export default VideoSession;
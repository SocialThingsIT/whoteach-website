import React from 'react';
import ReactPlayer from 'react-player';

interface VideoProps {
  src: string;
}

const VideoPlayer = ({ src = 'https://www.youtube.com/watch?v=LXb3EKWsInQ' }: VideoProps) => {
  return (
    <div className="relative mx-auto aspect-video max-w-7xl overflow-hidden rounded-lg">
      <ReactPlayer src={src} width="100%" height="100%" />
    </div>
  );
};

export default VideoPlayer;

import React from 'react';
import ReactPlayer from 'react-player';

interface VideoProps {
  src: string;
  [key: string]: unknown;
}

const VideoPlayer = ({ src = 'https://www.youtube.com/watch?v=LXb3EKWsInQ', ...props }: VideoProps) => {
  return (
    <div className="px-6 sm:px-8">
      <div className="relative mx-auto aspect-video max-w-7xl overflow-hidden rounded-3xl">
        <ReactPlayer src={src} width="100%" height="100%" {...props} />
      </div>
    </div>
  );
};

export default VideoPlayer;

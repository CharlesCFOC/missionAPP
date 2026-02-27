"use client";

import { useEffect, useRef } from "react";

type LoopingVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "ref"
> & {
  playbackRate?: number;
};

export default function LoopingVideo({
  playbackRate = 1,
  onLoadedMetadata,
  onCanPlay,
  ...props
}: LoopingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  return (
    <video
      ref={videoRef}
      {...props}
      onLoadedMetadata={(event) => {
        event.currentTarget.playbackRate = playbackRate;
        onLoadedMetadata?.(event);
      }}
      onCanPlay={(event) => {
        event.currentTarget.playbackRate = playbackRate;
        onCanPlay?.(event);
      }}
    />
  );
}


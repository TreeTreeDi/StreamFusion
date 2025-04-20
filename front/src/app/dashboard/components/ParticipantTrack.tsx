'use client';
import React, { useEffect, useRef } from 'react';
import { Track, RemoteTrack } from 'livekit-client';

interface ParticipantTrackProps {
  track: RemoteTrack;
  isMainView?: boolean; // 添加 isMainView 属性
}

export default function ParticipantTrack({ track, isMainView = false }: ParticipantTrackProps) { // 解构并设置默认值
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let element: HTMLMediaElement | null = null;
    try {
      element = track.attach();
      // Apply styles using Tailwind classes based on view type
      if (track.kind === Track.Kind.Video) {
        if (isMainView) {
          // Main view: fill container
          element.classList.add('w-full', 'h-full', 'object-contain'); // 使用 object-contain 保证视频完整性
        } else {
          // Grid view: smaller size
          element.classList.add('max-w-[240px]', 'max-h-[180px]', 'rounded');
        }
        element.autoplay = true;
        (element as HTMLVideoElement).playsInline = true;
      } else {
        element.autoplay = true;
        // Optionally hide audio elements visually if needed
        // element.classList.add('hidden');
      }
      container.appendChild(element);
    } catch (e) {
      console.error(`ParticipantTrack attach failed for ${track.sid}:`, e);
    }

    return () => {
      if (element) {
        track.detach(element);
        if (container.contains(element)) {
          container.removeChild(element);
        }
      }
    };
  }, [track]);

  // Ensure the container div itself can fill the space if it's the main view
  const containerClasses = isMainView
    ? `track-${track.kind} w-full h-full`
    : `track-${track.kind} mt-1`;

  return <div ref={containerRef} className={containerClasses} />;
}

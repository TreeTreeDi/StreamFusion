'use client';
import React, { RefObject, useRef } from 'react'; // Added useRef
import { RemoteParticipant, RemoteTrack, Track } from 'livekit-client';
import ParticipantTrack from './ParticipantTrack';
import DanmakuDisplay from './DanmakuDisplay'; // Import DanmakuDisplay
import { ChatMessage } from '../hooks/useChat';   // Import ChatMessage

// Props interface for VideoArea
export interface VideoAreaProps {
  localRef: RefObject<HTMLVideoElement | null>; // 允许 ref 为 null
  isStreaming: boolean;
  isCamEnabled: boolean;
  participants: Map<string, RemoteParticipant>;
  tracks: Map<string, RemoteTrack[]>;
  role: 'host' | 'viewer'; // 添加 role 属性
  chatMessages: ChatMessage[]; // Add chatMessages prop
}

export default function VideoArea({
  localRef,
  isStreaming,
  isCamEnabled,
  participants,
  tracks,
  role, // Destructure role from props
  chatMessages, // Destructure chatMessages
}: VideoAreaProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null); // Ref for video container height

  console.log('[VideoArea] Rendering. Role:', role);
  console.log('[VideoArea] Participants:', participants);
  console.log('[VideoArea] Tracks:', tracks);

  // Find the main video track for viewer mode
  let mainParticipant: RemoteParticipant | null = null;
  let mainVideoTrack: RemoteTrack | null = null;

  if (role === 'viewer') {
    console.log('[VideoArea] Viewer mode: Searching for main video track...');
    // Use forEach for better compatibility
    // 注意：participants Map 的 key 是 Identity (变量名 'sid' 具有误导性)，我们需要用 participant.sid 去 tracks Map 查找
    participants.forEach((participant, identity) => { // 将第二个参数重命名为 identity 以明确
      console.log(`[VideoArea] Checking participant: ${participant.identity} (Identity: ${identity}, SID: ${participant.sid})`);
      // If we already found a main track, stop iterating
      if (mainVideoTrack) {
         console.log('[VideoArea] Main track already found, skipping further checks.');
         return;
      }

      // 使用 participant.sid 从 tracks Map 获取轨道
      const participantTracks = tracks.get(participant.sid) || [];
      console.log(`[VideoArea] Tracks for ${participant.identity} (using SID ${participant.sid}):`, participantTracks);
      const videoTrack = participantTracks.find(track => track.kind === Track.Kind.Video);
      console.log(`[VideoArea] Found video track for ${participant.identity}:`, videoTrack);

      if (videoTrack) {
        console.log(`[VideoArea] Found main video track! Participant: ${participant.identity}, Track SID: ${videoTrack.sid}`);
        mainParticipant = participant;
        mainVideoTrack = videoTrack;
        // Note: Cannot 'break' from forEach, but the check above achieves a similar result
      }
    });
    if (!mainVideoTrack) {
        console.log('[VideoArea] No main video track found after checking all participants.');
    }
  }

  return (
    <div className="flex-1 bg-black rounded flex flex-col"> {/* Changed background to black for video focus */}

      {/* Main Video Display Area */}
      <div ref={videoContainerRef} className="relative w-full aspect-video bg-black rounded overflow-hidden flex-shrink-0"> {/* Aspect ratio for video, add ref */}
        {role === 'host' ? (
          // Host sees their own preview large
          <>
            <video
              ref={localRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-contain ${isCamEnabled && isStreaming ? 'block' : 'hidden'}`} // Use object-contain
            />
            {(!isCamEnabled || !isStreaming) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400">
                {isStreaming ? 'Camera Off' : 'Not Streaming'}
              </div>
            )}
          </>
        ) : (
          // Viewer sees the main stream
          <>
            {mainVideoTrack ? (
              // Render the main track directly, ensuring it fills the container
              // Pass isMainView={true} to ParticipantTrack
              <div className="w-full h-full">
                 <ParticipantTrack track={mainVideoTrack} isMainView={true} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400">
                {participants.size > 0 ? 'Waiting for host stream...' : 'Stream Offline'}
              </div>
            )}
          </>
        )}
        {/* Danmaku Display - pass video container height */}
        <DanmakuDisplay messages={chatMessages} videoHeight={videoContainerRef.current?.clientHeight} />
      </div>

      {/* Optional: Small Thumbnails/Grid for other participants (Hidden for now for simplicity) */}
      {/*
      {role === 'viewer' && participants.size > 1 && (
        <div className="p-2 border-t border-dark-border">
          <h3 className="text-sm mb-1">Other Participants</h3>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from(participants.values())
              .filter(p => p.sid !== mainParticipant?.sid) // Exclude main participant
              .map(participant => (
                <div key={participant.sid} className="w-24 h-auto border border-dark-border rounded bg-dark-bg-secondary flex-shrink-0">
                  <p className="text-xs font-medium p-1 truncate">{participant.identity}</p>
                  {(tracks.get(participant.sid) || []).map(track => (
                     track.kind === Track.Kind.Video ? <ParticipantTrack key={track.sid} track={track} /> : null
                  ))}
                  {(tracks.get(participant.sid) || []).filter(t => t.kind === Track.Kind.Video).length === 0 && (
                     <div className="aspect-video bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">No Vid</div>
                  )}
                </div>
            ))}
          </div>
        </div>
      )}
      */}
    </div>
  );
}

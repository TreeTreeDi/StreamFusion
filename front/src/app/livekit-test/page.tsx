'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication, RemoteTrack, Participant, Track } from 'livekit-client';
import { getLiveKitToken } from '@/lib/livekit';
// Use existing components as requested
import VideoArea from './components/VideoArea'; // Keep existing VideoArea
import ChatPanel from './components/ChatPanel'; // Use ChatPanel
import ParticipantTrack from './components/ParticipantTrack'; // Keep using this

// Get LiveKit URL from environment variable
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
if (!LIVEKIT_URL) {
  console.error("NEXT_PUBLIC_LIVEKIT_WS_URL is not set in environment variables.");
}

export default function LiveKitTestPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [role, setRole] = useState<'host' | 'viewer'>('viewer');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [remoteTracks, setRemoteTracks] = useState<Map<string, RemoteTrack[]>>(new Map());

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // --- Connection Logic (Keep existing logic) ---
  const handleJoin = async () => {
    if (!username || !roomName || !LIVEKIT_URL) return;
    console.log(`Joining room ${roomName} as ${username} (${role})`);
    try {
      const isPublisher = role === 'host';
      const tokenResponse = await getLiveKitToken(roomName, isPublisher);
      if (!tokenResponse.success || !tokenResponse.data?.token) {
        throw new Error(tokenResponse.message || 'Failed to get LiveKit token');
      }
      const token = tokenResponse.data.token;
      console.log('LiveKit token received successfully.');

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      setRoom(newRoom);

      newRoom
        .on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          console.log('[React Way] Participant connected:', participant.identity, 'SID:', participant.sid);
          participant.trackPublications.forEach((publication: RemoteTrackPublication) => {
            console.log(`[React Way] Checking existing track publication on connect: ${publication.kind}, SID: ${publication.trackSid}, Subscribed: ${publication.isSubscribed}`);
            if (publication.isSubscribed && publication.track) {
               console.log(`[React Way] Adding existing subscribed track ${publication.trackSid} on connect.`);
               setRemoteTracks((prevTracks) => {
                 const newTracksMap = new Map(prevTracks);
                 const participantTracks = newTracksMap.get(participant.sid) || [];
                 if (!participantTracks.some(t => t.sid === publication.track!.sid)) {
                   newTracksMap.set(participant.sid, [...participantTracks, publication.track!]);
                 }
                 return newTracksMap;
               });
            }
          });
          setRemoteParticipants((prev) => new Map(prev).set(participant.sid, participant));
        })
        .on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          console.log('[React Way] Participant disconnected:', participant.identity, 'SID:', participant.sid);
          setRemoteParticipants((prev) => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid);
            return newMap;
          });
          setRemoteTracks((prev) => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid);
            console.log(`[React Way] Removed tracks for disconnected participant ${participant.sid}`);
            return newMap;
          });
        })
        .on(RoomEvent.TrackSubscribed, handleTrackSubscribed) // Use handler function
        .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed) // Use handler function
        .on(RoomEvent.DataReceived, handleDataReceived) // Add listener for chat messages
        .on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from room');
          setIsConnected(false);
          setIsStreaming(false);
          setRoom(null);
          setRemoteParticipants(new Map());
          setRemoteTracks(new Map());
          // Clear chat messages on disconnect if needed
        });

      await newRoom.connect(LIVEKIT_URL, token);
      console.log('Connected to room:', newRoom.name);
      setIsConnected(true);
      setRemoteParticipants(new Map(newRoom.remoteParticipants));

      const initialTracks = new Map<string, RemoteTrack[]>();
      newRoom.remoteParticipants.forEach((participant) => {
        const tracks: RemoteTrack[] = [];
        participant.trackPublications.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            console.log(`[React Way] Initializing with existing track ${publication.track.sid} from ${participant.identity}`);
            tracks.push(publication.track);
          }
        });
        if (tracks.length > 0) {
          initialTracks.set(participant.sid, tracks);
        }
      });
      setRemoteTracks(initialTracks);

      if (role === 'host') {
        console.log('Host connected, ready to stream.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert(`Failed to join room: ${error instanceof Error ? error.message : String(error)}`);
      setRoom(null);
    }
  };

  const handleLeave = async () => {
    console.log('Leaving room...');
    if (room) {
       if (role === 'host' && isStreaming) {
         await handleStopStream(); // Stop stream before disconnecting
       }
       await room.disconnect(); // Triggers 'Disconnected' event
    } else {
      setIsConnected(false);
      setIsStreaming(false);
      setRemoteParticipants(new Map());
      setRemoteTracks(new Map());
      setIsMicEnabled(true);
      setIsCamEnabled(true);
    }
  };

  // --- Media Logic (Keep existing logic) ---
  const handleTrackSubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[React Way] Track subscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      if (!participantTracks.some(t => t.sid === track.sid)) {
        newTracksMap.set(participant.sid, [...participantTracks, track]);
        console.log(`[React Way] Added track ${track.sid} to state for participant ${participant.sid}`);
      } else {
        console.log(`[React Way] Track ${track.sid} already in state for participant ${participant.sid}`);
      }
      return newTracksMap;
    });
  };

  const handleTrackUnsubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[React Way] Track unsubscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      const filteredTracks = participantTracks.filter(t => t.sid !== track.sid);

      if (filteredTracks.length === 0) {
        newTracksMap.delete(participant.sid);
        console.log(`[React Way] Removed participant ${participant.sid} from remoteTracks state (no tracks left).`);
      } else {
        newTracksMap.set(participant.sid, filteredTracks);
        console.log(`[React Way] Removed track ${track.sid} from state for participant ${participant.sid}.`);
      }
      return newTracksMap;
    });
  };

  const handleStartStream = async () => {
    if (!room || role !== 'host') return;
    console.log('Starting stream...');
    try {
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsStreaming(true);
      setIsCamEnabled(true);
      setIsMicEnabled(true);

      const localVideoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;
      if (localVideoTrack && localVideoRef.current) {
        localVideoTrack.attach(localVideoRef.current);
        console.log('Attached local video track.');
      } else {
         console.warn('Local video track not found or ref not available after enabling camera.');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      alert(`Failed to start stream: ${error instanceof Error ? error.message : String(error)}`);
      await room.localParticipant.setCameraEnabled(false);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
    }
  };

  const handleStopStream = async () => {
    if (!room || role !== 'host' || !isStreaming) return;
    console.log('Stopping stream...');
    try {
      await room.localParticipant.setCameraEnabled(false);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
      setIsCamEnabled(false);
      setIsMicEnabled(false);

      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
        console.log('Detached and stopped local video track.');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const toggleMic = async () => {
    if (!room || !isConnected) return;
    const newMicState = !isMicEnabled;
    console.log(`Toggling Mic to: ${newMicState}`);
    try {
        await room.localParticipant.setMicrophoneEnabled(newMicState);
        setIsMicEnabled(newMicState);
    } catch (error) {
        console.error('Error toggling microphone:', error);
        alert(`Failed to toggle mic: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleCam = async () => {
      if (!room || !isConnected) return;
      const newCamState = !isCamEnabled;
      console.log(`Toggling Cam to: ${newCamState}`);
      try {
          await room.localParticipant.setCameraEnabled(newCamState);
          setIsCamEnabled(newCamState);

          const localVideoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;
          if (newCamState && localVideoTrack && localVideoRef.current) {
              localVideoTrack.attach(localVideoRef.current);
              console.log('Re-attached local video track.');
          } else if (!newCamState && localVideoRef.current && localVideoRef.current.srcObject) {
              const stream = localVideoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
              localVideoRef.current.srcObject = null;
              console.log('Detached and stopped local video track.');
          }
      } catch (error) {
          console.error('Error toggling camera:', error);
          alert(`Failed to toggle cam: ${error instanceof Error ? error.message : String(error)}`);
          setIsCamEnabled(!newCamState); // Revert state if toggle failed
      }
  };

  // --- Chat Logic ---
  const [chatMessages, setChatMessages] = useState<{ identity: string; message: string }[]>([]);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
    const messageData = JSON.parse(decoder.decode(payload));
    const identity = participant?.identity ?? 'Server'; // Or handle identity based on your logic
    console.log(`Received message from ${identity}:`, messageData.message);
    setChatMessages((prev) => [...prev, { identity: identity, message: messageData.message }]);
  };

  const sendChatMessage = async (message: string) => {
    if (room && message.trim()) {
      const payload = encoder.encode(JSON.stringify({ message }));
      await room.localParticipant.publishData(payload, { reliable: true });
      // Optionally add own message to local state immediately
      setChatMessages((prev) => [...prev, { identity: username || 'Me', message: message }]);
      console.log('Sent message:', message);
    }
  };


  // --- UI Rendering ---
  return (
    <div className="flex flex-col h-[90vh] bg-gray-900 text-white">
      {/* Header/Controls Area */}
      <div className="p-4 bg-gray-800 shadow-md">
        {!isConnected ? (
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'host' | 'viewer')}
              className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="viewer">Viewer</option>
              <option value="host">Host</option>
            </select>
            <button
              onClick={handleJoin}
              disabled={!username || !roomName || !LIVEKIT_URL}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center justify-between">
            <span className="font-semibold">
              Connected as <strong className="text-purple-400">{username}</strong> in room <strong className="text-purple-400">{roomName}</strong> ({role})
            </span>
            <div className="flex gap-2">
              {role === 'host' && !isStreaming && (
                <button onClick={handleStartStream} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Start Streaming</button>
              )}
              {role === 'host' && isStreaming && (
                <button onClick={handleStopStream} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Stop Streaming</button>
              )}
              <button onClick={toggleMic} className={`px-4 py-2 rounded ${isMicEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>
              <button onClick={toggleCam} className={`px-4 py-2 rounded ${isCamEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isCamEnabled ? 'Stop Cam' : 'Start Cam'}
              </button>
              <button onClick={handleLeave} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Leave Room</button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area (Video + Chat) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area (Left Side) - Using existing component */}
        <div className="flex-1 p-4 overflow-y-auto bg-black"> {/* Added bg-black for video area */}
          {isConnected ? (
            <VideoArea
              localRef={localVideoRef} // Corrected prop name
              participants={remoteParticipants} // Corrected prop name
              tracks={remoteTracks} // Corrected prop name
              isStreaming={isStreaming}
              isCamEnabled={isCamEnabled}
              role={role}
              // Removed ParticipantTrackComponent prop
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Connect to a room to see the stream.
            </div>
          )}
        </div>

        {/* Chat Panel (Right Side) - Using existing component name */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
           {isConnected ? (
             <ChatPanel
               messages={chatMessages}
               onSendMessage={sendChatMessage}
             />
           ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
               Connect to chat.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

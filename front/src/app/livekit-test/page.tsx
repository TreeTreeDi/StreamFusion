'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication, RemoteTrack, Participant, Track } from 'livekit-client';
import { getLiveKitToken } from '@/lib/livekit'; // Import the function

// Get LiveKit URL from environment variable
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
// Add a check for the environment variable
if (!LIVEKIT_URL) {
  console.error("NEXT_PUBLIC_LIVEKIT_WS_URL is not set in environment variables.");
  // Consider adding a user-facing error message here
}

export default function LiveKitTestPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [role, setRole] = useState<'host' | 'viewer'>('viewer'); // 'host' or 'viewer'
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Host streaming state
  const [isMicEnabled, setIsMicEnabled] = useState(true); // Local mic state
  const [isCamEnabled, setIsCamEnabled] = useState(true); // Local cam state
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  // State to hold subscribed remote tracks: Map<ParticipantSID, RemoteTrack[]>
  const [remoteTracks, setRemoteTracks] = useState<Map<string, RemoteTrack[]>>(new Map());

  // Ref for local video element
  const localVideoRef = useRef<HTMLVideoElement>(null);
  // No longer need remoteVideoRefs


  // --- Connection Logic ---

  const handleJoin = async () => {
    if (!username || !roomName) return;
    console.log(`Joining room ${roomName} as ${username} (${role})`);

    try {
      // 1. Fetch Token using the library function
      console.log('Requesting LiveKit token...');
      const isPublisher = role === 'host';
      const tokenResponse = await getLiveKitToken(roomName, isPublisher);

      if (!tokenResponse.success || !tokenResponse.data?.token) {
        throw new Error(tokenResponse.message || 'Failed to get LiveKit token');
      }
      const token = tokenResponse.data.token;
      // Optionally use identity from response if needed: const identity = tokenResponse.data.identity;
      console.log('LiveKit token received successfully.');
      // 2. Create and Connect Room
      const newRoom = new Room({
        // Automatically manage quality based on visibility
        adaptiveStream: true,
        // Optimize publishing bandwidth and CPU for published tracks
        dynacast: true,
        // Publish settings
        // publishDefaults: {
        //   videoEncoding: videoPresets.h1080, // Example preset
        //   screenShareEncoding: videoPresets.h1080, // Example preset
        // },
      });

      setRoom(newRoom);

      // 3. Setup Event Listeners BEFORE connecting
      newRoom
        .on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          console.log('[Viewer Log] Participant connected:', participant.identity, 'SID:', participant.sid);
          // Log existing tracks for this participant upon connection
          // Correct property is trackPublications
          participant.trackPublications.forEach((publication: RemoteTrackPublication) => {
            console.log(`[React Way] Checking existing track publication on connect: ${publication.kind}, SID: ${publication.trackSid}, Subscribed: ${publication.isSubscribed}`);
            if (publication.isSubscribed && publication.track) {
               console.log(`[React Way] Adding existing subscribed track ${publication.trackSid} on connect.`);
               // Add track to state
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
          // Remove participant from both states
          setRemoteParticipants((prev) => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid);
            return newMap;
          });
          setRemoteTracks((prev) => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid); // Remove all tracks for this participant
            console.log(`[React Way] Removed tracks for disconnected participant ${participant.sid}`);
            return newMap;
          });
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log(`[Viewer Log] Received TrackSubscribed event: ${track.kind} from ${participant.identity} (Track SID: ${track.sid})`);
          handleTrackSubscribed(track, publication, participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          console.log(`[Viewer Log] Received TrackUnsubscribed event: ${track.kind} from ${participant.identity} (Track SID: ${track.sid})`);
          handleTrackUnsubscribed(track, publication, participant);
        })
        .on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from room');
          setIsConnected(false);
          setIsStreaming(false);
          setRoom(null);
          setRemoteParticipants(new Map());
          setRemoteTracks(new Map()); // Clear remote tracks on disconnect
        });


      // 4. Connect
      // Ensure LIVEKIT_URL is checked before connecting
      if (!LIVEKIT_URL) {
        throw new Error("LiveKit URL is not configured.");
      }
      await newRoom.connect(LIVEKIT_URL, token);
      console.log('Connected to room:', newRoom.name);
      setIsConnected(true);
      // Initialize with existing remote participants
      setRemoteParticipants(new Map(newRoom.remoteParticipants));
      // Also initialize remote tracks for existing participants upon joining
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

      // If host, maybe auto-start stream or enable button
      if (role === 'host') {
        // Enable the "Start Streaming" button, actual streaming logic is separate
        console.log('Host connected, ready to stream.');
      }


    } catch (error) {
      console.error('Error joining room:', error);
      alert(`Failed to join room: ${error instanceof Error ? error.message : String(error)}`);
      setRoom(null); // Clean up room state on error
    }
  };

  const handleLeave = async () => {
    console.log('Leaving room...');
    console.log('Leaving room...');
    if (room) {
       // Ensure tracks are unpublished before disconnecting
       if (role === 'host' && isStreaming) {
         await room.localParticipant.setCameraEnabled(false);
         await room.localParticipant.setMicrophoneEnabled(false);
         setIsStreaming(false); // Update state immediately
         // Detach local video
         if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
         }
       }
       await room.disconnect(); // This triggers the 'Disconnected' event listener for further cleanup
    } else {
      // Manual cleanup if room object wasn't fully set or connection failed midway
      // (States are already reset in the Disconnected event or here if no room)
      setIsConnected(false);
      setIsStreaming(false);
      setRemoteParticipants(new Map());
      setIsMicEnabled(true); // Reset local state
      setIsCamEnabled(true);
    }
  };

  // --- Media Logic ---

  // Update state when a track is subscribed
  const handleTrackSubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[React Way] Track subscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      // Avoid adding duplicate tracks
      if (!participantTracks.some(t => t.sid === track.sid)) {
        newTracksMap.set(participant.sid, [...participantTracks, track]);
        console.log(`[React Way] Added track ${track.sid} to state for participant ${participant.sid}`);
      } else {
        console.log(`[React Way] Track ${track.sid} already in state for participant ${participant.sid}`);
      }
      return newTracksMap;
    });
  };
  // Update state when a track is unsubscribed
  const handleTrackUnsubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[React Way] Track unsubscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      const filteredTracks = participantTracks.filter(t => t.sid !== track.sid);

      if (filteredTracks.length === 0) {
        newTracksMap.delete(participant.sid); // Remove participant entry if no tracks left
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
      // Publish camera and microphone tracks
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsStreaming(true);
      setIsCamEnabled(true);
      setIsMicEnabled(true);

      // Attach local video track to the video element
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
      // Attempt to revert state if publishing failed
      await room.localParticipant.setCameraEnabled(false);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
    }
  };

  const handleStopStream = async () => {
    if (!room || role !== 'host' || !isStreaming) return;
    console.log('Stopping stream...');
    try {
      // Unpublish camera and microphone tracks
      await room.localParticipant.setCameraEnabled(false);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
      setIsCamEnabled(false); // Reflect the state change
      setIsMicEnabled(false);

      // Detach local video track from the video element
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop()); // Stop the tracks
        localVideoRef.current.srcObject = null; // Clear the srcObject
        console.log('Detached and stopped local video track.');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      // State might be inconsistent here, but we primarily care about unpublishing
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

          // Re-attach or detach video based on the new state
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
          // Revert state if toggle failed
          setIsCamEnabled(!newCamState);
      }
  };


  // Log remote participants state on render
  // console.log('[React Way] Rendering component. Remote participants:', remoteParticipants);
  // console.log('[React Way] Rendering component. Remote tracks:', remoteTracks);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h1>LiveKit Test Page</h1>

      {!isConnected ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            style={{ padding: '8px' }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value as 'host' | 'viewer')} style={{ padding: '8px' }}>
            <option value="viewer">Viewer</option>
            <option value="host">Host</option>
          </select>
          <button onClick={handleJoin} disabled={!username || !roomName} style={{ padding: '8px 15px' }}>
            Join Room
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           <span>Connected as <strong>{username}</strong> in room <strong>{roomName}</strong> ({role})</span>
           {role === 'host' && !isStreaming && (
             <button onClick={handleStartStream} style={{ padding: '8px 15px' }}>Start Streaming</button>
           )}
           {role === 'host' && isStreaming && (
             <button onClick={handleStopStream} style={{ padding: '8px 15px' }}>Stop Streaming</button>
           )}
           {/* Show mic/cam status only when connected */}
           <button onClick={toggleMic} style={{ padding: '8px 15px' }}>{isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}</button>
           <button onClick={toggleCam} style={{ padding: '8px 15px' }}>{isCamEnabled ? 'Stop Cam' : 'Start Cam'}</button>
           <button onClick={handleLeave} style={{ padding: '8px 15px' }}>Leave Room</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Local Video Preview Area (Only if host and streaming) */}
        {role === 'host' && isConnected && (
          <div style={{ border: '1px solid #ccc', padding: '10px', minWidth: '320px', minHeight: '240px' }}>
            <h2>My Video</h2>
            <video ref={localVideoRef} autoPlay muted playsInline width="320" height="240" style={{ backgroundColor: '#eee', display: isCamEnabled && isStreaming ? 'block' : 'none' }}></video>
            {/* Show placeholder text when camera is off or not streaming */}
            {(!isCamEnabled || !isStreaming) && (
              <div style={{ width: '320px', height: '240px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isStreaming ? 'Camera Off' : 'Not Streaming'}
              </div>
            )}
          </div>
        )}
        {/* Remote Participants Video Area */}
        <div style={{ border: '1px solid #ccc', padding: '10px', flexGrow: 1 }}>
          <h2>Remote Participants ({remoteParticipants.size})</h2>
          <div id="remote-participants-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {/* Iterate over participants */}
            {Array.from(remoteParticipants.values()).map(participant => (
              <div key={participant.sid} style={{ border: '1px solid #eee', padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '250px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{participant.identity}</p>
                {/* Iterate over tracks for this participant from state */}
                {(remoteTracks.get(participant.sid) || []).map(track => (
                  // Render the dedicated component for each track
                  <ParticipantTrack key={track.sid} track={track} />
                ))}
              </div>
            ))}
            {isConnected && remoteParticipants.size === 0 && <p>Waiting for participants...</p>}
            {!isConnected && <p>Not connected</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


// --- ParticipantTrack Component ---
// This component handles rendering a single remote track

interface ParticipantTrackProps {
  track: RemoteTrack;
}

function ParticipantTrack({ track }: ParticipantTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn(`[ParticipantTrack] Container ref not ready for track ${track.sid}`);
      return;
    }

    console.log(`[ParticipantTrack] Attaching track ${track.sid} (${track.kind})`);
    let element: HTMLMediaElement | null = null;
    try {
        element = track.attach(); // LiveKit creates <video> or <audio>
        // Apply styles
        if (track.kind === Track.Kind.Video) {
            element.style.maxWidth = '240px';
            element.style.maxHeight = '180px';
            element.muted = false; // Ensure remote video is not muted by default
            element.autoplay = true;
            (element as HTMLVideoElement).playsInline = true; // Cast to HTMLVideoElement
        } else {
            // For audio tracks, ensure they play
            element.autoplay = true;
        }
        container.appendChild(element); // Add it to our container
        console.log(`[ParticipantTrack] Attached track ${track.sid} successfully.`);
    } catch (e) {
        console.error(`[ParticipantTrack] track.attach() failed for track ${track.sid}:`, e);
        return; // Stop if attach fails
    }


    // Cleanup function
    return () => {
      console.log(`[ParticipantTrack] Detaching track ${track.sid}`);
      if (element) {
          track.detach(element);
          // Check if element is still a child before removing (might already be removed by other means)
          if (container.contains(element)) {
              try {
                  container.removeChild(element);
                  console.log(`[ParticipantTrack] Removed media element for track ${track.sid}`);
              } catch (removeError) {
                  console.warn(`[ParticipantTrack] Error removing media element for track ${track.sid}:`, removeError);
              }
          }
      } else {
          console.warn(`[ParticipantTrack] Cleanup: Media element was null for track ${track.sid}`);
      }
    };
  }, [track]); // Re-run if the track prop changes

  // Render the container div that will hold the media element
  // Add a class based on track kind for potential styling
  return <div ref={containerRef} className={`track-${track.kind}`} style={{ marginTop: '5px' }}></div>; // Move closing parenthesis here
}

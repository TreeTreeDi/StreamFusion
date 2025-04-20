"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  ConnectionState,
  DataPacket_Kind,
} from 'livekit-client';
import { getLiveKitToken } from '@/lib/livekit'; // Assuming this path is correct

// Get LiveKit URL from environment variable
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
if (!LIVEKIT_URL) {
  console.error("NEXT_PUBLIC_LIVEKIT_WS_URL is not set in environment variables.");
}

// Define the type for the data received callback
type DataReceivedCallback = (payload: Uint8Array, participant?: RemoteParticipant) => void;

export function useLiveKitRoom(roomName: string, role: 'host' | 'viewer', username: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [remoteTracks, setRemoteTracks] = useState<Map<string, RemoteTrack[]>>(new Map());
  const dataReceivedCallbackRef = useRef<DataReceivedCallback | null>(null); // Ref to store the callback

  // Function to register the data received callback
  const setDataReceivedCallback = useCallback((callback: DataReceivedCallback) => {
    dataReceivedCallbackRef.current = callback;
  }, []);

  // --- Event Handlers ---
  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    console.log('[Hook] Participant connected:', participant.identity, 'SID:', participant.sid);
    setRemoteParticipants((prev) => new Map(prev).set(participant.sid, participant));
    // Check for existing tracks on connect (sometimes needed)
    participant.trackPublications.forEach((publication) => {
        if (publication.isSubscribed && publication.track) {
            handleTrackSubscribed(publication.track, publication, participant);
        }
    });
  }, []);

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    console.log('[Hook] Participant disconnected:', participant.identity, 'SID:', participant.sid);
    setRemoteParticipants((prev) => {
      const newMap = new Map(prev);
      newMap.delete(participant.sid);
      return newMap;
    });
    setRemoteTracks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(participant.sid);
      console.log(`[Hook] Removed tracks for disconnected participant ${participant.sid}`);
      return newMap;
    });
  }, []);

  const handleTrackSubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[Hook] Track subscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      if (!participantTracks.some(t => t.sid === track.sid)) {
        newTracksMap.set(participant.sid, [...participantTracks, track]);
        console.log(`[Hook] Added track ${track.sid} to state for participant ${participant.sid}`);
      } else {
        console.log(`[Hook] Track ${track.sid} already in state for participant ${participant.sid}`);
      }
      return newTracksMap;
    });
  }, []);

  const handleTrackUnsubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[Hook] Track unsubscribed: ${track.sid} from ${participant.identity}`);
    setRemoteTracks((prevTracks) => {
      const newTracksMap = new Map(prevTracks);
      const participantTracks = newTracksMap.get(participant.sid) || [];
      const filteredTracks = participantTracks.filter(t => t.sid !== track.sid);

      if (filteredTracks.length === 0) {
        newTracksMap.delete(participant.sid);
        console.log(`[Hook] Removed participant ${participant.sid} from remoteTracks state (no tracks left).`);
      } else {
        newTracksMap.set(participant.sid, filteredTracks);
        console.log(`[Hook] Removed track ${track.sid} from state for participant ${participant.sid}.`);
      }
      return newTracksMap;
    });
  }, []);

  const handleDataReceived = useCallback((payload: Uint8Array, participant?: RemoteParticipant) => {
    console.log('[Hook] Data received');
    // Call the registered callback if it exists
    if (dataReceivedCallbackRef.current) {
      dataReceivedCallbackRef.current(payload, participant);
    } else {
        console.warn('[Hook] Data received but no callback registered.');
    }
  }, []); // Dependency array is empty as it relies on the ref

  const handleDisconnected = useCallback(() => {
    console.log('[Hook] Disconnected from room');
    setIsConnected(false);
    setRoom(null);
    setRemoteParticipants(new Map());
    setRemoteTracks(new Map());
    // Reset other states managed by other hooks should happen in the component or those hooks
  }, []);


  // --- Connection Logic ---
  const connectRoom = useCallback(async () => {
    if (!roomName || !LIVEKIT_URL || !username) {
      console.error("[Hook] Room name, LiveKit URL, or username missing for connect.");
      return;
    }
    if (isConnected || room) {
        console.warn("[Hook] Already connected or connecting.");
        return;
    }

    console.log(`[Hook] Joining room ${roomName} as ${username} (${role})`);
    try {
      const isPublisher = role === 'host';
      const tokenResponse = await getLiveKitToken(roomName, isPublisher); // Corrected: Removed username argument
      if (!tokenResponse.success || !tokenResponse.data?.token) {
        throw new Error(tokenResponse.message || 'Failed to get LiveKit token');
      }
      const token = tokenResponse.data.token;
      const actualIdentity = tokenResponse.data.identity; // Backend provides identity
      console.log(`[Hook] LiveKit token received for identity: ${actualIdentity}.`);

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom
        .on(RoomEvent.ParticipantConnected, handleParticipantConnected)
        .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
        .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
        .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
        .on(RoomEvent.DataReceived, handleDataReceived) // Use the hook's handler
        .on(RoomEvent.Disconnected, handleDisconnected);
        // Consider adding RoomEvent.ConnectionStateChanged for finer state control

      setRoom(newRoom); // Set room state *before* connecting

      await newRoom.connect(LIVEKIT_URL, token);
      console.log('[Hook] Connected to room:', newRoom.name);
      setIsConnected(true);

      // Initialize participants and tracks after connection
      setRemoteParticipants(new Map(newRoom.remoteParticipants));
      const initialTracks = new Map<string, RemoteTrack[]>();
      newRoom.remoteParticipants.forEach((p) => {
        const tracks: RemoteTrack[] = [];
        p.trackPublications.forEach((pub) => {
          if (pub.isSubscribed && pub.track) {
            tracks.push(pub.track);
          }
        });
        if (tracks.length > 0) {
          initialTracks.set(p.sid, tracks);
        }
      });
      setRemoteTracks(initialTracks);

    } catch (error) {
      console.error('[Hook] Error joining room:', error);
      alert(`[Hook] Failed to join room: ${error instanceof Error ? error.message : String(error)}`);
      setRoom(null); // Ensure room is null on error
      setIsConnected(false);
    }
  }, [roomName, role, username, LIVEKIT_URL, room, isConnected, handleParticipantConnected, handleParticipantDisconnected, handleTrackSubscribed, handleTrackUnsubscribed, handleDataReceived, handleDisconnected]); // Add dependencies

  // --- Disconnection Logic ---
  const disconnectRoom = useCallback(async () => {
    if (room && isConnected) {
      console.log('[Hook] Disconnecting from room...');
      await room.disconnect(); // This will trigger the 'Disconnected' event handled above
    } else {
        console.log('[Hook] Not connected or no room object.');
        // Manually reset state if disconnect is called without a room/connection
        handleDisconnected();
    }
  }, [room, isConnected, handleDisconnected]);

  // Cleanup effect to disconnect on unmount
  useEffect(() => {
    return () => {
      if (room) {
        console.log('[Hook] Cleaning up: disconnecting room on unmount');
        room.disconnect();
      }
    };
  }, [room]);

  return {
    room,
    isConnected,
    remoteParticipants,
    remoteTracks,
    connectRoom,
    disconnectRoom,
    setDataReceivedCallback, // Expose the function to register the callback
  };
}

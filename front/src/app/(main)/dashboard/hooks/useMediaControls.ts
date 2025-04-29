"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Room, Track, LocalParticipant, RoomEvent } from 'livekit-client';

export function useMediaControls(room: Room | null, isConnected: boolean, role: 'host' | 'viewer') {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true); // Default to enabled? Or sync with initial state?
  const [isCamEnabled, setIsCamEnabled] = useState(true); // Default to enabled? Or sync with initial state?
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Function to attach or detach local video track
  const manageLocalVideoAttachment = useCallback((attach: boolean) => {
    if (!room?.localParticipant || !localVideoRef.current) return;

    const localVideoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;

    if (attach && localVideoTrack) {
      localVideoTrack.attach(localVideoRef.current);
      console.log('[Media Hook] Attached local video track.');
    } else if (!attach && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
      console.log('[Media Hook] Detached and stopped local video track.');
    }
  }, [room]);


  // Sync initial media state when connected as host
  useEffect(() => {
      if (isConnected && role === 'host' && room?.localParticipant) {
          // Set initial state based on LocalParticipant's actual state
          setIsMicEnabled(room.localParticipant.isMicrophoneEnabled);
          setIsCamEnabled(room.localParticipant.isCameraEnabled);
          // If camera is already enabled, attach video
          if (room.localParticipant.isCameraEnabled) {
              manageLocalVideoAttachment(true);
          }
      }
      // Reset state if disconnected
      if (!isConnected) {
          setIsStreaming(false);
          // Reset mic/cam to default? Or keep last state? Let's reset to true for now.
          setIsMicEnabled(true);
          setIsCamEnabled(true);
          manageLocalVideoAttachment(false); // Ensure detachment
      }
  }, [isConnected, role, room, manageLocalVideoAttachment]);


  const startStream = useCallback(async () => {
    if (!room || role !== 'host' || !isConnected) return;
    console.log('[Media Hook] Starting stream...');
    try {
      // Ensure tracks are enabled *before* attaching
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsStreaming(true);
      setIsCamEnabled(true);
      setIsMicEnabled(true);
      // Now attach the video
      manageLocalVideoAttachment(true);
    } catch (error) {
      console.error('[Media Hook] Error starting stream:', error);
      alert(`[Media Hook] Failed to start stream: ${error instanceof Error ? error.message : String(error)}`);
      // Attempt to revert state on error
      await room.localParticipant.setCameraEnabled(false).catch(e => console.error("Error disabling camera on start stream failure", e));
      await room.localParticipant.setMicrophoneEnabled(false).catch(e => console.error("Error disabling mic on start stream failure", e));
      setIsStreaming(false);
      setIsCamEnabled(false);
      setIsMicEnabled(false);
      manageLocalVideoAttachment(false);
    }
  }, [room, role, isConnected, manageLocalVideoAttachment]);

  const stopStream = useCallback(async () => {
    if (!room || role !== 'host' || !isStreaming || !isConnected) return;
    console.log('[Media Hook] Stopping stream...');
    try {
      // Detach video first
      manageLocalVideoAttachment(false);
      // Then disable tracks
      await room.localParticipant.setCameraEnabled(false);
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
      setIsCamEnabled(false);
      setIsMicEnabled(false);
    } catch (error) {
      console.error('[Media Hook] Error stopping stream:', error);
      // State might be inconsistent here, but UI state is already updated
    }
  }, [room, role, isStreaming, isConnected, manageLocalVideoAttachment]);

  const toggleMic = useCallback(async () => {
    if (!room || !isConnected) return;
    const newMicState = !isMicEnabled;
    console.log(`[Media Hook] Toggling Mic to: ${newMicState}`);
    try {
        await room.localParticipant.setMicrophoneEnabled(newMicState);
        setIsMicEnabled(newMicState);
    } catch (error) {
        console.error('[Media Hook] Error toggling microphone:', error);
        alert(`[Media Hook] Failed to toggle mic: ${error instanceof Error ? error.message : String(error)}`);
        // Revert UI state on error? Or trust the SDK's state? Let's trust SDK for now.
        // setIsMicEnabled(!newMicState);
    }
  }, [room, isConnected, isMicEnabled]);

  const toggleCam = useCallback(async () => {
      if (!room || !isConnected) return;
      const newCamState = !isCamEnabled;
      console.log(`[Media Hook] Toggling Cam to: ${newCamState}`);
      try {
          await room.localParticipant.setCameraEnabled(newCamState);
          setIsCamEnabled(newCamState);
          // Manage attachment based on the new state
          manageLocalVideoAttachment(newCamState);
      } catch (error) {
          console.error('[Media Hook] Error toggling camera:', error);
          alert(`[Media Hook] Failed to toggle cam: ${error instanceof Error ? error.message : String(error)}`);
          // Revert UI state on error
          setIsCamEnabled(!newCamState);
          manageLocalVideoAttachment(!newCamState); // Try to revert attachment too
      }
  }, [room, isConnected, isCamEnabled, manageLocalVideoAttachment]);

  // Listen for external changes to local tracks (e.g., permissions denied)
  useEffect(() => {
      if (!room?.localParticipant) return;

      const handleMediaEnableChanged = (trackPub: any) => { // Type might need refinement
          if (trackPub.source === Track.Source.Microphone) {
              setIsMicEnabled(trackPub.isMuted === false); // isMuted is opposite of enabled
          } else if (trackPub.source === Track.Source.Camera) {
              setIsCamEnabled(trackPub.isMuted === false);
              manageLocalVideoAttachment(trackPub.isMuted === false);
          }
      };

      // Using LocalTrackPublication events if available, or Participant events
      // Note: LiveKit event names/types might vary slightly across versions
      const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);

      // Example using hypothetical events (check LiveKit docs for exact events)
      // room.localParticipant.on(RoomEvent.LocalTrackPublished, handleMediaEnableChanged);
      // room.localParticipant.on(RoomEvent.LocalTrackUnpublished, handleMediaEnableChanged);
      // Or listen to track events directly if possible
      // micPub?.on('muted', () => setIsMicEnabled(false));
      // micPub?.on('unmuted', () => setIsMicEnabled(true));
      // camPub?.on('muted', () => { setIsCamEnabled(false); manageLocalVideoAttachment(false); });
      // camPub?.on('unmuted', () => { setIsCamEnabled(true); manageLocalVideoAttachment(true); });


      // Simplified: Re-check state on connection change (might miss some edge cases)
      const handleConnectionStateChange = (state: any) => {
          if (state === 'connected' && room?.localParticipant) {
              setIsMicEnabled(room.localParticipant.isMicrophoneEnabled);
              setIsCamEnabled(room.localParticipant.isCameraEnabled);
              manageLocalVideoAttachment(room.localParticipant.isCameraEnabled);
          }
      }
      room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);


      return () => {
          room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
          // Unsubscribe from other listeners if added above
      };
  }, [room, manageLocalVideoAttachment]);


  return {
    isStreaming,
    isMicEnabled,
    isCamEnabled,
    localVideoRef,
    startStream,
    stopStream,
    toggleMic,
    toggleCam,
  };
}

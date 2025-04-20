"use client";

import { useState, useEffect, useCallback } from 'react';
// Removed direct LiveKit client imports if no longer needed here
// import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication, RemoteTrack, Participant, Track } from 'livekit-client';

// Import Hooks
import { useRoomInitialization } from './hooks/useRoomInitialization';
import { useLiveKitRoom } from './hooks/useLiveKitRoom';
import { useMediaControls } from './hooks/useMediaControls';
import { useChat } from './hooks/useChat';

// Import Components
import VideoArea from './components/VideoArea';
import ChatPanel from './components/ChatPanel';

// Get LiveKit URL from environment variable (Keep this check)
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
if (!LIVEKIT_URL) {
  console.error("NEXT_PUBLIC_LIVEKIT_WS_URL is not set in environment variables.");
}

export default function LiveKitTestPage() {
  // --- Initialization Hook ---
  const {
    initialRoomName,
    initialRole,
    isAutoJoining,
    derivedUsername,
    // We might not need setters from init hook if we manage inputs separately
    // setInitialRoomName: setInputRoomName,
    // setInitialRole: setSelectedRole,
  } = useRoomInitialization();

  // --- Component State for User Inputs ---
  // Use component state to manage the input fields, initialized by the hook's values
  const [inputRoomName, setComponentInputRoomName] = useState('');
  const [selectedRole, setComponentSelectedRole] = useState<'host' | 'viewer'>('viewer');

  // Update component state when initial values change from the hook
  useEffect(() => {
    setComponentInputRoomName(initialRoomName);
  }, [initialRoomName]);

  useEffect(() => {
    setComponentSelectedRole(initialRole);
  }, [initialRole]);


  // --- LiveKit Room Hook ---
  // Pass the component's current input state to the room hook
  const {
    room,
    isConnected,
    remoteParticipants,
    remoteTracks,
    connectRoom,
    disconnectRoom,
    setDataReceivedCallback,
  } = useLiveKitRoom(inputRoomName, selectedRole, derivedUsername);

  // --- Media Controls Hook ---
  const {
    isStreaming,
    isMicEnabled,
    isCamEnabled,
    localVideoRef, // Get ref from the hook
    startStream,
    stopStream,
    toggleMic,
    toggleCam,
  } = useMediaControls(room, isConnected, selectedRole);

  // --- Chat Hook ---
  const { chatMessages, sendChatMessage, handleReceivedData } = useChat(room, derivedUsername);

  // --- Connect Hooks (Chat data callback) ---
  useEffect(() => {
    // Register the chat hook's data handler with the room hook
    // Pass the actual function reference to the setter
    setDataReceivedCallback(handleReceivedData);

    // Cleanup function to deregister (optional, depends on hook implementation)
    // Example: if setDataReceivedCallback(null) is supported by the hook
    // return () => setDataReceivedCallback(null);
  }, [setDataReceivedCallback, handleReceivedData]); // Add dependencies


  // --- Effect for Auto-Joining ---
  useEffect(() => {
    // Auto-join logic: If auto-joining is detected by init hook and we have the necessary info
    if (isAutoJoining && inputRoomName && derivedUsername && !isConnected && !room) {
      console.log('[Page] Auto-joining viewer with:', { derivedUsername, inputRoomName, selectedRole });
      connectRoom(); // Call connect from the hook
    }
    // Manual join is now handled by the button's onClick directly calling connectRoom
  }, [isAutoJoining, inputRoomName, selectedRole, derivedUsername, isConnected, room, connectRoom]);


  // --- UI Event Handlers ---
  const handleManualJoinClick = () => {
      if (!LIVEKIT_URL || !inputRoomName || !derivedUsername) {
          alert("Please ensure Room Name is filled and you are logged in.");
          return;
      }
      console.log('[Page] Attempting manual join...');
      connectRoom(); // Trigger connection using hook function
  };

  const handleLeaveClick = async () => {
      console.log('[Page] Leaving room...');
      // Use selectedRole from component state to check if host
      if (selectedRole === 'host' && isStreaming) {
          await stopStream(); // Ensure stream is stopped before disconnecting
      }
      disconnectRoom(); // Trigger disconnection using hook function
  };


  // --- UI Rendering ---
  return (
    <div className="flex flex-col h-[90vh] bg-gray-900 text-white">
      {/* Header/Controls Area */}
      <div className="p-4 bg-gray-800 shadow-md">
        {!isConnected ? (
          <div className="flex gap-4 items-center">
            {/* Conditional Rendering for Inputs/Button */}
            {!isAutoJoining ? (
              <>
                {/* Room Name Input */}
                <input
                  type="text"
                  placeholder="Room Name"
                  value={inputRoomName}
                  onChange={(e) => setComponentInputRoomName(e.target.value)} // Use component state setter
                  className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isAutoJoining} // Disable if auto-joining
                />
                 {/* Role Select */}
                 <select
                   value={selectedRole}
                   onChange={(e) => setComponentSelectedRole(e.target.value as 'host' | 'viewer')} // Use component state setter
                   className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                   disabled={isAutoJoining} // Disable if auto-joining
                 >
                   <option value="viewer">Viewer</option>
                   <option value="host">Host</option>
                 </select>
                 {/* Join Button */}
                 <button
                   onClick={handleManualJoinClick} // Use new handler
                   // Disable if required info is missing or auto-joining
                   disabled={!LIVEKIT_URL || !inputRoomName || !derivedUsername || isAutoJoining}
                   className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Join Room
                 </button>
              </>
            ) : (
              /* Optional: Show a message while auto-joining */
              <span className="text-gray-400">Joining room {inputRoomName}...</span>
            )}
          </div>
        ) : (
          // Connected state UI
          <div className="flex gap-4 items-center justify-between">
            <span className="font-semibold">
              {/* Use derivedUsername and component state for display */}
              Connected as <strong className="text-purple-400">{derivedUsername}</strong> in room <strong className="text-purple-400">{inputRoomName}</strong> ({selectedRole})
            </span>
             <div className="flex gap-2">
               {/* Use selectedRole from component state */}
               {selectedRole === 'host' && !isStreaming && (
                 <button onClick={startStream} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Start Streaming</button>
               )}
               {selectedRole === 'host' && isStreaming && (
                 <button onClick={stopStream} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Stop Streaming</button>
               )}
               {/* Mic/Cam toggles */}
               <button onClick={toggleMic} className={`px-4 py-2 rounded ${isMicEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
                 {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
               </button>
               <button onClick={toggleCam} className={`px-4 py-2 rounded ${isCamEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
                 {isCamEnabled ? 'Stop Cam' : 'Start Cam'}
               </button>
               <button onClick={handleLeaveClick} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Leave Room</button>
             </div>
          </div>
        )}
      </div>

      {/* Main Content Area (Video + Chat) */}
       <div className="flex flex-1 overflow-hidden">
         {/* Video Area */}
         <div className="flex-1 p-4 overflow-y-auto bg-black">
           {isConnected ? (
             <VideoArea
               localRef={localVideoRef} // Pass ref from useMediaControls
               participants={remoteParticipants} // Pass state from useLiveKitRoom
               tracks={remoteTracks} // Pass state from useLiveKitRoom
               isStreaming={isStreaming} // Pass state from useMediaControls
               isCamEnabled={isCamEnabled} // Pass state from useMediaControls
               role={selectedRole} // Pass current role from component state
             />
           ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
               {isAutoJoining ? 'Connecting...' : 'Connect to a room to see the stream.'}
             </div>
           )}
         </div>

         {/* Chat Panel */}
         <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {isConnected ? (
              <ChatPanel
                messages={chatMessages} // Pass state from useChat
                onSendMessage={sendChatMessage} // Pass function from useChat
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {isAutoJoining ? 'Connecting...' : 'Connect to chat.'}
              </div>
            )}
         </div>
       </div>
    </div>
  );
}

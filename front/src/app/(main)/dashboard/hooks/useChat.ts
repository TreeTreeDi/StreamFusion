"use client";
import { useState, useCallback, useEffect } from 'react';
import { Room, RemoteParticipant, DataPacket_Kind } from 'livekit-client';

// Define the structure of a chat message
export interface ChatMessage {
  identity: string;
  message: string;
  timestamp?: number; // Add timestamp as optional for now
}

// Define the structure of the data payload
interface ChatPayload {
    message: string;
    senderUsername: string;
}

export function useChat(room: Room | null, username: string) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Function to handle incoming data packets (to be called by useLiveKitRoom)
  const handleReceivedData = useCallback((payload: Uint8Array, participant?: RemoteParticipant) => {
    try {
        const messageData = JSON.parse(decoder.decode(payload)) as ChatPayload;
        // Use senderUsername from payload if available, otherwise fallback to participant identity
        const identity = messageData.senderUsername || participant?.identity || 'Unknown User';
        console.log(`[Chat Hook] Received message from ${identity}:`, messageData.message);
        setChatMessages((prev) => [...prev, { identity: identity, message: messageData.message }]);
    } catch (error) {
        console.error("[Chat Hook] Error decoding received data:", error);
        // Optionally handle non-JSON messages or errors differently
        const fallbackMessage = decoder.decode(payload);
        const identity = participant?.identity || 'Unknown User';
         console.log(`[Chat Hook] Received non-JSON message from ${identity}:`, fallbackMessage);
         // Decide if you want to display raw messages:
         // setChatMessages((prev) => [...prev, { identity: identity, message: `Raw: ${fallbackMessage}` }]);
    }
  }, [decoder]); // Decoder instance is stable

  // Function to send a chat message
  const sendChatMessage = useCallback(async (message: string) => {
    if (room && message.trim() && username) {
      const payloadObject: ChatPayload = {
        message: message,
        senderUsername: username // Include sender's username in the payload
      };
      const payload = encoder.encode(JSON.stringify(payloadObject));
      try {
        // Corrected: Pass options object instead of DataPacket_Kind directly
        await room.localParticipant.publishData(payload, { reliable: true });
        // Add own message to local state immediately for better UX
        setChatMessages((prev) => [...prev, { identity: username, message: message }]);
        console.log('[Chat Hook] Sent message:', message, 'as', username);
      } catch (error) {
          console.error("[Chat Hook] Error sending message:", error);
          // Optionally notify the user about the failure
      }
    } else {
        console.warn("[Chat Hook] Cannot send message. Room not connected, message empty, or username missing.", { hasRoom: !!room, message: message, username });
    }
  }, [room, username, encoder]); // Encoder instance is stable

  // Clear messages when the room changes (e.g., disconnect/reconnect)
  useEffect(() => {
      // Reset chat when room becomes null (disconnected)
      if (!room) {
          setChatMessages([]);
      }
      // If you want to clear chat on *connecting* to a *new* room instance,
      // you might need a more sophisticated check, perhaps involving room.sid
      // For now, clearing on disconnect covers the main case.
  }, [room]);


  return {
    chatMessages,
    sendChatMessage,
    handleReceivedData, // Expose this to be used as a callback
  };
}

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  identity: string;
  message: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent page reload
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage(''); // Clear input after sending
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      {/* Chat Header (Optional) */}
      <div className="p-3 border-b border-gray-700 text-center font-semibold">
        Live Chat
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="text-sm break-words">
            <span className="font-semibold text-purple-400">{msg.identity}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
        {/* Dummy div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-3 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Send a message..."
            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;

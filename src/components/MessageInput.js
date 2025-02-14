import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function MessageInput() {
  const [message, setMessage] = useState("");
  const { sendMessage, loading, currentThread } = useAssistant();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentThread) return;

    await sendMessage(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          currentThread
            ? "Type your message..."
            : "Select or create a thread to start chatting"
        }
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
        disabled={loading || !currentThread}
      />
      <button
        type="submit"
        disabled={loading || !message.trim() || !currentThread}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;

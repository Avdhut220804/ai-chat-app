import React from "react";
import ThreadList from "./ThreadList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAssistant } from "../context/AssistantContext";

function ChatInterface() {
  const { currentThread } = useAssistant();

  return (
    <div className="main-container">
      <div className="sidebar">
        <ThreadList />
      </div>
      <div className="chat-content">
        {currentThread ? (
          <>
            <div className="chat-header">
              <h2 className="thread-title">{currentThread.title}</h2>
            </div>
            <div className="messages-container">
              <MessageList />
            </div>
            <div className="input-container">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to AI Chat</h2>
              <p className="welcome-message">
                Select a conversation or start a new one to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;

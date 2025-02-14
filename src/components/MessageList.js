import React, { useEffect, useRef } from "react";
import { useAssistant } from "../context/AssistantContext";

function MessageList() {
  const { messages, loading } = useAssistant();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessageContent = (content) => {
    if (typeof content === "string") return content;

    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === "text") {
          // Split text by newlines and render paragraphs
          return item.text.value.split("\n").map((line, i) => (
            <p key={`${index}-${i}`} className="mb-2">
              {line}
            </p>
          ));
        }
        if (item.type === "image") {
          return (
            <img
              key={index}
              src={item.image_url}
              alt="Assistant generated"
              className="max-w-full h-auto rounded-lg my-2"
            />
          );
        }
        return null;
      });
    }

    return JSON.stringify(content);
  };

  return (
    <div className="messages-list flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-wrapper flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`message-bubble max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="sender-name text-sm mb-1 opacity-75">
              {message.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="message-content prose prose-sm">
              {renderMessageContent(message.content)}
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="typing-indicator-wrapper flex justify-start">
          <div className="typing-indicator bg-gray-100 rounded-lg p-4">
            <div className="typing-dots flex space-x-1">
              <div className="dot w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="dot w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="dot w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;

import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import FileUpload from "./FileUpload";
import { useAssistant } from "../context/AssistantContext";

function ChatInterface() {
  const { currentThread, selectedAssistant } = useAssistant();
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {currentThread ? (
        <>
          <div className="chat-header p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {currentThread.title || `Chat ${currentThread.id.slice(0, 8)}`}
            </h2>
            {selectedAssistant && (
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                {showFiles ? "Hide Files" : "Show Files"}
              </button>
            )}
          </div>

          <div className="flex-1 flex">
            <div
              className={`flex flex-col ${
                showFiles ? "w-2/3" : "w-full"
              } transition-all duration-300`}
            >
              <div className="flex-1 overflow-auto p-4">
                <MessageList />
              </div>
              <div className="p-4 border-t border-gray-800">
                <MessageInput />
              </div>
            </div>

            {showFiles && (
              <div className="w-1/3 border-l border-gray-800 p-4 bg-gray-900 overflow-y-auto">
                <h3 className="text-xl font-semibold text-white mb-4">Files</h3>
                <FileUpload />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
            <p>Select a conversation or start a new one to begin chatting</p>
            {selectedAssistant && (
              <div className="mt-8">
                <FileUpload />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;

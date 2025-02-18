import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import FileUpload from "./FileUpload";
import EditAssistantModal from "./EditAssistantModal";
import { useAssistant } from "../context/AssistantContext";

function ChatInterface() {
  const { currentThread, selectedAssistant } = useAssistant();
  const [showFiles, setShowFiles] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10">
        <h2 className="text-xl font-semibold text-white">
          {currentThread
            ? currentThread.title || `Chat ${currentThread.id.slice(0, 8)}`
            : "No Thread Selected"}
        </h2>

        {selectedAssistant && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 
                       transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Configure Assistant
            </button>

            <button
              onClick={() => setShowFiles(!showFiles)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 
                       transition-colors duration-200 flex items-center gap-2 shadow-sm"
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
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-gray-900">
        <div className="h-full flex">
          <div
            className={`${
              showFiles ? "w-2/3" : "w-full"
            } transition-all duration-300`}
          >
            <div className="h-full overflow-y-auto">
              {currentThread ? (
                <MessageList />
              ) : (
                <div className="flex-1 flex items-center justify-center h-full text-gray-400">
                  {selectedAssistant
                    ? "Select or create a thread to start chatting"
                    : "Select an assistant to start chatting"}
                </div>
              )}
            </div>
          </div>

          <div
            className={`w-1/3 border-l border-gray-800 bg-gray-900 overflow-y-auto transition-all duration-300 ${
              showFiles ? "block" : "hidden"
            }`}
          >
            <div className="p-4">
              <FileUpload />
            </div>
          </div>
        </div>
      </div>

      {currentThread && (
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <MessageInput />
        </div>
      )}

      {selectedAssistant && (
        <EditAssistantModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          assistantId={selectedAssistant.id}
        />
      )}
    </div>
  );
}

export default ChatInterface;

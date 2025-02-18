import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function ThreadList() {
  const {
    threads,
    currentThread,
    createNewThread,
    loadThread,
    deleteThread,
    updateThreadTitle,
    selectedAssistant,
  } = useAssistant();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleThreadClick = (thread) => {
    if (currentThread?.id !== thread.id) {
      loadThread(thread.id);
    }
  };

  const handleEdit = (thread, e) => {
    e.stopPropagation(); // Prevent thread selection when clicking edit
    setEditingId(thread.id);
    setEditTitle(thread.title || `Chat ${thread.id.slice(0, 8)}`);
  };

  const handleSave = (threadId, e) => {
    e.stopPropagation(); // Prevent thread selection when saving
    if (editTitle.trim()) {
      updateThreadTitle(threadId, editTitle.trim());
    }
    setEditingId(null);
  };

  // Only show the New Chat button if an assistant is selected
  return (
    <div className="p-4 text-white">
      {selectedAssistant && (
        <button
          onClick={createNewThread}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 
                   rounded-lg mb-6 transition-all duration-200 flex items-center 
                   justify-center shadow-lg hover:from-blue-600 hover:to-purple-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New Chat
        </button>
      )}

      <div className="space-y-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => handleThreadClick(thread)}
            className={`p-4 rounded-lg transition-all duration-200 cursor-pointer
                     ${
                       currentThread?.id === thread.id
                         ? "bg-blue-600"
                         : "bg-gray-800 hover:bg-gray-700"
                     }`}
          >
            <div className="flex items-center justify-between">
              {editingId === thread.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={(e) => handleSave(thread.id, e)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSave(thread.id, e)
                  }
                  className="bg-gray-700 text-white px-2 py-1 rounded w-full"
                  autoFocus
                />
              ) : (
                <div className="flex-1 cursor-pointer">
                  <h3 className="text-lg font-medium">
                    {thread.title || `Chat ${thread.id.slice(0, 8)}`}
                  </h3>
                </div>
              )}
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={(e) => handleEdit(thread, e)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(thread.id);
                  }}
                  className="p-1 hover:bg-gray-600 rounded text-red-400 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreadList;

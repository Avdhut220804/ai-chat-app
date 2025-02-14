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
  } = useAssistant();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEdit = (thread) => {
    setEditingId(thread.id);
    setEditTitle(thread.title || `Chat ${thread.id.slice(0, 8)}`);
  };

  const handleSave = (threadId) => {
    if (editTitle.trim()) {
      updateThreadTitle(threadId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="p-4 text-white">
      <button
        onClick={createNewThread}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg mb-6 
                 transition-colors duration-200 flex items-center justify-center 
                 shadow-lg hover:shadow-xl"
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
      <div className="space-y-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group relative flex items-center justify-between p-3 ${
              currentThread?.id === thread.id
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            } rounded-lg transition-all duration-200`}
          >
            <div
              onClick={() => !editingId && loadThread(thread.id)}
              className="flex-1 cursor-pointer"
            >
              {editingId === thread.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSave(thread.id)}
                  onKeyPress={(e) => e.key === "Enter" && handleSave(thread.id)}
                  className="w-full bg-gray-600 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <>
                  <div className="font-medium">
                    {thread.title || `Chat ${thread.id.slice(0, 8)}`}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(thread);
                }}
                className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.id);
                }}
                className="p-1 hover:bg-gray-600 rounded text-red-400 hover:text-red-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreadList;

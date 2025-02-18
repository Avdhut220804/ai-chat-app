import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function AssistantList() {
  const {
    assistants,
    createAssistant,
    selectAssistant,
    deleteAssistant,
    loading,
    selectedAssistant,
  } = useAssistant();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  // Static list of models
  const availableModels = [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o-mini" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedModel) return;

    try {
      await createAssistant(newTitle, instructions, selectedModel);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error("Error creating assistant:", error);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setInstructions("");
    setSelectedModel("");
  };

  const handleDelete = async (e, assistantId) => {
    e.stopPropagation(); // Prevent triggering select when clicking delete
    if (window.confirm("Are you sure you want to delete this assistant?")) {
      try {
        await deleteAssistant(assistantId);
      } catch (error) {
        console.error("Error deleting assistant:", error);
      }
    }
  };

  return (
    <div className="relative p-6 text-white max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          AI Assistants Hub
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                   rounded-lg hover:from-blue-600 hover:to-purple-700 
                   transition-all duration-300 flex items-center gap-2 shadow-lg
                   transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Assistant
        </button>
      </div>

      {/* Grid layout for assistants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            onClick={() => selectAssistant(assistant)}
            className={`relative group rounded-xl overflow-hidden transition-all duration-300 
                     ${
                       selectedAssistant?.id === assistant.id
                         ? "ring-4 ring-blue-500 shadow-xl transform scale-105"
                         : "hover:transform hover:scale-105"
                     }`}
          >
            <div
              className={`p-6 h-full backdrop-blur-sm
                         ${
                           selectedAssistant?.id === assistant.id
                             ? "bg-gradient-to-br from-blue-600/90 to-purple-700/90"
                             : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 hover:from-gray-700/90 hover:to-gray-800/90"
                         }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {assistant.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(e, assistant.id)}
                    disabled={loading}
                    className="p-2 rounded-full hover:bg-red-600/20 text-red-400 
                             hover:text-red-300 transition-all duration-300 opacity-0 
                             group-hover:opacity-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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

                {/* Model Badge */}
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                    {assistant.model || "GPT Model"}
                  </span>
                </div>

                {/* Selection Indicator */}
                {selectedAssistant?.id === assistant.id && (
                  <div className="absolute bottom-4 right-4">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating new assistant */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Create New Assistant
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Research Assistant"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="What should your assistant do?"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                  required
                >
                  <option value="">Select a model</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 
                           transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedModel}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                           rounded-lg hover:from-blue-600 hover:to-purple-700
                           transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Assistant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssistantList;

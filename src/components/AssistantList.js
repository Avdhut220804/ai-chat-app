import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function AssistantList() {
  const { assistants, createAssistant, selectAssistant, loading } =
    useAssistant();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  // Static list of models
  const availableModels = [
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-4-turbo-preview", name: "GPT-4 Turbo" },
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

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">AI Assistants</h1>

      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg mb-6 
                 transition-colors duration-200 flex items-center justify-center"
      >
        Create New Assistant
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="mb-4 space-y-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Assistant Title"
            className="w-full p-2 bg-gray-700 rounded"
            required
          />

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions (optional)"
            className="w-full p-2 bg-gray-700 rounded"
            rows={3}
          />

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
            required
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedModel}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {/* List of assistants */}
      <div className="space-y-2">
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            onClick={() => selectAssistant(assistant)}
            className="p-4 bg-gray-800 rounded-lg cursor-pointer 
                     hover:bg-gray-700 transition-colors duration-200"
          >
            <h3 className="text-lg font-medium">{assistant.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssistantList;

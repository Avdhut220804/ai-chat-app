import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function AssistantList() {
  const { assistants, createAssistant, selectAssistant, loading } =
    useAssistant();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAssistant(newTitle, instructions);
      setShowCreateForm(false);
      setNewTitle("");
      setInstructions("");
    } catch (error) {
      console.error("Error creating assistant:", error);
    }
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
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-gray-800 p-4 rounded-lg"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Assistant Name
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            onClick={() => selectAssistant(assistant)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer 
                     transition-colors duration-200"
          >
            <h3 className="font-medium">{assistant.title}</h3>
            <p className="text-sm text-gray-400">
              Created: {new Date(assistant.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssistantList;

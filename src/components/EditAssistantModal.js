import React, { useState, useEffect, useCallback } from "react";
import { useAssistant } from "../context/AssistantContext";

function EditAssistantModal({ isOpen, onClose, assistantId }) {
  const { getAssistantDetails, updateAssistant, loading } = useAssistant();
  const [assistantData, setAssistantData] = useState({
    name: "",
    instructions: "",
    model: "",
  });

  const loadAssistantDetails = useCallback(async () => {
    try {
      const details = await getAssistantDetails(assistantId);
      setAssistantData({
        name: details.name,
        instructions: details.instructions,
        model: details.model,
      });
    } catch (error) {
      console.error("Error loading assistant details:", error);
    }
  }, [assistantId, getAssistantDetails]);

  useEffect(() => {
    if (isOpen && assistantId) {
      loadAssistantDetails();
    }
  }, [isOpen, assistantId, loadAssistantDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAssistant(assistantId, assistantData);
      onClose();
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Edit Assistant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Name</label>
            <input
              type="text"
              value={assistantData.name}
              onChange={(e) =>
                setAssistantData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Instructions</label>
            <textarea
              value={assistantData.instructions}
              onChange={(e) =>
                setAssistantData((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              className="w-full p-2 bg-gray-700 text-white rounded h-40"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Model</label>
            <input
              type="text"
              value={assistantData.model}
              disabled
              className="w-full p-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAssistantModal;

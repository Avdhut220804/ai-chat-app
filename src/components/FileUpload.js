import React, { useState } from "react";
import { useAssistant } from "../context/AssistantContext";

function FileUpload() {
  const { selectedAssistant, uploadFilesToVectorStore, loading } =
    useAssistant();
  const [files, setFiles] = useState([]);
  const [vectorStoreName, setVectorStoreName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setShowNameInput(true);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !selectedAssistant || !vectorStoreName) return;

    try {
      await uploadFilesToVectorStore(files, vectorStoreName);
      setFiles([]);
      setVectorStoreName("");
      setShowNameInput(false);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Vector Store</h3>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-600 file:text-white
                 hover:file:bg-blue-700"
        accept=".txt,.pdf,.doc,.docx"
      />

      {showNameInput && (
        <form onSubmit={handleUpload} className="mt-4">
          <input
            type="text"
            value={vectorStoreName}
            onChange={(e) => setVectorStoreName(e.target.value)}
            placeholder="Enter vector store name"
            className="w-full p-2 bg-gray-700 rounded-lg text-white mb-2"
            required
          />

          <button
            type="submit"
            disabled={loading || !vectorStoreName}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-colors duration-200
                     disabled:opacity-50"
          >
            {loading ? "Processing..." : "Create Vector Store and Upload Files"}
          </button>
        </form>
      )}

      {files.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-400">Selected files:</p>
          <ul className="list-disc list-inside">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-400">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileUpload;

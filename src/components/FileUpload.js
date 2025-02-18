import React, { useState, useEffect, useRef } from "react";
import { useAssistant } from "../context/AssistantContext";
import { assistantService } from "../services/assistantService";

function FileUpload() {
  const {
    selectedAssistant,
    createVectorStoreForAssistant,
    addFilesToVectorStore,
    deleteFileFromVectorStore,
    loading,
    selectAssistant,
  } = useAssistant();

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [vectorStoreName, setVectorStoreName] = useState("");
  const [currentVectorStore, setCurrentVectorStore] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (selectedAssistant?.vectorStore) {
        try {
          setCurrentVectorStore(selectedAssistant.vectorStore);
          const files = await assistantService.getFilesByVectorStoreId(
            selectedAssistant.vectorStore
          );
          setExistingFiles(files);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      } else {
        setCurrentVectorStore("");
        setExistingFiles([]);
      }
    };

    fetchFiles();
  }, [selectedAssistant]);

  useEffect(() => {
    if (!selectedAssistant?.vectorStore) {
      setCurrentVectorStore("");
      setExistingFiles([]);
      setFiles([]);
      setVectorStoreName("");
    }
  }, [selectedAssistant?.vectorStore]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!selectedAssistant?.vectorStore) return;

    try {
      await deleteFileFromVectorStore(selectedAssistant.vectorStore, fileId);
      // Refresh the file list
      const updatedFiles = await assistantService.getFilesByVectorStoreId(
        selectedAssistant.vectorStore
      );
      setExistingFiles(updatedFiles);
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      // Optionally show an error message to the user
    }
  };

  const handleCreateVectorStore = async (e) => {
    e.preventDefault();
    if (!vectorStoreName || !selectedAssistant) return;

    try {
      const vectorStore = await createVectorStoreForAssistant(vectorStoreName);
      setCurrentVectorStore(vectorStore);
      setVectorStoreName("");
    } catch (error) {
      console.error("Error creating vector store:", error);
    }
  };

  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (!files.length || !currentVectorStore) return;
    try {
      await addFilesToVectorStore(currentVectorStore, files);
      // Clear the file input using the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleDeleteVectorStore = async () => {
    if (
      !selectedAssistant?.vectorStore ||
      !window.confirm(
        "Are you sure you want to delete this vector store? This will delete all associated files and cannot be undone."
      )
    ) {
      return;
    }

    try {
      await assistantService.deleteVectorStore(selectedAssistant.vectorStore);

      // Clear local state
      setCurrentVectorStore(null);
      setExistingFiles([]);
      setFiles([]);
      setVectorStoreName("");

      // Refresh the assistant data
      if (selectedAssistant && selectedAssistant.id) {
        const updatedAssistant = await assistantService.getAssistantById(
          selectedAssistant.id
        );
        selectAssistant(updatedAssistant); // Use selectAssistant from context instead
      }
    } catch (error) {
      console.error("Error deleting vector store:", error);
    }
  };

  if (!selectedAssistant) return null;

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
      {!selectedAssistant?.vectorStore ? (
        // Show vector store creation form
        <>
          <h3 className="text-lg font-medium mb-4">Create Vector Store</h3>
          <form onSubmit={handleCreateVectorStore}>
            <input
              type="text"
              value={vectorStoreName || ""}
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
              {loading ? "Creating..." : "Create Vector Store"}
            </button>
          </form>
        </>
      ) : (
        // Show file upload interface
        <>
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-300">Vector Store Connected</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add files to enhance your assistant's knowledge
                </p>
              </div>
              <button
                onClick={handleDeleteVectorStore}
                disabled={loading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded
                         hover:bg-red-700 transition-colors duration-200
                         disabled:opacity-50"
              >
                Delete Vector Store
              </button>
            </div>
          </div>

          {/* File Upload Form */}
          <form onSubmit={handleUploadFiles} className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              className="w-full p-2 bg-gray-700 rounded-lg text-white mb-2"
              accept=".pdf,.doc,.docx,.txt"
            />
            <button
              type="submit"
              disabled={loading || !files.length}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors duration-200
                       disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
            </button>
          </form>

          {/* Selected Files Section */}
          {files.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Selected Files:
              </h4>
              <div className="space-y-2">
                {Array.from(files).map((file, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-300 bg-gray-700 p-2 rounded"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Files Section - Always visible */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Files in Vector Store:
            </h4>
            <div className="space-y-2">
              {existingFiles.length > 0 ? (
                existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-300">
                      {file.filename}
                    </span>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                      disabled={loading}
                      className="p-1 hover:bg-gray-600 rounded text-red-400 
                               hover:text-red-500 transition-colors duration-200"
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
                ))
              ) : (
                <div className="text-sm text-gray-400 p-2 bg-gray-700 rounded-lg">
                  No files uploaded yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FileUpload;

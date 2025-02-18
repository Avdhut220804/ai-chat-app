import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import * as openaiService from "../services/openaiService";
import { threadService } from "../services/threadService";
import { assistantService } from "../services/assistantService";

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);

  // Move loadAllThreads inside useCallback to prevent recreation on every render
  const loadAllThreads = useCallback(async () => {
    if (!selectedAssistant) return;

    try {
      const threadsData = await threadService.getAllThreads(
        selectedAssistant.id
      );
      // Sort threads by creation date, newest first
      const sortedThreads = threadsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setThreads(sortedThreads);
    } catch (error) {
      console.error("Error loading threads:", error);
    }
  }, [selectedAssistant]); // Add selectedAssistant as dependency

  // Update useEffect to include loadAllThreads in dependencies
  useEffect(() => {
    if (selectedAssistant) {
      loadAllThreads();
    } else {
      setThreads([]);
    }
  }, [selectedAssistant, loadAllThreads]); // Add both dependencies

  // Load assistants on mount
  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      const data = await assistantService.getAllAssistants();
      setAssistants(data);
    } catch (error) {
      console.error("Error loading assistants:", error);
    }
  };

  const createNewThread = async () => {
    if (!selectedAssistant) return;

    try {
      setLoading(true);
      // Create thread in OpenAI first
      const newThread = await openaiService.createThread();

      // Then save to database with selected assistant's ID
      const savedThread = await threadService.createThread(
        newThread.id,
        selectedAssistant.id
      );

      const threadInfo = {
        id: savedThread.id,
        assistantId: savedThread.assistantId,
        createdAt: savedThread.createdAt,
      };

      setThreads((prev) => [threadInfo, ...prev]);
      setCurrentThread(threadInfo);
      setMessages([]);
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (threadId) => {
    try {
      setLoading(true);
      setMessages([]); // Clear current messages while loading

      // Find thread in local state
      const thread = threads.find((t) => t.id === threadId);
      if (!thread) {
        throw new Error("Thread not found");
      }
      setCurrentThread(thread);

      // Load messages from OpenAI
      try {
        const threadMessages = await openaiService.getMessages(threadId);
        setMessages(threadMessages.reverse());
      } catch (error) {
        console.error("Error loading messages from OpenAI:", error);

        // If thread doesn't exist in OpenAI, remove it from database and state
        if (error.status === 404) {
          await threadService.deleteThread(threadId);
          setThreads((prev) => prev.filter((t) => t.id !== threadId));
          setCurrentThread(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error loading thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      setLoading(true);

      // Try to delete from OpenAI first
      try {
        await openaiService.deleteThread(threadId);
      } catch (error) {
        console.error("Error deleting thread from OpenAI:", error);
        // Continue if thread doesn't exist in OpenAI
      }

      // Delete from database
      await threadService.deleteThread(threadId);

      // Update local state
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!currentThread || !content.trim() || !selectedAssistant) return;

    try {
      setLoading(true);

      // Send user message
      const userMessage = await openaiService.sendMessage(
        currentThread.id,
        content
      );
      setMessages((prev) => [...prev, userMessage]);

      // Run the assistant with selectedAssistant.id
      const run = await openaiService.runAssistant(
        currentThread.id,
        selectedAssistant.id
      );

      let timeoutCounter = 0;
      const maxAttempts = 60; // 60 seconds timeout
      const pollInterval = 1000; // 1 second between checks

      // Poll for completion
      const checkCompletion = setInterval(async () => {
        try {
          timeoutCounter++;
          if (timeoutCounter > maxAttempts) {
            clearInterval(checkCompletion);
            throw new Error("Assistant response timeout");
          }

          const runStatus = await openaiService.checkRunStatus(
            currentThread.id,
            run.id
          );

          if (runStatus.status === "completed") {
            clearInterval(checkCompletion);
            const newMessages = await openaiService.getMessages(
              currentThread.id
            );
            setMessages(newMessages.reverse());
            setLoading(false);
          } else if (runStatus.status === "failed") {
            clearInterval(checkCompletion);
            console.error("Run failed with error:", runStatus.last_error);
            throw new Error(
              `Assistant run failed: ${
                runStatus.last_error?.message || "Unknown error"
              }`
            );
          } else if (runStatus.status === "cancelled") {
            clearInterval(checkCompletion);
            throw new Error("Assistant run was cancelled");
          } else if (runStatus.status === "expired") {
            clearInterval(checkCompletion);
            throw new Error("Assistant run expired");
          }
          // Other statuses (queued, in_progress) will continue polling
        } catch (error) {
          clearInterval(checkCompletion);
          console.error("Error in run completion check:", error);
          // Add the error message to the chat
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: {
                    value: `Error: ${
                      error.message || "Something went wrong. Please try again."
                    }`,
                  },
                },
              ],
            },
          ]);
          setLoading(false);
        }
      }, pollInterval);

      // Cleanup interval on component unmount
      return () => clearInterval(checkCompletion);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Add the error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: {
                value: `Error: ${
                  error.message || "Failed to send message. Please try again."
                }`,
              },
            },
          ],
        },
      ]);
      setLoading(false);
    }
  };

  const updateThreadTitle = async (threadId, newTitle) => {
    try {
      setLoading(true);
      const updatedThread = await threadService.updateThreadTitle(
        threadId,
        newTitle
      );
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, title: updatedThread.title }
            : thread
        )
      );
      if (currentThread?.id === threadId) {
        setCurrentThread((prev) => ({ ...prev, title: updatedThread.title }));
      }
    } catch (error) {
      console.error("Error updating thread title:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAssistant = async (title, instructions, model) => {
    try {
      setLoading(true);
      const newAssistant = await assistantService.createAssistant(
        title,
        instructions,
        model
      );
      setAssistants((prev) => [...prev, newAssistant]);
      return newAssistant;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectAssistant = (assistant) => {
    setSelectedAssistant(assistant);
    setCurrentThread(null);
    setMessages([]);
  };

  const createVectorStoreForAssistant = async (vectorStoreName) => {
    if (!selectedAssistant) return;

    try {
      setLoading(true);
      // Create a vector store
      const vectorStore = await assistantService.createVectorStore(
        vectorStoreName
      );

      // Attach vector store to assistant
      const updatedAssistant =
        await assistantService.attachVectorStoreToAssistant(
          selectedAssistant.id,
          vectorStore.id
        );

      // Update assistants state
      setAssistants((prev) =>
        prev.map((ast) =>
          ast.id === selectedAssistant.id ? updatedAssistant : ast
        )
      );

      // Update selected assistant
      setSelectedAssistant(updatedAssistant);

      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addFilesToVectorStore = async (vectorStoreId, files) => {
    try {
      if (!selectedAssistant?.vectorStore) {
        throw new Error("No vector store selected");
      }
      await assistantService.uploadFilesToVectorStore(vectorStoreId, files);

      // Refresh the assistant to get updated file list
      const updatedAssistant = await assistantService.getAssistantById(
        selectedAssistant.id
      );
      setSelectedAssistant(updatedAssistant);
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const deleteFileFromVectorStore = async (vectorStoreId, fileId) => {
    if (!selectedAssistant) return;

    try {
      setLoading(true);
      // Delete file from both database and OpenAI
      await assistantService.deleteFileFromVectorStore(vectorStoreId, fileId);

      // Refresh assistant data to get updated file list
      const updatedAssistant = await assistantService.getAssistantById(
        selectedAssistant.id
      );

      // Update assistants state
      setAssistants((prev) =>
        prev.map((ast) =>
          ast.id === selectedAssistant.id ? updatedAssistant : ast
        )
      );

      // Update selected assistant
      setSelectedAssistant(updatedAssistant);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssistant = async (assistantId) => {
    try {
      setLoading(true);
      await assistantService.deleteAssistant(assistantId);

      // Update local state
      setAssistants((prev) => prev.filter((ast) => ast.id !== assistantId));

      // If the deleted assistant was selected, clear selection
      if (selectedAssistant?.id === assistantId) {
        setSelectedAssistant(null);
        setCurrentThread(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAssistantDetails = async (assistantId) => {
    try {
      const details = await assistantService.getAssistantDetails(assistantId);
      return details;
    } catch (error) {
      console.error("Error getting assistant details:", error);
      throw error;
    }
  };

  const updateAssistant = async (assistantId, updateData) => {
    try {
      setLoading(true);
      const updatedAssistant = await assistantService.updateAssistant(
        assistantId,
        updateData
      );

      // Update local state
      setAssistants((prev) =>
        prev.map((ast) =>
          ast.id === assistantId ? { ...ast, title: updateData.name } : ast
        )
      );

      if (selectedAssistant?.id === assistantId) {
        setSelectedAssistant((prev) => ({ ...prev, title: updateData.name }));
      }

      return updatedAssistant;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssistantContext.Provider
      value={{
        threads,
        currentThread,
        messages,
        loading,
        createNewThread,
        loadThread,
        sendMessage,
        deleteThread,
        updateThreadTitle,
        assistants,
        selectedAssistant,
        createAssistant,
        selectAssistant,
        createVectorStoreForAssistant,
        addFilesToVectorStore,
        deleteFileFromVectorStore,
        deleteAssistant,
        getAssistantDetails,
        updateAssistant,
        editingAssistant,
        setEditingAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}

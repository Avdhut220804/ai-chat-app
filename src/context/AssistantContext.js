import React, { createContext, useState, useContext, useEffect } from "react";
import * as openaiService from "../services/openaiService";
import { threadService } from "../services/threadService";
import { assistantService } from "../services/assistantService";

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  // Load threads from database when component mounts
  useEffect(() => {
    loadAllThreads();
  }, []);

  // Load assistants on mount
  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAllThreads = async () => {
    try {
      const threadsData = await threadService.getAllThreads();
      // Sort threads by creation date, newest first
      const sortedThreads = threadsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setThreads(sortedThreads);
    } catch (error) {
      console.error("Error loading threads:", error);
    }
  };

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
          console.log("Thread not found in OpenAI, cleaning up...");
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
      console.log("Sending message to thread:", currentThread.id);

      // Send user message
      const userMessage = await openaiService.sendMessage(
        currentThread.id,
        content
      );
      console.log("User message sent:", userMessage);
      setMessages((prev) => [...prev, userMessage]);

      // Run the assistant with selectedAssistant.id
      console.log("Running assistant with ID:", selectedAssistant.id);
      const run = await openaiService.runAssistant(
        currentThread.id,
        selectedAssistant.id
      );
      console.log("Assistant run created:", run);

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
          console.log("Run status:", runStatus.status);

          if (runStatus.status === "completed") {
            clearInterval(checkCompletion);
            const newMessages = await openaiService.getMessages(
              currentThread.id
            );
            console.log("New messages received:", newMessages);
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

  const createAssistant = async (title, instructions) => {
    try {
      setLoading(true);
      const newAssistant = await assistantService.createAssistant(
        title,
        instructions
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

import OpenAI from "openai";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const assistantService = {
  async createAssistant(title, instructions, model) {
    try {
      // Create assistant in OpenAI with selected model
      const openaiAssistant = await openai.beta.assistants.create({
        name: title,
        instructions: instructions || "You are a helpful AI assistant.",
        model: model,
        tools: [{ type: "file_search" }],
      });

      // Save to database
      const response = await axios.post(`${API_URL}/assistants`, {
        assistantId: openaiAssistant.id,
        title: title,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw error;
    }
  },

  async getAllAssistants() {
    try {
      const response = await axios.get(`${API_URL}/assistants`);
      return response.data;
    } catch (error) {
      console.error("Error getting assistants:", error);
      throw error;
    }
  },

  async getAssistantById(assistantId) {
    try {
      const response = await axios.get(`${API_URL}/assistants/${assistantId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting assistant:", error);
      throw error;
    }
  },

  async updateAssistantTitle(assistantId, title) {
    try {
      // Update in OpenAI
      await openai.beta.assistants.update(assistantId, {
        name: title,
      });

      // Update in our database
      const response = await axios.put(`${API_URL}/assistants/${assistantId}`, {
        title,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating assistant title:", error);
      throw error;
    }
  },

  async createVectorStore(name) {
    try {
      // Create vector store in OpenAI
      const vectorStore = await openai.beta.vectorStores.create({
        name: name,
      });

      // Save vector store reference in our database
      const response = await axios.post(`${API_URL}/vectorstores`, {
        vectorStoreId: vectorStore.id,
        name: name,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }
  },

  async uploadFilesToVectorStore(vectorStoreId, files) {
    try {
      const fileArray = Array.isArray(files) ? files : [files];

      // Upload files to OpenAI
      const openaiFiles = await Promise.all(
        fileArray.map(async (file) => {
          if (!file) throw new Error("File is missing");

          const openaiFile = await openai.files.create({
            file: file,
            purpose: "assistants",
          });

          // Save reference in database
          await axios.post(`${API_URL}/files`, {
            fileId: openaiFile.id,
            filename: file.name,
            vectorStoreId: vectorStoreId,
          });

          return openaiFile;
        })
      );
      const file_ids = openaiFiles.map((file) => file.id);

      // Attach files to vector store
      const result = await openai.beta.vectorStores.fileBatches.createAndPoll(
        vectorStoreId,
        {
          file_ids: file_ids,
        }
      );

      return result;
    } catch (error) {
      console.error("Error uploading files to vector store:", error);
      throw error;
    }
  },

  async attachVectorStoreToAssistant(assistantId, vectorStoreId) {
    try {
      // Update assistant with correct tool_resources format
      await openai.beta.assistants.update(assistantId, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
      });

      // Update vector store reference in our database
      const response = await axios.put(
        `${API_URL}/assistants/${assistantId}/vectorstore`,
        {
          vectorStore: vectorStoreId,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error attaching vector store to assistant:", error);
      throw error;
    }
  },

  async deleteAssistant(assistantId) {
    try {
      // Delete from our database first and get the list of thread IDs
      const response = await axios.delete(
        `${API_URL}/assistants/${assistantId}`
      );
      const { assistant, threadIds } = response.data;

      // Delete the assistant from OpenAI
      await openai.beta.assistants.del(assistantId);

      // Delete all threads from OpenAI
      for (const threadId of threadIds) {
        try {
          await openai.beta.threads.del(threadId);
        } catch (error) {
          // Log but continue if a thread deletion fails
          console.warn(
            `Failed to delete thread ${threadId} from OpenAI:`,
            error
          );
        }
      }

      return assistant;
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw error;
    }
  },

  async getFilesByVectorStoreId(vectorStoreId) {
    try {
      const response = await axios.get(
        `${API_URL}/files/vectorstore/${vectorStoreId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  },

  async deleteFileFromVectorStore(vectorStoreId, fileId) {
    try {
      // First delete from OpenAI files
      await openai.files.del(fileId);

      // Then delete from OpenAI vector store
      try {
        await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
      } catch (error) {
        // If the file is not found in vector store, continue with database deletion
        console.error(
          "File not found in vector store, continuing with cleanup..."
        );
      }

      // Finally delete from our database
      const response = await axios.delete(`${API_URL}/files/${fileId}`);

      if (!response.data) {
        throw new Error("Failed to delete file from database");
      }

      return true;
    } catch (error) {
      console.error("Error deleting file from vector store:", error);
      throw error;
    }
  },

  async deleteVectorStore(vectorStoreId) {
    try {
      // Delete from OpenAI
      await openai.beta.vectorStores.del(vectorStoreId);

      // Delete from our database (this will also detach it from assistants)
      const response = await axios.delete(
        `${API_URL}/vectorstores/${vectorStoreId}`
      );

      if (!response.data) {
        throw new Error("Failed to delete vector store from database");
      }

      return true;
    } catch (error) {
      console.error("Error deleting vector store:", error);
      throw error;
    }
  },

  async getAssistantDetails(assistantId) {
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      return assistant;
    } catch (error) {
      console.error("Error fetching assistant details:", error);
      throw error;
    }
  },

  async updateAssistant(assistantId, updateData) {
    try {
      const updatedAssistant = await openai.beta.assistants.update(
        assistantId,
        updateData
      );

      // Update in database
      await axios.put(`${API_URL}/assistants/${assistantId}`, {
        title: updateData.name,
      });

      return updatedAssistant;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw error;
    }
  },
};

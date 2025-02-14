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
      // Convert files to array if single file
      const fileArray = Array.isArray(files) ? files : [files];

      // Upload files to OpenAI
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // First upload file to OpenAI
        const openaiFile = await openai.files.create({
          file: file,
          purpose: "assistants",
        });

        // Save file reference in our database
        await axios.post(`${API_URL}/files`, {
          fileId: openaiFile.id,
          filename: file.name,
          vectorStoreId: vectorStoreId,
        });

        return openaiFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Create file streams for vector store
      const fileIds = uploadedFiles.map((file) => file.id);

      // Upload files to vector store
      await openai.beta.vectorStores.fileBatches.uploadAndPoll(
        vectorStoreId,
        fileIds
      );

      return uploadedFiles;
    } catch (error) {
      console.error("Error uploading files to vector store:", error);
      throw error;
    }
  },

  async attachVectorStoreToAssistant(assistantId, vectorStoreId) {
    try {
      // Update assistant with file_search tool
      await openai.beta.assistants.update(assistantId, {
        tools: [{ type: "file_search" }],
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
};

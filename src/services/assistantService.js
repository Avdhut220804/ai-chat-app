import OpenAI from "openai";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const assistantService = {
  async createAssistant(title, instructions) {
    try {
      // First create assistant in OpenAI
      const openaiAssistant = await openai.beta.assistants.create({
        name: title,
        instructions: instructions || "You are a helpful AI assistant.",
        model: "gpt-4-turbo-preview",
        tools: [{ type: "retrieval" }],
      });

      // Then save to our database
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
};

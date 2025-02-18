import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const threadService = {
  async createThread(threadId, assistantId) {
    try {
      const response = await axios.post(`${API_URL}/threads`, {
        threadId,
        assistantId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  },

  async getAllThreads(assistantId) {
    try {
      const response = await axios.post(`${API_URL}/threads/getAll`, {
        assistantId,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching threads:", error);
      throw error;
    }
  },

  async deleteThread(threadId) {
    try {
      const response = await axios.delete(`${API_URL}/threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  },

  async updateThreadTitle(threadId, title) {
    try {
      const response = await axios.put(`${API_URL}/threads/${threadId}`, {
        title,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating thread title:", error);
      throw error;
    }
  },
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const createThread = async () => {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

export const sendMessage = async (threadId, content) => {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const runAssistant = async (threadId, assistantId) => {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    return run;
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
};

export const getMessages = async (threadId) => {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

export const checkRunStatus = async (threadId, runId) => {
  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Log detailed information about failed runs
    if (run.status === "failed") {
      console.error("Run failed with details:", {
        status: run.status,
        lastError: run.last_error,
        failedAt: run.failed_at,
        completedAt: run.completed_at,
      });
    }

    return run;
  } catch (error) {
    console.error("Error checking run status:", error);
    throw error;
  }
};

export const deleteThread = async (threadId) => {
  try {
    await openai.beta.threads.del(threadId);
  } catch (error) {
    console.error("Error deleting thread from OpenAI:", error);
    throw error;
  }
};

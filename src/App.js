import React from "react";
import { useAssistant } from "./context/AssistantContext";
import AssistantList from "./components/AssistantList";
import ThreadList from "./components/ThreadList";
import ChatInterface from "./components/ChatInterface";

function App() {
  const { selectedAssistant } = useAssistant();

  return (
    <div className="flex h-screen bg-gray-900">
      {!selectedAssistant ? (
        <AssistantList />
      ) : (
        <>
          <div className="w-1/4 border-r border-gray-800">
            <ThreadList />
          </div>
          <div className="flex-1">
            <ChatInterface />
          </div>
        </>
      )}
    </div>
  );
}

export default App;

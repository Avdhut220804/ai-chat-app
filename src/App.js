import React from "react";
import { AssistantProvider } from "./context/AssistantContext";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <AssistantProvider>
      <ChatInterface />
    </AssistantProvider>
  );
}

export default App;

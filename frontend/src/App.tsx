import React from "react";
import { ChatProvider } from "./context/ChatContext";
import Playground from "./components/Playground";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 shadow">
        <h1 className="text-2xl font-bold text-center">AI Playground</h1>
        <p className="text-center text-gray-600">
          Engage in real-time conversations.
        </p>
      </header>

      <div className="flex-1">
        <ChatProvider>
          <Playground />
        </ChatProvider>
      </div>
    </div>
  );
};

export default App;

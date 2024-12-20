import React from "react";
import Chat from "./components/Chat";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 shadow">
        <h1 className="text-2xl font-bold text-center">AI Chatbot</h1>
        <p className="text-center text-gray-600">
          Engage in real-time conversations.
        </p>
      </header>

      <div className="flex-1">
        <Chat />
      </div>
    </div>
  );
};

export default App;

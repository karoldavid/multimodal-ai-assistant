import React from "react";
import "./Playground.css";
import Message from "./Message";
import ChatInput from "./ChatInput";
import FileUpload from "./FileUpload";
import useChat from "../hooks/useChat";

const Playgound: React.FC = () => {
  const { input, setInput, messages, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-white p-4">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
      />
      <div className="p-4 bg-gray-100 border-t border-gray-300 flex items-center">
        <FileUpload />
      </div>
    </div>
  );
};

export default Playgound;

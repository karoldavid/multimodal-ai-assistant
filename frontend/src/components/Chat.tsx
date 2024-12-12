import React from "react";
import "./Chat.css";
import Message from "./Message";
import ChatInput from "./ChatInput";
import useChat from "../hooks/useChat";

const Chat: React.FC = () => {
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
    </div>
  );
};

export default Chat;

import React from "react";

import { useChat } from "../context/ChatContext";
import Message from "./Message";
import ChatInput from "./ChatInput";
import FileUpload from "./FileUpload";

import "./Playground.css";

const Playground: React.FC = () => {
  const { messages, chatState } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-white p-4">
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            isLastMessage={index === messages.length - 1}
          />
        ))}
        {chatState === "thinking" &&
          messages.length > 0 &&
          messages[messages.length - 1].user && (
            <div className="chat-message bot-message">
              <p>
                <strong>Assistant:</strong>{" "}
                <span className="thinking-dots">...</span>
              </p>
            </div>
          )}
      </div>
      <ChatInput />
      <div className="p-4 bg-gray-100 border-t border-gray-300 flex flex-col items-start space-y-4">
        <FileUpload />
      </div>
    </div>
  );
};

export default Playground;

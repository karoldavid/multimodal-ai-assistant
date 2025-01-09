import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useChat } from "../context/ChatContext";
import MicrophoneButton from "./MicrophoneButton";
import "./ChatInput.css";

const ChatInput = () => {
  const { input, setInput, handleSubmit, handleVoiceInput, chatState } =
    useChat();

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 border-t border-gray-300 flex items-center"
    >
      <input
        type="text"
        value={input}
        disabled={
          chatState === "thinking" ||
          chatState === "listening" ||
          chatState === "speaking"
        }
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          chatState !== "listening"
            ? "Type your message..."
            : "Speak into your microphone..."
        }
        className="flex-1 p-2 border rounded mr-2"
      />
      <MicrophoneButton
        disabled={
          chatState === "thinking" ||
          chatState === "listening" ||
          chatState === "speaking"
        }
        handleClick={handleVoiceInput}
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center justify-center"
        disabled={
          chatState === "thinking" ||
          chatState === "listening" ||
          chatState === "speaking"
        }
      >
        <PaperAirplaneIcon className="h-6 w-6" />
      </button>
    </form>
  );
};

export default ChatInput;

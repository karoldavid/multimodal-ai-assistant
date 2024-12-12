import React from "react";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 border-t border-gray-300 flex items-center"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded mr-2"
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;

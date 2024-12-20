import { useState } from "react";
import { sendMessage } from "../services/api";

const useChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ user?: string; bot?: string }[]>(
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    setMessages((prevMessages) => [...prevMessages, { user: userMessage }]);

    try {
      const response = await sendMessage(userMessage);
      const botMessage = response.reply;

      setMessages((prevMessages) => [...prevMessages, { bot: botMessage }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { bot: "Something went wrong. Please try again." },
      ]);
    }
  };

  return { input, setInput, messages, handleSubmit };
};

export default useChat;

import React, { useEffect, useState } from "react";

interface MessageProps {
  message: { user?: string; bot?: string };
  isLastMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLastMessage }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!message.user && isLastMessage) {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (message.bot && currentIndex < message.bot.length) {
          setDisplayedText((prev) => prev + message.bot![currentIndex]);
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);
      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(message.user || message.bot || "");
    }
  }, [message, isLastMessage]);

  return (
    <div
      className={`chat-message ${
        message.user ? "user-message" : "bot-message"
      }`}
    >
      <p>
        <strong>{message.user ? "You" : "Assistant"}:</strong> {displayedText}
      </p>
    </div>
  );
};

export default Message;

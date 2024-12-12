import React from "react";

interface MessageProps {
  message: { user?: string; bot?: string };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div
      className={`chat-message ${
        message.user ? "user-message" : "bot-message"
      }`}
    >
      <p>
        <strong>{message.user ? "You" : "Assistant"}:</strong>{" "}
        {message.user || message.bot}
      </p>
    </div>
  );
};

export default Message;

import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { useSpeech } from "../hooks/useSpeech";
import { sendMessage } from "../services/api";

const CHAT_STATES = {
  IDLE: "idle",
  LISTENING: "listening",
  SPEAKING: "speaking",
  THINKING: "thinking",
} as const;

type ChatState = (typeof CHAT_STATES)[keyof typeof CHAT_STATES];

export type MessageType = {
  user?: string;
  bot?: string;
  timestamp?: Date;
  type?: "text" | "voice";
};

type ChatAction =
  | { type: ChatState }
  | { type: "addMessage"; message: MessageType }
  | { type: "clearMessages" };

interface ChatStateWithMessages {
  chatState: ChatState;
  messages: MessageType[];
}

function chatReducer(
  state: ChatStateWithMessages,
  action: ChatAction
): ChatStateWithMessages {
  switch (action.type) {
    case CHAT_STATES.IDLE:
    case CHAT_STATES.LISTENING:
    case CHAT_STATES.SPEAKING:
    case CHAT_STATES.THINKING:
      return { ...state, chatState: action.type };
    case "addMessage":
      return { ...state, messages: [...state.messages, action.message] };
    case "clearMessages":
      return { ...state, messages: [] };
    default:
      throw new Error(`Unknown action type`);
  }
}

interface ChatContextType {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  messages: MessageType[];
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleVoiceInput: () => Promise<void>;
  chatState: ChatState;
  dispatch: React.Dispatch<{ type: ChatState }>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { recognizeSpeech, synthesizeSpeech } = useSpeech();

  const [input, setInput] = useState("");
  const [state, dispatch] = useReducer(chatReducer, {
    chatState: CHAT_STATES.IDLE,
    messages: [],
  });

  const simulateTyping = async (text: string) => {
    for (let i = 0; i < text.length; i++) {
      setInput((prev) => prev + text[i]);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const handleVoiceInput = useCallback(async () => {
    dispatch({ type: CHAT_STATES.LISTENING });

    try {
      await recognizeSpeech(async (text) => {
        await simulateTyping(text);
        setInput("");
        dispatch({
          type: "addMessage",
          message: { user: text, type: "voice" },
        });
        dispatch({ type: CHAT_STATES.THINKING });
        const botReply = await sendMessage(text);

        dispatch({
          type: "addMessage",
          message: { bot: botReply.reply, type: "voice" },
        });

        await synthesizeSpeech(
          botReply.reply,
          () => dispatch({ type: CHAT_STATES.SPEAKING }),
          () => dispatch({ type: CHAT_STATES.IDLE })
        );
      });
    } catch (error) {
      console.error("Error handling voice input:", error);
      dispatch({ type: CHAT_STATES.IDLE });
    }
  }, [recognizeSpeech, synthesizeSpeech]);

  const sendMessageToBot = async (userMessage: string) => {
    try {
      dispatch({ type: CHAT_STATES.THINKING });
      const response = await sendMessage(userMessage);
      dispatch({ type: CHAT_STATES.IDLE });
      return response.reply;
    } catch (error) {
      dispatch({ type: CHAT_STATES.IDLE });
      console.error("Error sending message:", error);
      return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;

      const userMessage = input;
      setInput("");

      dispatch({
        type: "addMessage",
        message: { user: userMessage, type: "text" },
      });

      const botMessage = await sendMessageToBot(userMessage);

      dispatch({
        type: "addMessage",
        message: { bot: botMessage, type: "text" },
      });
    },
    [input]
  );

  return (
    <ChatContext.Provider
      value={{
        input,
        setInput,
        messages: state.messages,
        handleSubmit,
        handleVoiceInput,
        chatState: state.chatState,
        dispatch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export { ChatProvider, useChat };

import { createContext, useContext, useState, ReactNode } from "react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "This is a quiet space. You can say whatever you need. There's no right or wrong here. I'm listening.",
};

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  welcomeMessage: ChatMessage;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  return (
    <ChatContext.Provider value={{ messages, setMessages, welcomeMessage: WELCOME_MESSAGE }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

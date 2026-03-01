import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, MessageCircle } from "lucide-react";
import { sendChatbotMessage, type ChatbotMessage } from "@/lib/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! I'm your AI Health Assistant. I can help answer your medical and health-related questions. How can I assist you today?",
    sender: "ai",
  },
];

const AIOrbChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const userMessage = input;
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory: ChatbotMessage[] = messages
        .filter(msg => msg.id !== 1) // Exclude initial greeting
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        }));

      // Call the chatbot API
      const response = await sendChatbotMessage({
        message: userMessage,
        conversation_history: conversationHistory
      });

      const aiMsg: Message = { 
        id: Date.now() + 1, 
        text: response.message, 
        sender: "ai" 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        text: error.message || "Sorry, I encountered an error. Please try again.", 
        sender: "ai" 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Orb */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-8 z-40 transition-all duration-500 ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100'}`}
      >
        <div className="relative">
          {/* Outer glow rings */}
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/30 animate-ping" />
          <div className="absolute -inset-2 rounded-full border border-primary/30 animate-ring-rotate" />
          
          {/* Main orb */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-orb-pulse cursor-pointer hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          
          {/* Label */}
          <div className="absolute -bottom-8 right-0 whitespace-nowrap">
            <span className="font-display text-xs text-primary/80 tracking-widest">Chatbot</span>
          </div>
        </div>
      </button>

      {/* Chat Modal */}
      <div className={`fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-24 sm:right-8 sm:left-auto sm:w-full sm:max-w-md z-50 transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="glass-panel border border-primary/40 overflow-hidden flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-sm text-primary tracking-wider">Chatbot</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-accent/20 border border-accent/30"
                      : "bg-primary/20 border border-primary/30"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4 text-accent" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.sender === "user"
                      ? "bg-accent/20 border border-accent/30 text-foreground rounded-tr-none"
                      : "bg-primary/10 border border-primary/20 text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-primary/20 bg-card/50">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your health data..."
                className="flex-1 bg-muted/30 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:glow-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIOrbChat;

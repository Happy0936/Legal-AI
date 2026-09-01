import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import NetworkService from "@/NetworkService";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! 👋 I’m your AI Legal Assistant. Ask me anything about legal matters.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const network = new NetworkService();
    
    // Correct URL Endpoint matching Django
    network.request(
      'ai-chat/', 
      'POST',
      { 
        messages: updatedMessages,
        message: input 
      },
      {},
      (error: any, responseData: any) => {
        setLoading(false);
        if (error) {
          console.error("Chat API Error:", error);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Server connection error. Please try again.' }
          ]);
          return;
        }
        
        const replyText = responseData?.reply || responseData?.response || responseData?.ai_answer;

        if (replyText) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: replyText }
          ]);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-xl border border-gray-200 mt-4">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Bot className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">AI Legal Chatbot</h2>
          <p className="text-xs text-gray-500">Interactive Legal Conversations</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Bot size={18} />
              </div>
            )}
            
            <div
              className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm italic">
            <Bot size={18} className="animate-spin text-blue-500" />
            AI thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a legal question..."
          className="flex-1 py-3 text-sm rounded-lg"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
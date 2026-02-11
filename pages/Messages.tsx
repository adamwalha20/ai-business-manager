import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { getConversations } from '../services/mockService';
import { triggerWebhook } from '../services/n8nService';
import { Conversation, Platform, Message } from '../types';
import { Send, Bot, User, Facebook, Instagram, MoreHorizontal, Phone, Loader2 } from 'lucide-react';

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = getConversations();
    setConversations(data);
    if (data.length > 0) setActiveChat(data[0]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      platform: activeChat.platform,
      customer_id: activeChat.customer_id,
      customer_name: 'You', // Or admin name
      content: inputText,
      is_ai_reply: false,
      is_comment: false,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI update
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMessage],
      last_message: inputText,
      last_message_time: 'Just now'
    };

    setActiveChat(updatedChat);
    setConversations(prev => prev.map(c => c.customer_id === activeChat.customer_id ? updatedChat : c));
    setInputText('');
    setIsSending(true);

    // Call webhook
    const response = await triggerWebhook({
      action: 'chat_message',
      message: inputText,
      customerId: activeChat.customer_id,
      platform: activeChat.platform
    });

    setIsSending(false);

    // Handle AI Reply if present in webhook response
    if (response.success && response.ai_reply) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        platform: activeChat.platform,
        customer_id: activeChat.customer_id,
        customer_name: 'AI Agent',
        content: response.ai_reply,
        is_ai_reply: true,
        is_comment: false,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const chatWithAi = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        last_message: response.ai_reply,
        last_message_time: 'Just now'
      };

      setActiveChat(chatWithAi);
      setConversations(prev => prev.map(c => c.customer_id === activeChat.customer_id ? chatWithAi : c));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-brand-black overflow-hidden pt-20 lg:pt-0">
      {/* Left: Chat List */}
      <div className="w-full lg:w-96 border-r border-brand-card flex flex-col h-full bg-brand-dark">
        <div className="p-6 border-b border-brand-card">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-brand-card text-white text-sm font-medium border border-gray-700">All</button>
            <button className="flex-1 py-2 rounded-lg bg-transparent text-gray-500 hover:bg-brand-card text-sm font-medium border border-transparent">Unread</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.customer_id}
              onClick={() => setActiveChat(conv)}
              className={`p-4 border-b border-brand-card cursor-pointer transition-colors hover:bg-brand-card/50 ${activeChat?.customer_id === conv.customer_id ? 'bg-brand-card/80 border-l-4 border-l-brand-green' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-2">
                  {conv.customer_name}
                  {conv.platform === Platform.FACEBOOK ? <Facebook size={14} className="text-blue-500" /> : <Instagram size={14} className="text-pink-500" />}
                </span>
                <span className="text-xs text-gray-500">{conv.last_message_time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate pr-4">{conv.last_message}</p>
              {conv.unread_count > 0 && (
                <div className="mt-2 flex justify-end">
                  <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conv.unread_count} new</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Active Chat */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-brand-card flex justify-between items-center bg-brand-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
                  {activeChat.customer_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeChat.customer_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerWebhook({ action: 'call_customer', customerId: activeChat.customer_id })}
                  className="p-2 text-gray-400 hover:text-white hover:bg-brand-card rounded-lg transition-colors"
                >
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => triggerWebhook({ action: 'chat_options', customerId: activeChat.customer_id })}
                  className="p-2 text-gray-400 hover:text-white hover:bg-brand-card rounded-lg transition-colors"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_ai_reply || msg.customer_name === 'AI Agent' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] lg:max-w-[60%] flex gap-3 ${msg.is_ai_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.is_ai_reply ? 'bg-brand-green' : 'bg-gray-700'}`}>
                      {msg.is_ai_reply ? <Bot size={16} className="text-black" /> : <User size={16} className="text-white" />}
                    </div>
                    <div>
                      <div className={`p-4 rounded-2xl ${msg.is_ai_reply
                        ? 'bg-brand-card border border-gray-800 text-gray-200 rounded-tl-none'
                        : 'bg-brand-green text-black rounded-tr-none font-medium'
                        }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className={`mt-1 text-[10px] text-gray-600 ${msg.is_ai_reply ? 'text-left' : 'text-right'}`}>
                        {msg.created_at} {msg.is_ai_reply && '• AI Auto-Reply'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="flex gap-3 flex-row">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-green">
                      <Bot size={16} className="text-black" />
                    </div>
                    <div className="bg-brand-card border border-gray-800 p-4 rounded-2xl rounded-tl-none flex items-center">
                      <Loader2 size={16} className="animate-spin text-brand-green" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-brand-card bg-brand-black">
              <div className="flex items-center gap-3 bg-brand-card p-2 rounded-xl border border-gray-800 focus-within:border-brand-green transition-colors">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message or / for AI prompts..."
                  className="flex-1 bg-transparent text-white px-3 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="p-2 bg-brand-green text-black rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex justify-center mt-2">
                <span className="text-[10px] text-gray-600">AI Pilot is Active • Responding automatically to inquiries</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
"use client";

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello. How can I help you find something beautiful today?" }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Simulate elegant AI response (real integration with AI Workspace exists in the system)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Based on what you've shared, I think you would love the Linen Duvet Cover in Oat from our Sanctuary universe. Would you like me to show it, or shall we refine the suggestion?" 
      }]);
    }, 650);

    setInput('');
  };

  return (
    <>
      {/* Floating Button — Warm, Luxurious */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-[#C5AA8A] text-[#26221E] shadow-lg hover:bg-[#B99B79] transition-all active:scale-[0.96]"
        aria-label="Open AI Shopping Assistant"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* Assistant Panel — mobile friendly width */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[999] w-auto md:w-full max-w-[380px] rounded-3xl border border-[#E4DDD5] bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4DDD5] bg-[#F5F0EA] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C5AA8A] text-[#26221E]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-[#26221E]">Alaya Concierge</div>
                <div className="text-[11px] text-[#6D655F]">Here to help you discover</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#6D655F] hover:text-[#26221E]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[320px] overflow-y-auto p-6 space-y-5 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' 
                  ? 'bg-[#26221E] text-[#F5F0EA]' 
                  : 'bg-[#EFE7DE] text-[#26221E]'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#E4DDD5] p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="What are you looking for today?"
                className="flex-1 rounded-2xl border border-[#E4DDD5] bg-[#F5F0EA] px-4 py-3 text-sm placeholder:text-[#6D655F] focus:outline-none focus:border-[#C5AA8A]"
              />
              <button 
                onClick={sendMessage}
                className="rounded-2xl bg-[#26221E] px-5 text-sm font-medium text-[#F5F0EA] active:bg-[#C5AA8A] active:text-[#26221E]"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#8A8178]">Powered by your Personal AI Concierge</p>
          </div>
        </div>
      )}
    </>
  );
}

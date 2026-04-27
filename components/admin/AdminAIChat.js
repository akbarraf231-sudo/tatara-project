'use client';

import { useState, useRef, useEffect } from 'react';

export function AdminAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMessage = `Server error (${res.status})`;
        try {
          const parsed = JSON.parse(text);
          errorMessage = parsed.error || errorMessage;
        } catch {
          if (res.status === 500) {
            errorMessage = 'AI Assistant belum dikonfigurasi. Set ANTHROPIC_API_KEY di .env.local dengan API key dari console.anthropic.com';
          }
        }
        throw new Error(errorMessage);
      }

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        aiResponse += text;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Maaf, ada error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 z-40 ${
          open ? 'bg-[#5a1f2a] text-white' : 'bg-[#5a1f2a] text-white hover:bg-[#722f37]'
        }`}
        title="Tanya AI Assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-40 border-2 border-[#e3b9b9]">
          {/* Header */}
          <div className="bg-[#5a1f2a] text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg">🤖 Asisten AI</h3>
            <p className="text-xs text-[#fce8e2]">Tanya apapun tentang sistem</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-[#722f37] text-sm mt-8">
                <p className="mb-2">👋 Halo! Ada yang bisa saya bantu?</p>
                <p className="text-xs">
                  Tanya tentang cara pakai fitur, setup produk, manage inventory, dll
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm break-words ${
                      msg.role === 'user'
                        ? 'bg-[#5a1f2a] text-white rounded-br-none'
                        : 'bg-[#fce8e2] text-[#5a1f2a] rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#fce8e2] text-[#5a1f2a] px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                      ●
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                      ●
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e3b9b9] p-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya..."
              disabled={loading}
              className="flex-1 border-2 border-[#e3b9b9] rounded-lg px-2 py-1 text-sm text-[#5a1f2a] disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white px-3 py-1 rounded-lg font-semibold text-sm transition-colors"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

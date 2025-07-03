'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ChatEntry {
  question: string;
  answer: string | null; // null means answer loading
}

interface ChatBoxProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBox({ id, isOpen, onClose }: ChatBoxProps) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isOpen]);

  if (!isOpen) return null; // Don't render if not open

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setLoading(true);

    setHistory((prev) => [
      ...prev,
      { question: currentQuestion, answer: null },
    ]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ask-about-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, question: currentQuestion }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      const answer = data.answer || 'No answer returned.';

      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          question: currentQuestion,
          answer,
        };
        return newHistory;
      });

    } catch (err) {
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          question: currentQuestion,
          answer: 'Error: ' + err.message,
        };
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 w-80 max-w-[95vw] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 h-[480px]"
      role="dialog"
      aria-modal="true"
      aria-label="AI Chatbox"
    >
      {/* Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">Ask AI</span>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="hover:bg-gray-900 rounded-full p-1 transition cursor-pointer"
        >
          <XMarkIcon className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto text-sm space-y-4 bg-gray-50">
        {history.length === 0 && (
          <p className="text-gray-700 mb-2">
            👋 Hi! Ask me anything about this place.
          </p>
        )}
        {history.map(({ question, answer }, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-right text-black font-medium">{question}</div>
            <div className="text-left bg-white rounded-lg px-3 py-2 shadow border text-gray-800 flex items-center min-h-[40px]">
              {answer === null ? <AiChatbotTypingLoader /> : answer}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2"
          aria-label="Ask your question"
        >
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            aria-disabled={loading}
            aria-label="Type your question"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={`text-sm px-4 py-2 rounded-lg transition font-semibold ${
              loading || !question.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
            }`}
            aria-disabled={loading || !question.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function AiChatbotTypingLoader() {
  return (
    <div className="flex items-center space-x-3">
      {/* Robot SVG: square head, antenna, friendly face */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="text-indigo-500"
        aria-hidden="true"
      >
        {/* Head */}
        <rect
          x="7"
          y="10"
          width="26"
          height="18"
          rx="6"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Eyes */}
        <circle cx="15" cy="19" r="2" fill="#6366f1" />
        <circle cx="25" cy="19" r="2" fill="#6366f1" />
        {/* Smile */}
        <path
          d="M17 24 Q20 27 23 24"
          stroke="#6366f1"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Antenna */}
        <rect x="19" y="5" width="2" height="6" rx="1" fill="#6366f1" />
        <circle
          cx="20"
          cy="5"
          r="2"
          fill="#6366f1"
          stroke="#fff"
          strokeWidth="1"
        />
        {/* Ears */}
        <rect x="5" y="16" width="2" height="8" rx="1" fill="#6366f1" />
        <rect x="33" y="16" width="2" height="8" rx="1" fill="#6366f1" />
      </svg>

      {/* Typing dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-7px);
            opacity: 1;
          }
        }
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
      `}</style>
    </div>
  );
}

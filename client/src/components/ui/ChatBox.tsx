'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

interface ChatEntry {
  question: string;
  answer: string | null; // null means answer loading
}

export function ChatBox({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isOpen]);

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
      const res = await fetch('http://localhost:8080/ask-about-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: id,
          question: currentQuestion,
        }),
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
    } catch (err: any) {
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
    <>
      {!isOpen && (
        <button
          className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chat"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[90%] bg-white border rounded-2xl shadow-xl flex flex-col overflow-hidden z-50 h-[480px]">
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Ask AI</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-4">
            {history.length === 0 && (
              <p className="text-gray-700 mb-2">
                Hi! Ask me anything about this place.
              </p>
            )}
            {history.map(({ question, answer }, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-right text-sm text-black font-medium">
                  {question}
                </div>
                <div className="text-left bg-gray-100 rounded p-2 text-gray-800">
                  {answer === null ? <AiChatbotTypingLoader /> : answer}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className={`text-sm px-4 py-2 rounded-lg ${
                  loading || !question.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Animated bouncing dots typing indicator
function TypingDots() {
  return (
    <span className="inline-flex space-x-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-0"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span>
      <style jsx>{`
        .animation-delay-0 {
          animation-delay: 0ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce {
          animation-name: bounce;
          animation-duration: 1s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </span>
  );
}


export function AiBotTypingIndicator() {
  return (
    <div className="flex items-center space-x-3">
      {/* Robot head icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect
          x="3"
          y="7"
          width="18"
          height="10"
          rx="2"
          ry="2"
          className="stroke-current"
        />
        <circle cx="8" cy="12" r="1.5" className="stroke-current" />
        <circle cx="16" cy="12" r="1.5" className="stroke-current" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17h6"
          className="stroke-current"
        />
      </svg>

      {/* Typing dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-3 w-3 rounded-full bg-indigo-600 animate-bounce-delay"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes bounce-delay {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        .animate-bounce-delay {
          animation-name: bounce-delay;
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
}

export function AiChatbotTypingLoader() {
  return (
    <div className="flex items-center space-x-3">
      {/* Outline robot head with glowing pulse */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-indigo-500 stroke-2 stroke-current filter drop-shadow-md animate-pulse-glow"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {/* Head outline */}
        <rect
          x="3"
          y="7"
          width="18"
          height="10"
          rx="2"
          ry="2"
          strokeWidth="2"
          className="stroke-current"
        />
        {/* Eyes */}
        <circle cx="8" cy="12" r="1.5" />
        <circle cx="16" cy="12" r="1.5" />
        {/* Mouth line */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
      </svg>

      {/* Typing dots with fade-in/out animation */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full bg-indigo-500 animate-fade-bounce"
            style={{ animationDelay: `${i * 300}ms` }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(99, 102, 241, 1));
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }

        @keyframes fade-bounce {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-6px);
          }
        }

        .animate-fade-bounce {
          animation: fade-bounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
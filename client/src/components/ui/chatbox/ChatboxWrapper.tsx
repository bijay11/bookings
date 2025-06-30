'use client';
import { useState } from 'react';
import { ChatBox } from './ChatBox';

export function ChatBoxWrapper({ id, text }: { id: string, text: string }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <p>
        {`${text} `}
        <button
          onClick={() => setChatOpen(true)}
          className="text-indigo-600 hover:underline focus:outline-none cursor-pointer font-bold"
          aria-label="Open Ask AI Chat"
          type="button"
        >
          Ask AI
        </button>
      </p>

      <ChatBox id={id} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

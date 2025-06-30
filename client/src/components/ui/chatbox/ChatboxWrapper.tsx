'use client';
import { useState } from 'react';
import { ChatBox } from './ChatBox';

export function ChatBoxWrapper({ id, text }: { id: string, text: string }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <h4 className="text-lg font-semibold">
        {`${text} `}
        <button
          onClick={() => setChatOpen(true)}
          className="text-indigo-600 hover:underline focus:outline-none cursor-pointer"
          aria-label="Open Ask AI Chat"
          type="button"
        >
          Ask AI
        </button>
      </h4>

      <ChatBox id={id} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

import React, { useEffect, useRef, useState } from 'react'
import { socket } from '../socket/socket';

interface ChatBoxProps {
    roomId: string;
    username: string;
}
interface Message {
    username: string;
    text: string;
    timestamp: number;
}

function ChatBox({ roomId, username }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket.on('receive-message', ({ username, text, timestamp }: Message) => {
            console.log("Received message:", { username, text, timestamp });
            setMessages((prev) => [...prev, { username, text, timestamp }]);
        });
        return () => {
            socket.off('receive-message');
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === "") return;

        const message = {
            roomId,
            username,
            text: input.trim(),
            timestamp: Date.now(),
        };

        socket.emit('send-message', message);
        setMessages((prev) => [...prev, { username, text: input.trim(), timestamp: message.timestamp }]);
        setInput("");
    }
    const isOwnMessage = (msgUsername: string) => msgUsername === username;
    return (
    <div className="flex flex-col h-full">

      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="text-sm font-semibold text-white/70 tracking-widest uppercase">
          Room Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <p className="text-xs text-white/20 text-center mt-8">
            No messages yet. Say something!
          </p>
        )}

        {messages.map((msg, idx) => {
          const own = isOwnMessage(msg.username);
          return (
            <div
              key={idx}
              className={`flex flex-col gap-1 ${own ? 'items-end' : 'items-start'}`}
            >

              <div className="flex items-center gap-2 px-1">
                {!own && (
                  <span className="text-xs font-semibold text-red-400">
                    {msg.username}
                  </span>
                )}
               
              </div>

              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
                  ${own
                    ? 'bg-red-600/80 text-white rounded-tr-sm'
                    : 'bg-white/10 text-white/90 rounded-tl-sm'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all p-2 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatBox;

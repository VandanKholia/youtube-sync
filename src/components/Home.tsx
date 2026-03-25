import { useState } from "react";
import LinkIcon from "./icons/LinkIcon";
import PlayIcon from "./icons/PlayIcon";
import PlusIcon from "./icons/PlusIcon";
import UsersIcon from "./icons/UserIcon";
import ArrowRightIcon from "./icons/ArrowIcon";

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function HomePage() {
  // Create room state
  const [createUsername, setCreateUsername] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join room state
  const [joinUsername, setJoinUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [joinError, setJoinError] = useState("");

  const generateRoomId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let i = 0; i < 8; i++) {
      if (i === 4) id += "-";
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  };

  const handleCreateRoom = () => {
    if (!createUsername.trim()) {
      setCreateError("Please enter a username.");
      return;
    }
    setCreateError("");
    const newId = generateRoomId();
    setCreatedRoomId(newId);
    setCopied(false);
  };

  const handleEnterRoom = () => {
    if (!createUsername.trim()) {
      setCreateError("Please enter a username.");
      return;
    }
    alert(`Entering room ${createdRoomId} as ${createUsername.trim()}`);
  };

  const handleCopy = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    if (!joinUsername.trim()) {
      setJoinError("Please enter a username.");
      return;
    }
    if (!roomIdInput.trim()) {
      setJoinError("Please enter a Room ID.");
      return;
    }
    setJoinError("");
    alert(`Joining room: ${roomIdInput.trim()} as ${joinUsername.trim()}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow accent */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(255,0,0,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40">
            <PlayIcon />
          </div>
          <span className="text-base font-semibold tracking-tight text-white/90">
            YT<span className="text-red-500">Sync</span>
          </span>
        </div>
        <span className="text-xs text-white/30 font-medium tracking-widest uppercase">
          Watch Together
        </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-5">

        {/* Hero text */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-red-500 mb-4">
            Synchronized Viewing
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
            Watch YouTube{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #ff4444, #ff8800)" }}
            >
              together
            </span>
            ,<br />in perfect sync.
          </h1>
          <p className="text-white/40 text-base max-w-sm mx-auto leading-relaxed">
            Create a room or join an existing one. Share the link and watch with anyone, anywhere.
          </p>
        </div>

        {/* Cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Create Room Card */}
          <div className="relative group rounded-2xl border border-white/[0.06] bg-[#0d0d0d] overflow-hidden p-7 flex flex-col transition-all duration-300 hover:border-white/[0.1] hover:bg-[#111111]">
            {/* Card glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ background: "radial-gradient(400px circle at 50% 0%, rgba(255,68,68,0.06), transparent)" }}
            />

            <div className="flex items-start justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center text-red-400">
                <PlusIcon />
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/20 mt-1">
                New Room
              </span>
            </div>

            <h2 className="text-xl font-semibold mb-1.5">Create a Room</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Start a new session. Share the room ID with friends to watch together.
            </p>

            <div className="mt-auto space-y-3">
              {/* Username input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-white/30 pl-1">
                  Your Username
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/[0.07] focus-within:border-white/15 rounded-xl px-4 py-3 transition-colors">
                  <span className="text-white/30">
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => {
                      setCreateUsername(e.target.value);
                      setCreateError("");
                    }}
                    placeholder="e.g. Alex"
                    maxLength={24}
                    className="flex-1 bg-transparent outline-none text-sm text-white/80 placeholder:text-white/20"
                  />
                </div>
                {createError && (
                  <p className="text-xs text-red-400 pl-1">{createError}</p>
                )}
              </div>

              {!createdRoomId ? (
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-900/30"
                >
                  <PlusIcon />
                  Generate Room ID
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="flex-1 font-mono text-sm text-white/80 tracking-widest">
                      {createdRoomId}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-colors text-white/60 hover:text-white"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button
                    onClick={handleEnterRoom}
                    className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-900/30"
                  >
                    Enter Room
                    <ArrowRightIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Join Room Card */}
          <div className="relative group rounded-2xl border border-white/[0.06] bg-[#0d0d0d] overflow-hidden p-7 flex flex-col transition-all duration-300 hover:border-white/[0.1] hover:bg-[#111111]">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ background: "radial-gradient(400px circle at 50% 0%, rgba(100,180,255,0.04), transparent)" }}
            />

            <div className="flex items-start justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <UsersIcon />
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/20 mt-1">
                Existing Room
              </span>
            </div>

            <h2 className="text-xl font-semibold mb-1.5">Join a Room</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Enter a room ID shared with you to join an existing session instantly.
            </p>

            <div className="mt-auto space-y-3">
              {/* Username input */}
              <div>
                <label className="text-[11px] font-semibold tracking-widest uppercase text-white/30 pl-1 block mb-1.5">
                  Your Username
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/[0.07] focus-within:border-white/15 rounded-xl px-4 py-3 transition-colors">
                  <span className="text-white/30">
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    value={joinUsername}
                    onChange={(e) => {
                      setJoinUsername(e.target.value);
                      setJoinError("");
                    }}
                    placeholder="e.g. Alex"
                    maxLength={24}
                    className="flex-1 bg-transparent outline-none text-sm text-white/80 placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Room ID input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-white/30 pl-1 block">
                  Room ID
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/[0.07] focus-within:border-white/15 rounded-xl px-4 py-3 transition-colors">
                  <span className="text-white/30">
                    <LinkIcon />
                  </span>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => {
                      setRoomIdInput(e.target.value.toUpperCase());
                      setJoinError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="e.g. ABCD-1234"
                    className="flex-1 bg-transparent outline-none text-sm font-mono tracking-widest text-white/80 placeholder:text-white/20"
                  />
                </div>
                {joinError && (
                  <p className="text-xs text-red-400 pl-1">{joinError}</p>
                )}
              </div>

              <button
                onClick={handleJoin}
                className="w-full py-3 px-5 rounded-xl bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              >
                Join Session
                <ArrowRightIcon />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom hint */}
        <p className="mt-10 text-white/20 text-xs text-center">
          No account needed &nbsp;·&nbsp; Free to use &nbsp;·&nbsp; Works with any YouTube video
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-4 flex items-center justify-center">
        <p className="text-white/20 text-xs">
          © 2026 YTSync — Built for synchronized watching
        </p>
      </footer>

    </div>
  );
}
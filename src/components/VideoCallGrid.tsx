// components/VideoCallGrid.tsx
import React, { useEffect, useRef } from 'react';
import type { PeerState } from '../hooks/useWebRTC';

interface VideoCallGridProps {
  peers: PeerState[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export function VideoCallGrid({
  peers,
  localVideoRef,
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
}: VideoCallGridProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Group Video Call ({peers.length + 1})</h2>

        <div className="flex gap-3">
          <button
            onClick={onToggleAudio}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isAudioMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
          </button>
          <button
            onClick={onToggleVideo}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isVideoOff ? 'bg-red-600 hover:bg-red-500' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Local Stream */}
        <div className="relative aspect-video bg-black/60 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-lg mb-1">
                You
              </div>
              <span className="text-xs text-gray-400">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs">
            You {isAudioMuted && '(Muted)'}
          </div>
        </div>

        {/* Remote Streams */}
        {peers.map((peer) => (
          <RemoteVideoCard key={peer.socketId} peer={peer} />
        ))}
      </div>
    </div>
  );
}

function RemoteVideoCard({ peer }: { peer: PeerState }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative aspect-video bg-black/60 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${peer.isVideoEnabled ? 'block' : 'hidden'}`}
      />
      {!peer.isVideoEnabled && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-lg mb-1">
            {peer.socketId.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400">Camera Off</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs flex items-center gap-1">
        <span>User {peer.socketId.substring(0, 4)}</span>
        {!peer.isAudioEnabled && <span className="text-red-400 text-[10px]">(Muted)</span>}
      </div>
    </div>
  );
}
import React from 'react';
import YouTube from 'react-youtube';

interface YouTubePlayerSectionProps {
  videoId: string;
  urlInput: string;
  setUrlInput: (val: string) => void;
  isReadyToPlay: boolean;
  isVideoChanged: boolean;
  playerRef: React.MutableRefObject<any>;
  onUrlSubmit: (e: React.FormEvent) => void;
  onPlay: (e: any) => void;
  onPause: (e: any) => void;
  onSyncAndPlay: () => void;
}

export function YouTubePlayerSection({
  videoId,
  urlInput,
  setUrlInput,
  isReadyToPlay,
  isVideoChanged,
  playerRef,
  onUrlSubmit,
  onPlay,
  onPause,
  onSyncAndPlay,
}: YouTubePlayerSectionProps) {
  return (
    <div className="space-y-4">
      {/* YOUTUBE PLAYER CONTAINER */}
      <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: { autoplay: 0 },
          }}
          onReady={(e) => {
            playerRef.current = e.target;
            onSyncAndPlay();
          }}
          onPlay={onPlay}
          onPause={onPause}
          className="w-full h-full"
        />
      </div>

      {/* SYNC BUTTON */}
      {!isReadyToPlay && videoId && !isVideoChanged && (
        <button
          onClick={onSyncAndPlay}
          className="w-full bg-green-600 py-3 rounded-xl font-bold hover:bg-green-500 transition-all"
        >
          Sync & Play
        </button>
      )}

      {/* URL INPUT FORM */}
      <form onSubmit={onUrlSubmit} className="flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube Link here..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-white"
        />
        <button className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-500 transition-all">
          Load Video
        </button>
      </form>
    </div>
  );
}
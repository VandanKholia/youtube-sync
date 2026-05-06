import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { socket } from '../socket/socket';
import YouTube from 'react-youtube';

function RoomPage() {
  const roomId = useParams().roomId;
  const [videoId, setVideoId] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [isVideoChanged, setIsVideoChanged] = useState(false);

  const playerRef = useRef<any>(null);
  const isSyncingRef = useRef(false);
  const pendingSyncRef = useRef<any>(null);
  
  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);

    socket.on('sync-video-state', ({ videoId, currentTime, isPlaying }) => {
      console.log("Initial Sync:", currentTime);

      pendingSyncRef.current = { currentTime, isPlaying, receivedAt: Date.now() };
      setVideoId(videoId);
      setIsReadyToPlay(false);
    });

    socket.on('change-video', (newVideoId) => {
      setVideoId(newVideoId);
      setIsReadyToPlay(false);
      setIsVideoChanged(true);
      pendingSyncRef.current = { currentTime: 0 };
    });

    socket.on('play-video', ({ currentTime }) => {
      if (playerRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.playVideo();
        setTimeout(() => isSyncingRef.current = false, 500);
      }
    });

    socket.on('pause-video', ({ currentTime }) => {
      if (playerRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.pauseVideo();
        setTimeout(() => isSyncingRef.current = false, 500);
      }
    });

    return () => {
      socket.off('sync-video-state');
      socket.off('change-video');
      socket.off('play-video');
      socket.off('pause-video');
    };
  }, [roomId]);

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(urlInput);
    if (id) {
      setVideoId(id);
      setIsReadyToPlay(true);
      socket.emit('change-video', { roomId, videoId: id });
    }
  };

  const handlePlay = (e: any) => {
    if (isSyncingRef.current) return;
    const currentTime = e.target.getCurrentTime();
    socket.emit('play-video', { roomId, currentTime });
  };

  const handlePause = (e: any) => {
    if (isSyncingRef.current) return;
    const currentTime = e.target.getCurrentTime();
    socket.emit('pause-video', { roomId, currentTime });
  };

  //  MAIN SYNC BUTTON LOGIC
  const handleSyncAndPlay = () => {
    if (!playerRef.current || !pendingSyncRef.current) return;

    const { currentTime, isPlaying, receivedAt } = pendingSyncRef.current;
    const elapsedTime = isPlaying ? (Date.now() - receivedAt) / 1000 : 0;
    const adjustedTime = currentTime + elapsedTime;

    isSyncingRef.current = true;
    playerRef.current.seekTo(adjustedTime, true);
    playerRef.current.playVideo();

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 500);
    
    setIsReadyToPlay(isPlaying);
    pendingSyncRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          Room: <span className="text-red-500">{roomId}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <YouTube
              videoId={videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: { autoplay: 0 }
              }}
              onReady={(e) => {
                playerRef.current = e.target;
                handleSyncAndPlay
              }}
              onPlay={handlePlay}
              onPause={handlePause}
              className='w-full h-full'
            />
          </div>

          {/* Sync Button */}
          {!isReadyToPlay && videoId && !isVideoChanged &&(
            <button
              onClick={handleSyncAndPlay}
              className="w-full bg-green-600 py-3 rounded-xl font-bold hover:bg-green-500 transition-all"
            >
              Sync & Play
            </button>
          )}

          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube Link here..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
            />
            <button className="bg-red-600 px-6 py-3 rounded-xl font-bold">
              Load Video
            </button>
          </form>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-sm text-white/40 mb-4">Participants</h3>
          <div className="text-sm">
            {localStorage.getItem("username")} (You)
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
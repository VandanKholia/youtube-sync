import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { socket } from '../socket/socket';
import YouTube from 'react-youtube';

function RoomPage() {
  const roomId = useParams().roomId;
  const username = localStorage.getItem("username");
  const [videoId, setVideoId] = useState("");
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);
    socket.on('change-video', (newVideoId)=> {
      console.log("video changes");
      setVideoId(newVideoId);
    })
  }, []);

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(urlInput);
    if(id) {
      setVideoId(id);
      socket.emit('change-video', {roomId, videoId: id});
    }
  }
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Room: <span className="text-red-500">{roomId}</span></h1>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all">
          Leave Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Player Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <YouTube
              videoId={videoId}
              opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
              // onReady={(e) => playerRef.current = e.target}
              // onPlay={() => socket.emit("play", roomId)}
              // onPause={(e) => socket.emit("pause", { roomId, currentTime: e.target.getCurrentTime() })}
              className="w-full h-full"
            />
          </div>

          {/* URL Input */}
          <form onSubmit={handleUrlSubmit}className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube Link here..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 transition-colors"
            />
            <button type="submit" className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-500 transition-all">
              Load Video
            </button>
          </form>
        </div>

        {/* Sidebar (For Chat or Users later) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">Participants</h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {localStorage.getItem("username")} (You)
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
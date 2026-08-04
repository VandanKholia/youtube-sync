import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useYouTubeSync } from '../hooks/useYoutubeSync';
import { YouTubePlayerSection } from '../components/YoutubePlayer';
import { VideoCallGrid } from '../components/VideoGrid';
import ChatBox from '../components/ChatBox';

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const webRTC = useWebRTC(roomId);
  const sync = useYouTubeSync(roomId);

  useEffect(() => {
    if (!localStorage.getItem('username')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          Room: <span className="text-red-500">{roomId}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">

          <YouTubePlayerSection
            videoId={sync.videoId}
            urlInput={sync.urlInput}
            setUrlInput={sync.setUrlInput}
            isReadyToPlay={sync.isReadyToPlay}
            isVideoChanged={sync.isVideoChanged}
            playerRef={sync.playerRef}
            onUrlSubmit={sync.handleUrlSubmit}
            onPlay={sync.handlePlay}
            onPause={sync.handlePause}
            onSyncAndPlay={sync.handleSyncAndPlay}
          />

          <VideoCallGrid
            peers={webRTC.peers}
            localVideoRef={webRTC.localVideoRef}
            isAudioMuted={webRTC.isAudioMuted}
            isVideoOff={webRTC.isVideoOff}
            onToggleAudio={webRTC.toggleAudio}
            onToggleVideo={webRTC.toggleVideo}
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col h-[600px] lg:h-auto">
          <ChatBox
            roomId={roomId!}
            username={localStorage.getItem('username') || 'Anonymous'}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
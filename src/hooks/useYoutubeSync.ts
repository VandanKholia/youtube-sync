import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket/socket';

export function useYouTubeSync(roomId: string | undefined) {
  const [videoId, setVideoId] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [isVideoChanged, setIsVideoChanged] = useState(false);

  const playerRef = useRef<any>(null);
  const isSyncingRef = useRef(false);
  const pendingSyncRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId) return;

    socket.on('sync-video-state', ({ videoId, currentTime, isPlaying }) => {
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
        setTimeout(() => (isSyncingRef.current = false), 500);
      }
    });

    socket.on('pause-video', ({ currentTime }) => {
      if (playerRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.pauseVideo();
        setTimeout(() => (isSyncingRef.current = false), 500);
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
    return match && match[7].length === 11 ? match[7] : null;
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

  return {
    videoId,
    urlInput,
    setUrlInput,
    isReadyToPlay,
    isVideoChanged,
    playerRef,
    handleUrlSubmit,
    handlePlay,
    handlePause,
    handleSyncAndPlay,
  };
}
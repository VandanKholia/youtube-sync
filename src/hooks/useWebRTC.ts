import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket/socket';

const iceServers: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export interface PeerState {
  socketId: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export function useWebRTC(roomId: string | undefined) {
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<{ [key: string]: RTCPeerConnection }>({});

  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection(iceServers);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          targetId: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => {
        if (prev.some((p) => p.socketId === targetSocketId)) return prev;
        return [
          ...prev,
          {
            socketId: targetSocketId,
            stream: event.streams[0],
            isAudioEnabled: true,
            isVideoEnabled: true,
          },
        ];
      });
    };

    return pc;
  };

  useEffect(() => {
    if (!roomId) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socket.connect();
        socket.emit('join-room', roomId);
      })
      .catch((err) => {
        console.error("Failed to access camera/microphone:", err);
        socket.connect();
        socket.emit('join-room', roomId);
      });

    socket.on('get-current-users', (users: string[]) => {
      users.forEach((targetSocketId) => {
        const pc = createPeerConnection(targetSocketId);
        pcsRef.current[targetSocketId] = pc;

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('webrtc-offer', {
              targetId: targetSocketId,
              sdp: pc.localDescription,
            });
          })
          .catch((e) => console.error(e));
      });
    });

    socket.on('webrtc-offer-received', async ({ callerId, sdp }) => {
      const pc = createPeerConnection(callerId);
      pcsRef.current[callerId] = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        targetId: callerId,
        sdp: pc.localDescription,
      });
    });

    socket.on('webrtc-answer-received', ({ responderId, sdp }) => {
      const pc = pcsRef.current[responderId];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on('webrtc-ice-candidate-received', ({ senderId, candidate }) => {
      const pc = pcsRef.current[senderId];
      if (pc && candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => console.error(e));
      }
    });

    socket.on('peer-media-toggled', ({ peerId, type, enabled }) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.socketId === peerId
            ? { ...p, [type === 'audio' ? 'isAudioEnabled' : 'isVideoEnabled']: enabled }
            : p
        )
      );
    });

    socket.on('peer-disconnected', (socketId: string) => {
      if (pcsRef.current[socketId]) {
        pcsRef.current[socketId].close();
        delete pcsRef.current[socketId];
      }
      setPeers((prev) => prev.filter((peer) => peer.socketId !== socketId));
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(pcsRef.current).forEach((pc) => pc.close());
      pcsRef.current = {};

      socket.off('get-current-users');
      socket.off('webrtc-offer-received');
      socket.off('webrtc-answer-received');
      socket.off('webrtc-ice-candidate-received');
      socket.off('peer-media-toggled');
      socket.off('peer-disconnected');
    };
  }, [roomId]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        socket.emit('toggle-media-state', {
          roomId,
          type: 'audio',
          enabled: audioTrack.enabled,
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socket.emit('toggle-media-state', {
          roomId,
          type: 'video',
          enabled: videoTrack.enabled,
        });
      }
    }
  };

  return {
    peers,
    localVideoRef,
    isAudioMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
  };
}
import { Server, Socket } from "socket.io";

const rooms = new Map<
    string,
    {
        videoId: string;
        currentTime: number;
        isPlaying: boolean;
        lastUpdated: number;
    }
>();

export const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        socket.on('join-room', async (roomId: string) => {
            socket.join(roomId);
            let room = rooms.get(roomId);

            if (!room) {
                room = {
                    videoId: "",
                    currentTime: 0,
                    isPlaying: false,
                    lastUpdated: Date.now(),
                };
                rooms.set(roomId, room);
            }

            const estimatedTime = room.isPlaying
                ? room.currentTime + (Date.now() - room.lastUpdated) / 1000
                : room.currentTime;

            socket.emit("sync-video-state", {
                videoId: room.videoId,
                currentTime: estimatedTime,
                isPlaying: room.isPlaying,
            });

            const socketsInRoom = await io.in(roomId).fetchSockets();
            const existingUsers = socketsInRoom
                .map((s) => s.id)
                .filter((id) => id !== socket.id);

            socket.emit("get-current-users", existingUsers);

            console.log(`${socket.id} joined room ${roomId}`);
        });

        socket.on("webrtc-offer", ({ targetId, sdp }: { targetId: string; sdp: any }) => {
            io.to(targetId).emit("webrtc-offer-received", {
                callerId: socket.id,
                sdp,
            });
        });

        socket.on("webrtc-answer", ({ targetId, sdp }: { targetId: string; sdp: any }) => {
            io.to(targetId).emit("webrtc-answer-received", {
                responderId: socket.id,
                sdp,
            });
        });
        socket.on("webrtc-ice-candidate", ({ targetId, candidate }: { targetId: string; candidate: any }) => {
            io.to(targetId).emit("webrtc-ice-candidate-received", {
                senderId: socket.id,
                candidate,
            });
        });

        socket.on("toggle-media-state", ({ roomId, type, enabled }: { roomId: string; type: "audio" | "video"; enabled: boolean }) => {
            socket.to(roomId).emit("peer-media-toggled", {
                peerId: socket.id,
                type,
                enabled,
            });
        });
    
        socket.on('play-video', ({ roomId, currentTime }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.isPlaying = true;
                room.currentTime = currentTime;
                room.lastUpdated = Date.now();
            }
            socket.to(roomId).emit("play-video", { currentTime });
        });

        socket.on('pause-video', ({ roomId, currentTime }) => {
            console.log("video paused at", currentTime);
            const room = rooms.get(roomId);
            if (room) {
                room.isPlaying = false;
                room.currentTime = currentTime;
                room.lastUpdated = Date.now();
            }
            socket.to(roomId).emit("pause-video", { currentTime });
        });

        socket.on("seek-video", ({ roomId, time }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.currentTime = time;
                room.lastUpdated = Date.now();
            }
            socket.to(roomId).emit("seek-video", { time });
        });

        socket.on("change-video", ({ roomId, videoId }) => {
            rooms.set(roomId, {
                videoId,
                currentTime: 0,
                isPlaying: false,
                lastUpdated: Date.now(),
            });
            socket.to(roomId).emit("change-video", videoId);
        });
   
        socket.on("send-message", ({ roomId, username, text }) => {
            socket.to(roomId).emit("receive-message", {
                username,
                text,
                timestamp: Date.now(),
            });
        });

        socket.on("disconnecting", () => {
            socket.rooms.forEach((roomId) => {
                if (rooms.has(roomId)) {
                    socket.to(roomId).emit("peer-disconnected", socket.id);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
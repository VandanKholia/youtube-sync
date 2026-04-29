import { Server, Socket } from "socket.io";

const rooms = new Map<
    string,
    {
        videoId: string;
        currentTime: number;
        isPlaying: boolean;
    }
>();
export const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        //join room
        socket.on('join-room', (roomId: string) => {
            socket.join(roomId);
            const currentRoom = rooms.get(roomId);
            if(currentRoom) {
                const state = rooms.get(roomId);
                socket.emit("sync-video-state", state);
            }
            console.log(`${socket.id} joined room ${roomId}`);
        });

        socket.on('play-video', ({ roomId, currentTime }) => {
            const room = rooms.get(roomId);

            if (room) {
                room.isPlaying = true;
                room.currentTime = currentTime;
            }
            socket.to(roomId).emit("play-video", { currentTime });
        });
        //pause
        socket.on('pause-video', ({ roomId, currentTime }) => {
            console.log("video paused at", currentTime);
            const room = rooms.get(roomId);

            if (room) {
                room.isPlaying = false;
                room.currentTime = currentTime
            }
            socket.to(roomId).emit("pause-video", currentTime);
        });
        // Seek
        socket.on("seek-video", ({ roomId, time }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.currentTime = time;
            }

            socket.to(roomId).emit("seek-video", time);
        });

        // Change Video
        socket.on("change-video", ({ roomId, videoId }) => {
            rooms.set(roomId, {
                videoId,
                currentTime: 0,
                isPlaying: false,
            });

            io.to(roomId).emit("change-video", videoId);
        });


        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
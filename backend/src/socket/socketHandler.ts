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
            console.log(`${socket.id} joined room ${roomId}`);
        });

        socket.on('play', (roomId: string) => {
            const room = rooms.get(roomId);

            if (room) {
                room.isPlaying = true;
            }
            socket.to(roomId).emit("play");
        });
        //pause
        socket.on('pause', ({ roomId, currentTime }) => {
            const room = rooms.get(roomId);

            if (room) {
                room.isPlaying = false;
                room.currentTime = currentTime
            }
            socket.to(roomId).emit("pause", currentTime);
        });
        // Seek
        socket.on("seek", ({ roomId, time }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.currentTime = time;
            }

            socket.to(roomId).emit("seek", time);
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
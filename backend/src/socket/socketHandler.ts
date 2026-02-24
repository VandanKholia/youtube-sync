import { Server, Socket } from "socket.io";

export const registerSocketHandlers = (io:Server)=> {
    io.on("connection", (socket:Socket)=> {
        console.log("User connected:", socket.id);

        
    })
}
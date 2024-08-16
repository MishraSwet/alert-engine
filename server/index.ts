import express from 'express';
import http from 'http';
import { WebSocket, WebSocketServer } from "ws";

interface room{
    user1: WebSocket,
    user2: WebSocket
}
const clients: Map<string, WebSocket> = new Map<string, WebSocket>;
const queue: Map<string, string[]> = new Map<string, string[]>;
const rooms: Map<string, room> = new Map<string, room>;

const app = express();
const httpserver = http.createServer(app)

const server = new WebSocketServer({ server:httpserver });

server.on('connection', (socket ) => {
    socket.on('identify', (clientdata: string) => {
        const data = JSON.parse(clientdata);
        const id = data.id;
        if (clients.has(id)) {
            if (queue.get(id))
                queue.get(id)
        }
        else {
            clients.set(id, socket);
            queue.set(id, []);
        }
    })
    socket.on('chat', (params) => {
        const data = JSON.parse(params);
        const roomid = data.roomid;
        const u1 = data.user1;
        const u2 = data.user2;
        const newroom: room = {
            user1: u1,
            user2:u2
        }
        if (!rooms.has(roomid)) {
            rooms.set(roomid,newroom)
        }
    })
    socket.on('alert ', (message: string) => {
        const data = JSON.parse(message);
        const text:string = data.text;
        const rcvid:string = data.rcvid;
        if (clients.get(rcvid)) {
            clients.get(rcvid)?.send(text)
        }
        else {
            queue.get(rcvid)?.push(text);
        }
    })
    socket.on('message', (params: string) => {
        const data = JSON.parse(params).message;
        const message = data.message;
        const roomid = data.roomid;
        const user1 = rooms.get(roomid)?.user1;
        const user2 = rooms.get(roomid)?.user2;
        const messageobj = JSON.stringify({
            type: "R",
            message:message
        })
        
        if (socket === user1)
            user2?.send(messageobj);
        user1?.send(messageobj);       
    })
    socket.on('close', () => {
        clients.forEach((ws, id) => {
            if (clients.get(id) === ws)
                clients.delete(id)
        })
    })
})

httpserver.listen(8080, () => {
    console.log("Web-Socket Server Running On Port 8080")
})
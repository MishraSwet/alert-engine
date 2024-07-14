import { WebSocket, WebSocketServer } from "ws";
const clients: Map<string, WebSocket> = new Map<string, WebSocket>;
const queue: Map<string, string[]> = new Map<string, string[]>;

const server = new WebSocketServer({ port: 8080 })

server.on('connection', (socket) => {
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
    socket.on('alert', (message: string) => {
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
    })
    socket.on('close', () => {
        clients.forEach((ws, id) => {
            if (clients.get(id) === ws)
                clients.delete(id)
        })
    })
})
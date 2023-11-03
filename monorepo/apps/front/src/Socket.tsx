import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from "js-cookie";

const SocketContext = React.createContext<Socket | null>(null);

export default SocketContext;

export function initializeSocket(): Socket {
    const jwtToken = Cookies.get('jwt-token');
    const socket = io("http://localhost:3000/chat1", {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });
    return socket;
}
// const socket.on('create', (data: JSON)
//     //maj affichage channels
//     //ouvrir page nouveau channel
// );

// const socket.on('message', (data: JSON)
//     //envoyer message a tous les users du channel (ou seulement ceux online ?)
// );


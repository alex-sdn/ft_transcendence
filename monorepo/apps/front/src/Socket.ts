import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from "js-cookie";

// Créez un context pour la socket
const SocketContext = createContext<Socket | undefined>(undefined);

export default SocketContext;

// Créez une fonction pour initialiser la socket
export function initializeSocket(): Socket {
    const jwtToken = Cookies.get('jwt-token');
    const socket = io("http://localhost:3000/chat1", {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });
  return socket;
}
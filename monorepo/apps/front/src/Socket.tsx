import React from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from "js-cookie";

const SocketContext = React.createContext<Socket | null>(null);

export default SocketContext;

export function initializeSocket(): Socket | null {
    const jwtToken = Cookies.get('jwt-token');
    if (!jwtToken) {
        return null;
    }

	const socket_url = import.meta.env.VITE_WEBAPPURL;

	const socket = io(socket_url, {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });
    return socket;
}

import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from "js-cookie";

const SocketContext = React.createContext<Socket | null>(null);

export default SocketContext;

export function initializeSocket(): Socket | undefined {
    const jwtToken = Cookies.get('jwt-token');
    if (!jwtToken)
        return;
    const socket = io("http://localhost:3000", {
    // const socket = io("http://made-f0br7s13:3000/chat1", {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });
    return socket;
}
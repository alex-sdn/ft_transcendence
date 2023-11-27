import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from "js-cookie";

const SocketContext = React.createContext<Socket | null>(null);

export default SocketContext;

export function initializeSocket(): Socket | undefined {
    const jwtToken = Cookies.get('jwt-token');
    if (!jwtToken) {
        // window.location.assign('/login');
        return;
    }
    const socket = io("http://localhost:3000/chat1", {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });
    return socket;
}

// export type SocketContextType = Socket;

// const socket = io("http://localhost:3000/chat1");
// export const SocketContext = React.createContext(socket);

// const SocketProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
//     return (
//         <SocketContext.Provider value={socket}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export default SocketProvider;

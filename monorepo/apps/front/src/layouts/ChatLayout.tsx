import React, { useContext, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import SocketContext from "../Socket";

const ChatLayout: React.FC = () => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        const disconnectSocket = () => {
            socket?.disconnect();
            socket?.connect();
        }
        disconnectSocket();
    }, []);

    return (
        <div className="sidebar">
            <div>
                <NavLink className="button-59 change-view channels-button" to={'/chat/channels'}>Channels</NavLink>
                <NavLink className="button-59 change-view friends-button" to={'/chat/@me'}>Friends</NavLink>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChatLayout;
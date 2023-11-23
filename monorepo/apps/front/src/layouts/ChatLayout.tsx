import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ChatLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');


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
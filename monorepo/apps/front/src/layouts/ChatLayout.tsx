import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

import CreateChannel from "../pages/chat/CreateChannel";
import ChannelSearchbar from "../pages/chat/ChannelSearchbar";

const ChatLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [myChannels, setMyChannels] = useState<string[]>([]);
    //changer channels par list et requete sur channels ou friends

    useEffect(() => {
        const getMyChannels = async () => {
            const response = await axios.get('/api/chat/channels/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) {
                if (Array.isArray(response.data)) {
                    const channels = response.data.map((channel) => channel.channel.name);
                    setMyChannels(channels);
                }
            }
        }
        getMyChannels();
    }, []);

    return (
        <div>
            <div className="sidebar">
                <ChannelSearchbar />
                <nav>
                    <ul>
                        {myChannels.map((channelName, index) => (
                            <li key={index}>
                                <NavLink to={`/chat/channel/${channelName}`}>{channelName}</NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div /*id="newChannel"*/>
                    <CreateChannel />
                </div>

            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChatLayout;
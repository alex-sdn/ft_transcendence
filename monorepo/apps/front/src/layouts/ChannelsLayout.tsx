import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

import CreateChannel from "../pages/chat/channels/CreateChannel";
import ChannelSearchbar from "../pages/chat/channels/ChannelSearchbar";

const ChannelsLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [myChannels, setMyChannels] = useState<string[]>([]);

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
                <div>
                    <ChannelSearchbar myChannels={myChannels} />
                    <nav>
                        <ul>
                            {myChannels.map((channelName, index) => (
                                <li key={index}>
                                    <NavLink to={`/chat/channels/${channelName}`}>{channelName}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <CreateChannel />
                </div>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChannelsLayout;
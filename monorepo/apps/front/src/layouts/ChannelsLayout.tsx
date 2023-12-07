import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import SocketContext from '../Socket';

import CreateChannel from "../pages/chat/channels/CreateChannel";
import ChannelSearchbar from "../pages/chat/channels/ChannelSearchbar";

export interface channel {
    name: string;
    access: string;
}

const ChannelsLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [myChannels, setMyChannels] = useState<string[]>([]);
    var me: string;
    const socket = useContext(SocketContext);

    useEffect(() => {
        const getMyChannels = async () => {
            try {
                const response = await axios.get('/api/chat/channels/me', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200) {
                    console.log("request")
                    if (Array.isArray(response.data)) {
                        const channels = response.data.map((channel) => channel.channel.name);
                        setMyChannels(channels);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        getMyChannels();
    }, [socket, jwtToken]);

    useEffect(() => {
        const getMe = async () => {
            try {
                const response = await axios.get('/api/user/me', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200)
                    me = response.data.nickname;
            }
            catch (error) {
                console.log(error);
            }
        }
        getMe();
    }, [socket, jwtToken])

    useEffect(() => {
        if (socket) {
            console.log("socket")
            socket.on("kick", (data) => {
                
                if (me == data.target) {
                    setMyChannels((prevChannels) => prevChannels.filter(channel => channel !== data.channel));
                }
            });

            // socket.on("ban", (data) => {
            //     if (data.target == me) {
            //         setMyChannels((prevChannels) => prevChannels.filter(channel => channel !== data.channel));
            //     }
            // });
        }

        return () => {
            if (socket) {
                socket.off("kick");
                // socket.off("ban");
            }
        }
    }, []);
    // socket listen for 'message'

    return (
        <div>
            <div>
                <div>
                    <ChannelSearchbar myChannels={myChannels} />
                    <nav>
                        <ul className="my-channels">
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
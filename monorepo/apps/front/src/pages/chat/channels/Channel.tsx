import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelMembers from './ChannelMembers'
import Cookies from "js-cookie";
import axios from 'axios';
import Messages from './Messages';

import Settings from './Settings';
import { channel } from '../../../layouts/ChannelsLayout';
import SocketContext from '../../../Socket';

export interface User {
    name: string;
    owner: boolean;
    admin: boolean;
    avatar: string;
    id: string;
}

export interface Channel {
    name: string;
    access: string; // add other necessary fields from your channel model
}

const Channel: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [members, setMembers] = useState<user[]>([]);
    const [eventData, setEventData] = useState<string>("");
    const [currentChannel, setCurrentChannel] = useState<channel>();
    const [message, setMessage] = useState<string>("");
    const [me, setMe] = useState<user>();
    const [settingsModal, setSettingsModal] = useState<boolean>(false);
    const { channelName } = useParams<{ channelName: string }>();
    const socket = useContext(SocketContext);

    useEffect(() => {
        const getChannelInfos = async () => {
            const membersResponse = await axios.get(`/api/chat/${channelName}/members`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            const meResponse = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (membersResponse.status === 200 && meResponse.status === 200) {
                const currentUserName = meResponse.data.nickname;

                if (Array.isArray(membersResponse.data)) {
                    const members: user[] = membersResponse.data.map((member: any) => ({
                        name: member.user.nickname,
                        owner: member.owner,
                        admin: member.admin,
                        avatar: member.user.avatar,
                        id: member.user.id,
                    }))
                    const currentUser = members.find((member) => member.name === currentUserName);
                    setMe(currentUser);

                    const otherUsers = members.filter((member) => member.name !== currentUserName);
                    setMembers(otherUsers);
                    setEventData("");
                }
            }

            const channelsResponse = await axios.get('/api/chat/channels/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (channelsResponse.status === 200) {
                if (Array.isArray(channelsResponse.data)) {
                    const channels: channel[] = channelsResponse.data.map((channel: any) => ({
                        name: channel.channel.name,
                        access: channel.channel.access,
                    }))
                    const res = channels.find((channel) => channel.name === channelName);
                    setCurrentChannel(res);
                }
            }
        }
        getChannelInfos();
    }, [channelName, jwtToken, eventData]);

    useEffect(() => {
        socket?.on("join", (data) => {
            if (data.target === channelName) {
                setEventData(data.sender);
            }
        });

        socket?.on("leave", (data) => {
            if (data.target === channelName) {
                setEventData(data.sender);
            }
        });

        socket?.on("mute", (data) => {
            if (data.channel === channelName) {
                window.location.reload();
            }
        });

        socket?.on("kick", (data) => {
            if (data.channel === channelName) {
                window.location.reload();
            }
        });

        socket?.on("ban", (data) => {
            if (data.channel === channelName) {
                window.location.reload();
            }
        });

        socket?.on("admin", (data) => {
            if (data.channel === channelName) {
                window.location.reload();
            }
        });

        // event changement de nickname -> refresh
        socket?.on("refresh", () => {
            setEventData("refresh");
        })

        return () => {
            socket?.off("join");
            socket?.off("leave");
            socket?.off("mute");
            socket?.off("kick");
            socket?.off("ban");
            socket?.off("admin");
            socket?.off("refresh");
        };
    }, [channelName, socket]);


    return (
        <div>
            <div className='name-settings'>
				<h2>{channelName}</h2>
				<button className="material-symbols-outlined"
					onClick={() => setSettingsModal(true)}
				>
					settings
				</button>
				{me && channelName && currentChannel &&
					<Settings me={me}
						currentChannel={currentChannel}
						settingsModal={settingsModal}
						onClose={() => setSettingsModal(false)}
					/>}
				{me && channelName && currentChannel &&
					<Messages sender={me} target={channelName} />
				}
			</div>
			<div>
				{members && me && currentChannel &&
					<ChannelMembers me={me}
						members={members}
						currentChannel={currentChannel}
					/>}
			</div>
		</div>
    );
}

export default Channel;

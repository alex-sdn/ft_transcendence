import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelMembers from './ChannelMembers'
import Cookies from "js-cookie";
import axios from 'axios';

import Settings from './Settings';
import { channel } from '../../../layouts/ChannelsLayout';

export interface user {
    name: string;
    owner: boolean;
    admin: boolean;
    avatar: string;
}

const Channel: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [members, setMembers] = useState<user[]>([]);
    const [currentChannel, setCurrentChannel] = useState<channel>();
    const [message, setMessage] = useState<string>("");
    const [me, setMe] = useState<user>();
    const [settingsModal, setSettingsModal] = useState<boolean>(false);
    const { channelName } = useParams<{ channelName: string }>();

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
                    }))
                    const currentUser = members.find((member) => member.name === currentUserName);
                    setMe(currentUser);

                    const otherUsers = members.filter((member) => member.name !== currentUserName);
                    setMembers(otherUsers);
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
    }, [channelName, me, jwtToken]); // fonction appelee chaque fois que les elements entre [] changent

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
            </div>
            <div className='chat-messages' >
                {/* <p>
                    <input type='text'
                        name='message'
                        placeholder='Send a message'
                        onChange={(e) => setMessage(e.target.value)} />
                </p>
                <p>
                    <button
                        className="material-symbols-outlined"
                        id='send-button'
                        type='submit'
                        value={message}
                        disabled={!message}
                    >
                        send
                    </button>
                </p> */}
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
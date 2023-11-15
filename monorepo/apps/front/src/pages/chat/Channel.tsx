import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelMembers from './ChannelMembers';
import Cookies from "js-cookie";
import axios from 'axios';
import Settings from './Settings';
import Messages from './Messages'; // Import the Messages component

export interface User {
    name: string;
    owner: boolean;
    admin: boolean;
    avatar: string;
}

const Channel: React.FC = () => {
    const [members, setMembers] = useState<User[]>([]);
    const [me, setMe] = useState<User>();
    const [settingsModal, setSettingsModal] = useState<boolean>(false);
    const jwtToken = Cookies.get('jwt-token');
    const { channelName } = useParams<{ channelName: string }>();

    useEffect(() => {
        const getChannelMembers = async () => {
            const membersResponse = await axios.get(`/api/chat/${channelName}/members`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            const meResponse = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },)
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
        }
        getChannelMembers();
    }, [channelName, jwtToken]); // fonction appelee chaque fois que les elements entre [] changent

    return (
        <div className="channel">
            <div className='name-settings'>
                <h2>{channelName}</h2>
                <button className="material-symbols-outlined" onClick={() => setSettingsModal(true)}>
                    settings
                </button>
                {me && channelName && <Settings me={me} channelName={channelName} settingsModal={settingsModal} onClose={() => setSettingsModal(false)} />}
            </div>
            
            {/* Include the Messages component */}
            {channelName && <Messages channelName={channelName} />}

            <div id='members'>
                {members && me && <ChannelMembers members={members} me={me} />}
            </div>
        </div>
    );
}

export default Channel;

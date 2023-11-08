import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Modal from "react-modal";
import Cookies from "js-cookie";
import axios from "axios";

import CreateChannel from "../pages/chat/CreateChannel";
import ChannelSearchbar from "../pages/chat/ChannelSearchbar";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
    },
};

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
                    const channels = response.data.map((channel) => channel.name);
                    setMyChannels(channels);
                }
            }
        }
        getMyChannels();
    }, []);

    //MODALE NewChannel start {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        window.location.reload();
        setIsOpen(false);
    };
    // } MODALE NewChannel end

    return (
        <div>
            <div className="sidebar">
                <ChannelSearchbar/>
                <nav>
                    <ul>
                        {myChannels.map((channelName, index) => (
                            <li key={index}>
                                <NavLink to={`/chat/channel/${channelName}`}>{channelName}</NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div id="newChannel">
                    <button className="button-59" onClick={openModal}>New channel</button>
                    <Modal
                        isOpen={isOpen}
                        onRequestClose={closeModal}
                        contentLabel="new channel"
                        style={customStyles}
                    >
                        <button className="material-symbols-outlined" onClick={closeModal}>close</button>
                        <CreateChannel />
                    </Modal>
                </div>

            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChatLayout;
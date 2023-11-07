import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { NavLink, Outlet } from "react-router-dom";
import Modal from "react-modal";
import CreateChannel from "../pages/chat/CreateChannel";
import SocketContext from "../Socket";
import { Socket } from "socket.io-client";
import axios from "axios";

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
    // let channels = ["Chocolat", "Chien", "Chat", "Cafeine", "Cafe"];
    const [value, setValue] = useState<string>("");
    const socket = useContext(SocketContext);

    const jwtToken = Cookies.get('jwt-token');
    const [allChannels, setAllChannels] = useState([]);

    const getMyChannels = async (value: string) => {
        await axios.get('/api/chat/channels/me', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
        },)
            .then((response) => {
                const results = response.data.filter((channel: any) => {
                    return (value && channel && channel.name && channel.name.toLowerCase().includes(value.toLowerCase()));
                })
                console.log(results);
                setAllChannels(results);
                console.log(allChannels);
            })
            .catch((error) => console.log(error));
    }

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value,);
        getMyChannels(event.target.value);
    }

    useEffect(() => {
        if (socket) {
            socket.on('create', (data: JSON) => {
                console.log(data);
                // fonction ou tu passes le JSON
                // recharge les channels affiches
            });
        }
    }, [socket]);

    //MODALE start {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        window.location.reload();
        setIsOpen(false);
    };
    // } MODALE end

    return (
        <div>
            <div className="sidebar">
                <div className="searchBar">
                    <div>
                        <input type="text"
                            value={value}
                            onChange={handleValueChange}
                            placeholder="Join a channel" />
                        <button /*onClick={(renvoie sur la page du channel selectionne)}*/>
                            <span className="material-symbols-outlined" /*onClick={}*/>add</span>
                        </button>
                    </div>
                    <ul>
                        {
                            allChannels && allChannels.map((element, index) => <li key={index}>{element.name}</li>)
                            // value && allChannels && (allChannels.filter((element) => typeof element === 'string' && element.toLowerCase().includes(value.toLowerCase()))
                            //     .map((element, index) => <li onClick={() => setValue(element)} key={index}>{element}</li>))
                        }
                    </ul>
                </div>
                <nav>
                    <ul>
                        <li>
                            <NavLink to={`/chat/channel/1`}>Channel1</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/chat/channel/2`}>Channel2</NavLink>
                        </li>
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
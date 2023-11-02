import React, { useState } from "react";
import Cookies from "js-cookie";
import { NavLink, Outlet } from "react-router-dom";
import Modal from "react-modal";
import createChannel from "../pages/chat/CreateChannel";
import io from "socket.io-client"

const ChatLayout: React.FC = () => {
    const channels = ["Chocolat", "Chien", "Chat", "Cafeine", "Cafe"];
    const [value, setValue] = useState("");
    const jwtToken = Cookies.get('jwt-token');
    const socket = io("http://localhost:3000/chat1", {
        extraHeaders: {
            'Authorization': 'Bearer ' + jwtToken,
        }
    });

    if (!socket.active) {
        console.log('pas socket');
    }

    socket.on('create', (data: JSON) => {
        console.log(data);
        // Handle incoming messages
        // fonction ou tu passes le JSON
        //   setReceivedMessages((prevMessages) => [...prevMessages, data]);
    });

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value,);
    }

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

    return (
        <div>
            <div className="sidebar">
                <div className="searchBar">
                    <div>
                        <input type="text" value={value} onChange={handleValueChange} />
                        <button /*onClick={(renvoie sur la page du channel selectionne)}*/>
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>
                    <ul>
                        {
                            value && (channels.filter((element) => element.toLowerCase().includes(value.toLowerCase()))
                                .map((element, index) => <li onClick={() => setValue(element)} key={index}>{element}</li>))
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
                        {createChannel(socket)}
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
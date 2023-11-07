import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import Cookies from "js-cookie";
import axios from "axios";

import CreateChannel from "../pages/chat/CreateChannel";
import SocketContext from "../Socket";

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

interface channels {
    name: string;
    access: string;
}

const ChatLayout: React.FC = () => {
    const socket = useContext(SocketContext);
    const jwtToken = Cookies.get('jwt-token');

    // search bar start
    const [searchChannels, setSearchChannels] = useState<channels[]>([]);
    const [value, setValue] = useState<string>("");
    const getSearchChannels = async (value: string) => {
        await axios.get('/api/chat/channels/all', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
        },)
            .then((response) => {
                console.log(response.data);
                const results = response.data.filter((channel: any) => {
                    return (value && channel && channel.name && channel.name.toLowerCase().includes(value.toLowerCase()));
                })
                setSearchChannels(results);
            })
            .catch((error) => console.log(error));
    }

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value,);
        getSearchChannels(event.target.value);
    }

    const [password, setPassword] = useState<string>("");
    const joinChannel = () => {
        // recuperer le channel qui correspond a value:
        let channelSelected: channels = { name: "", access: "" };
        const res = searchChannels.find((item) => item.name === value);
        if (res) {
            channelSelected = { name: res.name, access: res.access };
        }
        else {
            channelSelected = { name: value, access: "" }
        }
        if (socket) {
            socket.emit("join", { target: channelSelected.name, password: password })
        }
    }
    // search bar end

    useEffect(() => {
        if (socket) {
            socket.on('join', (data) => {
                console.log("socket.on result: " + data.target);
                console.log(typeof(data.target));
                if (data && data.target) {
                    const navigate = useNavigate();
                    return navigate(`/chat/channel/${data.target}`);
                }
            });
        }
    }, [socket]);

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
                    const channels = response.data.map((channel) => channel.name);
                    setMyChannels(channels);
                }
            }
        }
        getMyChannels();
    }, []);

    // MODALE Password start
    const [isOpenPswd, setIsOpenPswd] = useState(false);

    const openModalPswd = () => {
        setIsOpenPswd(true);
    };

    const closeModalPswd = () => {
        window.location.reload();
        setIsOpenPswd(false);
    };
    // MODALE Password end

    //MODALE NewChannel start {
    const [isOpenNew, setIsOpenNew] = useState(false);

    const openModalNew = () => {
        setIsOpenNew(true);
    };

    const closeModalNew = () => {
        window.location.reload();
        setIsOpenNew(false);
    };
    // } MODALE NewChannel end

    return (
        <div>
            <div className="sidebar">
                <div className="searchBar">
                    <div>
                        <input type="text"
                            value={value}
                            onChange={handleValueChange}
                            placeholder="Join a channel" />
                        <button onClick={joinChannel} /*onClick={openModalPswd}*/>
                            <span className="material-symbols-outlined">add</span>
                            {/* afficher Modal que si channelSelected.access === protected */}
                            {/* <Modal
                                isOpen={isOpenPswd}
                                onRequestClose={closeModalPswd}
                                contentLabel="password"
                                style={customStyles}
                            >
                                <button className="material-symbols-outlined" onClick={closeModalPswd}>close</button>
                            </Modal> */}
                        </button>
                    </div>
                    <div className="searchResults">
                        <ul>
                            {
                                searchChannels && searchChannels.map((element, index) => <li onClick={() => setValue(element.name)} key={index}>{element.name}</li>)
                            }
                        </ul>
                    </div>
                </div>
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
                    <button className="button-59" onClick={openModalNew}>New channel</button>
                    <Modal
                        isOpen={isOpenNew}
                        onRequestClose={closeModalNew}
                        contentLabel="new channel"
                        style={customStyles}
                    >
                        <button className="material-symbols-outlined" onClick={closeModalNew}>close</button>
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
import axios from "axios";
import React, { useContext, useState } from "react";
import Cookies from "js-cookie";
import Modal from "react-modal";

import SocketContext from "../../Socket";

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

const ChannelSearchbar: React.FC = () => {
    const [searchChannels, setSearchChannels] = useState<channels[]>([]);
    const [value, setValue] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');
    const socket = useContext(SocketContext);

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
    let channelSelected: channels = { name: "", access: "" };
    const joinChannel = () => {
        // recuperer le channel qui correspond a value:
        const res = searchChannels.find((item) => item.name === value);
        if (res) {
            channelSelected = { name: res.name, access: res.access };
            if (channelSelected.access === 'protected') {
                console.log(channelSelected.access);
                openModal();
            }
        }
        else {
            channelSelected = { name: value, access: "" }
        }
        if (socket) {
            socket.emit("join", { target: channelSelected.name, password: password });
            socket.on('error', (data) => {
                console.log(data.message);
                alert(data.message);
            });
            socket.on('join', (data) => {
                window.location.reload();
                // pop-up pour confirmer le choix de rejoindre le channel et la reidrection vers le nouveau channel ?
            });
        }
    }

    // MODALE Password start
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        window.location.reload();
        setIsOpen(false);
    };
    // MODALE Password end

    return (
        <div className="searchBar">
            <div>
                <input type="text"
                    value={value}
                    onChange={handleValueChange}
                    placeholder="Join a channel" />
                <button disabled={!value} onClick={joinChannel}>
                    <span className="material-symbols-outlined">add</span>
                    <Modal
                        isOpen={isOpen}
                        onRequestClose={closeModal}
                        contentLabel="password"
                        style={customStyles}
                    >
                        <button className="material-symbols-outlined" onClick={closeModal}>close</button>
                        <p>
                            <input type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </p>
                        <p>
                            <button type="submit"
                                onClick={closeModal}>
                                submit
                            </button>
                        </p>
                    </Modal>
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
    );
}

export default ChannelSearchbar;
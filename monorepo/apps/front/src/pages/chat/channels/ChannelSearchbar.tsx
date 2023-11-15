import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalBody,
    Form,
    FormGroup,
    FormLabel,
    FormControl,
    ModalFooter
} from "react-bootstrap";

import SocketContext from "../../../Socket";

interface channel {
    name: string;
    access: string;
}

interface channelSearchBarProps {
    myChannels: string[];
}

const ChannelSearchbar: React.FC<channelSearchBarProps> = ({ myChannels }) => {
    const [searchChannels, setSearchChannels] = useState<channel[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [value, setValue] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');
    const socket = useContext(SocketContext);

    const getSearchChannels = async (value: string) => {
        await axios.get('/api/chat/channels/other', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
        },)
            .then((response) => {
                const results = response.data.filter((channel: any) => {
                    return (value && channel && channel.name && channel.name.toLowerCase().includes(value.toLowerCase()));
                })
                setSearchChannels(results);
            })
            .catch((error) => console.log(error));
    }

    const isChannelProtected = () => {
        // recuperer le channel qui correspond a value:
        const res = searchChannels.find((item) => item.name === value);
        const joined = myChannels.find((item) => item === value);
        if (res) {
            if (res.access === 'protected') {
                setShowPasswordModal(true);
            }
            else {
                setShowJoinModal(true);
            }
        }
        else if (joined) {
            setError("You are already in this channel");
        }
        else {
            setError("This channel doesn't exist");
        }
    }

    const joinChannel = async () => {
        const createPromise = new Promise<{ target: string }>((resolve, reject) => {
            if (socket) {
                socket.emit("join", { target: value, password: password });
                socket.on("join", (data) => {
                    resolve(data);
                });
                socket.on('error', (data) => {
                    reject(data);
                });
            }
        });

        createPromise
            .then((data) => {
                setShowJoinModal(false);
                window.location.assign(`/chat/channel/${data.target}`);
            })
            .catch((error) => {
                setError(error.message);
                console.log(error.message);
            });
    }

    return (
        <div className="searchBar">
            <div>
                <input type="text"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        getSearchChannels(e.target.value);
                        setError("");
                    }}
                    placeholder="Join a channel" />
                <button disabled={value.length < 2}
                    onClick={isChannelProtected}
                    className="material-symbols-outlined"
                >
                    add
                </button>
            </div>
            {error && <div className="text-danger">{error}</div>}
            <div className="searchResults">
                <ul>
                    {searchChannels && searchChannels.map((element, index) => <li onClick={() => setValue(element.name)} key={index}>{element.name}</li>)}
                </ul>
            </div>
            <Modal show={showPasswordModal}
                onHide={() => {
                    setShowPasswordModal(false);
                }}
                style={{ color: "black" }}
            >
                <ModalHeader closeButton>
                    <ModalTitle>This channel is protected</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={() => {
                        setShowPasswordModal(false);
                        joinChannel();
                    }}>
                        <FormGroup controlId="password">
                            <FormLabel>Enter the password to join {value}</FormLabel>
                            <FormControl type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <ModalFooter>
                            <button className="button-59"
                                type="submit"
                            >
                                Join
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
            <Modal show={showJoinModal}
                onHide={() => setShowJoinModal(false)}
                style={{ color: "black" }}
            >
                <ModalHeader>
                    <ModalTitle>
                        <div>Do you want to join <strong>{value}</strong> ?</div>
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59"
                        onClick={() => setShowJoinModal(false)}>
                        No
                    </button>
                    <button className="button-59"
                        onClick={() => {
                            setShowJoinModal(false);
                            joinChannel()
                        }}>
                        Yes
                    </button>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default ChannelSearchbar;
import axios from "axios";
import React, { useContext, useState } from "react";
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
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [errorName, setErrorName] = useState<string>("");
    const [value, setValue] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');
    const socket = useContext(SocketContext);
    const [passwordModal, setPasswordModal] = useState<boolean>(false);
    const [joinModal, setJoinModal] = useState<boolean>(false);

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
                setPasswordModal(true);
            }
            else {
                setJoinModal(true);
            }
        }
        else if (joined) {
            setErrorName("You are already in this channel");
        }
        else {
            setErrorName("This channel doesn't exist");
        }
    }

    const joinChannel = async (event: React.FormEvent) => {
        event.preventDefault();

        const createPromise = new Promise<{ target: string }>((resolve, reject) => {
            if (socket) {
                socket.emit("join", { target: value, password: password });
                socket.on("join", (data) => {
                    resolve(data);
                });
                socket.on("error", (data) => {
                    reject(data);
                });
            }
        });

        createPromise
            .then((data) => {
                window.location.assign(`/chat/channels/${data.target}`);
            })
            .catch((error) => {
                setError(error.message);
                setPassword("");
            });
    }

    return (
        <div className="searchBar">
            <div>
                <input type="text"
                    name="channel-research"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        getSearchChannels(e.target.value);
                        setErrorName("");
                    }}
                    placeholder="Join a channel" />
                <button disabled={value.length < 2}
                    onClick={isChannelProtected}
                    className="material-symbols-outlined"
                >
                    add
                </button>
            </div>
            {errorName && <div className="text-danger">{errorName}</div>}
            <div className="searchResults">
                <ul>
                    {searchChannels && searchChannels.map((element, index) => <li onClick={() => {
                        setValue(element.name);
                        setErrorName("");
                    }} key={index}>{element.name}</li>)}
                </ul>
            </div>
            <Modal show={passwordModal}
                onHide={() => { setPasswordModal(false) }}
                style={{ color: "black" }}
            >
                <ModalHeader>
                    <ModalTitle>This channel is protected</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={joinChannel}>
                        <FormGroup controlId="channel-password">
                            <FormLabel>
                                Enter the password to join {value}
                            </FormLabel>
                            <FormControl
                                type="password"
                                name="channel-password"
                                id="channel-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </FormGroup>
                        {error && <div className="text-danger">{error}</div>}
                        <ModalFooter>
                            <button className="button-59"
                                type="submit"
                            >
                                Join
                            </button>
                            <button className="button-59"
                                type="button"
                                onClick={() => {
                                    setPasswordModal(false);
                                    setError("");
                                }}
                            >
                                Cancel
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>

            <Modal show={joinModal}
                onHide={() => setJoinModal(false)}
                style={{ color: "black" }}
            >
                <ModalHeader>
                    <ModalTitle>
                        <div>
                            Do you want to join <strong>{value}</strong>?
                        </div>
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59"
                        onClick={() => {
                            setJoinModal(false);
                            setError("");
                        }}>
                        No
                    </button>
                    <button className="button-59"
                        onClick={joinChannel}>
                        Yes
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <button onClick={() => {
                        setError("");
                        setJoinModal(false);
                    }}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default ChannelSearchbar;
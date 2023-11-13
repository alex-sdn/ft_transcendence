import axios from "axios";
import React, { useContext, useState } from "react";
import Cookies from "js-cookie";
import {
    Modal,
    Alert,
    ModalHeader,
    ModalTitle,
    ModalBody,
    Form,
    FormGroup,
    FormLabel,
    FormControl,
    ModalFooter
} from "react-bootstrap";

import SocketContext from "../../Socket";

interface channels {
    name: string;
    access: string;
}

const ChannelSearchbar: React.FC = () => {
    const [searchChannels, setSearchChannels] = useState<channels[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
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
        if (res) {
            if (res.access === 'protected') {
                setShowPasswordModal(true);
            }
            else {
                setShowJoinModal(true);
            }
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
                // setShowJoinModal(false);
                window.location.assign(`/chat/channel/${data.target}`);
            })
            .catch((error) => {
                // setShowJoinModal(false);
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
                    }}
                    placeholder="Join a channel" />
                <button disabled={value.length < 2} onClick={isChannelProtected}>
                    <span className="material-symbols-outlined">add</span>
                </button>
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
                    <ModalBody>
                        <p>Do you want to join <strong>{value}</strong> ?</p>
                    </ModalBody>
                    <ModalFooter>
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
                    </ModalFooter>
                </Modal>
            </div>
            <div className="searchResults">
                <ul>
                    {searchChannels && searchChannels.map((element, index) => <li onClick={() => setValue(element.name)} key={index}>{element.name}</li>)}
                </ul>
            </div>
        </div>
    );
}

export default ChannelSearchbar;
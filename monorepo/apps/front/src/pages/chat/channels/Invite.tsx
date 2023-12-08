import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Form, FormControl, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";

import { channel } from "../../../layouts/ChannelsLayout";

interface inviteProps {
    currentChannel: channel;
    inviteModal: boolean;
    socket: Socket;
    onClose: () => void;
}

const Invite: React.FC<inviteProps> = ({
    currentChannel,
    inviteModal,
    socket,
    onClose
}) => {
    const jwtToken = Cookies.get('jwt-token');
    const [myFriends, setMyFriends] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [userSelected, setUserSelected] = useState<string>("");

    useEffect(() => {
        const getMyFriends = async () => {
            try {
                const response = await axios.get('/api/user/me/friend', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200) {
                    if (Array.isArray(response.data)) {
                        const friends = response.data.map((user) => user.user2.nickname);
                        setMyFriends(friends);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        getMyFriends();
    }, [jwtToken]);

    const handleInvite = async (event: React.FormEvent) => {
        event.preventDefault();
        const createPromise = new Promise<{
            sender: string;
            target: string;
            channel: string;
        }>((resolve, reject) => {
            if (socket && userSelected) {
                socket.emit("invite", { target: userSelected, channel: currentChannel.name });
                socket.on("invite", (data) => {
                    resolve(data);
                });
                socket.on("error", (data) => {
                    reject(data);
                });
            }
        });

        createPromise
            .then(() => {
                setError("");
                setUserSelected("");
                onClose();
            })
            .catch((error) => {
                setError(error.message);
            })
    }

    return (
        <div>
            <Modal show={inviteModal}
                onHide={onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Invite a friend to <strong>{currentChannel.name}</strong>
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleInvite}>
                        <FormGroup controlId="select-friend">
                            <FormControl as="select"
                                name="select-friend"
                                value={userSelected}
                                onChange={(e) => {
                                    setUserSelected(e.target.value);
                                    setError("");
                                }}>
                                <option value="">Choose a friend to invite</option>
                                {myFriends.map((friend, index) => (
                                    <option key={index} value={friend}>
                                        {friend}
                                    </option>
                                ))}
                            </FormControl>
                        </FormGroup>
                        {error && <div className="text-danger">{error}</div>}
                        <ModalFooter>
                            <button className="button-59"
                                type="submit"
                            >
                                Invite
                            </button>
                            <button className="button-59"
                                type="button"
                                onClick={() => {
                                    onClose();
                                    setError("");
                                    setUserSelected("");
                                }}
                            >
                                Cancel
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Invite;
import React, { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import { Socket } from "socket.io-client";
import Cookies from "js-cookie";
import {
    FormControl,
    FormGroup,
    FormLabel,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle
} from "react-bootstrap";
import axios from "axios";

interface accessProps {
    channelName: string;
    accessModal: boolean;
    socket: Socket;
    onClose: () => void;
}

interface channel {
    name: string;
    access: string;
}

const Access: React.FC<accessProps> = ({ channelName, accessModal, socket, onClose }) => {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [access, setAccess] = useState<string>("");
    const [currentChannel, setCurrentChannel] = useState<channel>();
    const jwtToken = Cookies.get('jwt-token');

    useEffect(() => {
        const getMyChannels = async () => {
            const response = await axios.get('/api/chat/channels/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) {
                if (Array.isArray(response.data)) {
                    const channels: channel[] = response.data.map((channel: any) => ({
                        name: channel.channel.name,
                        access: channel.channel.access,
                    }))
                    const res = channels.find((channel) => channel.name === channelName);
                    setCurrentChannel(res);
                }
            }
        }
        getMyChannels();
    }, [channelName]);

    const handleAccessChange = async (event: React.FormEvent) => {
        event.preventDefault();

        const createPromise = new Promise<{
            sender: string;
            target: string;
            access: string;
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("access", { target: channelName, access: access, password: password });
                socket.on("access", (data) => {
                    resolve(data);
                });
                socket.on("error", (data) => {
                    reject(data);
                })
            }
        });

        createPromise
            .then((data) => {
                const message = data.sender + "changed the access of the channel to " + data.access;
                socket?.emit("message", { target: data.target, message: message });
                setError("");
                setPassword("");
                onClose();
                window.location.reload();
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={accessModal}
                onHide={() => onClose()}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Change access of <strong>{channelName}</strong>
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleAccessChange}>
                        <FormGroup controlId="access">
                            <FormLabel>Access</FormLabel>
                            <FormControl as="select"
                                name="access"
                                value={access}
                                onChange={(e) => {
                                    setAccess(e.target.value);
                                    setError("");
                                }}
                            >
                                <option value="">Choose access</option>
                                {currentChannel &&
                                    currentChannel.access !== "public" &&
                                    <option value="public">public</option>}
                                {currentChannel &&
                                    currentChannel.access !== "private" &&
                                    <option value="private">private</option>}
                                <option value="protected">protected</option>
                            </FormControl>
                        </FormGroup>
                        {access === 'protected' && (
                            <FormGroup controlId="password">
                                <FormLabel>Password</FormLabel>
                                <FormControl type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                                    minLength={8}
                                    required
                                />
                            </FormGroup>
                        )}
                        {error && <div className="text-danger">{error}</div>}
                        <ModalFooter>
                            <button className="button-59"
                                type="submit"
                                disabled={!access}
                            >
                                Save changes
                            </button>
                            <button className="button-59"
                                type="button"
                                onClick={() => {
                                    setPassword("");
                                    setError("");
                                    onClose();
                                }}>
                                Cancel
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Access;
import React, { useContext, useState } from "react";
import SocketContext from "../../../Socket";
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Form,
    FormGroup,
    FormLabel,
    FormControl
} from "react-bootstrap";

const createChannel: React.FC = () => {
    const socket = useContext(SocketContext);
    const [channelName, setChannelName] = useState<string>("");
    const [access, setAccess] = useState<string>("public");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleChannelSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const createPromise = new Promise<{
            sender: string;
            target: string;
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("create", { target: channelName, access: access, password: password });
                socket.on("create", (data) => {
                    resolve(data);
                });
                socket.on("error", (data) => {
                    reject(data);
                })
            }
        });

        createPromise
            .then((data) => {
                const message = data.sender + " created this channel";
                socket?.emit("message", { target: data.target, message: message });
                setShowModal(false);
                window.location.assign(`/chat/channels/${data.target}`);

            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div className="create-channel">
            <button className="button-59 new-channel-button"
                onClick={() => setShowModal(true)}>
                New channel
            </button>
            <Modal show={showModal}
                onHide={() => setShowModal(false)}
                style={{ color: "black" }}
            >
                <ModalHeader closeButton>
                    <ModalTitle>Create a new channel</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleChannelSubmit}>
                        <FormGroup controlId="channelName">
                            <FormLabel>Channel name</FormLabel>
                            <FormControl type="text"
                                name="channel-name"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup controlId="access">
                            <FormLabel>Access</FormLabel>
                            <FormControl as="select"
                                name="access"
                                value={access}
                                onChange={(e) => setAccess(e.target.value)}
                            >
                                <option value="public">public</option>
                                <option value="private">private</option>
                                <option value="protected">protected</option>
                            </FormControl>
                        </FormGroup>
                        {access === 'protected' && (
                            <FormGroup controlId="password">
                                <FormLabel>Password</FormLabel>
                                <FormControl type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </FormGroup>
                        )}
                        {error && <div className="text-danger">{error}</div>}
                        <ModalFooter>
                            <button className="button-59"
                                type="submit"
                            >
                                Create channel
                            </button>
                            <button className="button-59"
                                onClick={() => {
                                    setChannelName("");
                                    setAccess("public");
                                    setPassword("");
                                    setError("");
                                    setShowModal(false);
                                }}>
                                Cancel
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody >
            </Modal >
        </div >
    );
}

export default createChannel;
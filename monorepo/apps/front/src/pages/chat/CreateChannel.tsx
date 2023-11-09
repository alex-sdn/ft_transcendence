import React, { useContext, useState } from "react";
import SocketContext from "../../Socket";
import { Alert, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

const createChannel: React.FC = () => {
    const [channelName, setChannelName] = useState("");
    const [access, setAccess] = useState('public');
    const [password, setPassword] = useState("");
    const socket = useContext(SocketContext);
    const [showModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const handleChannelSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const createPromise = new Promise<{ target: string }>((resolve, reject) => {
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
                setShowModal(false);
                window.location.assign(`/chat/channel/${data.target}`);

            })
            .catch((error) => {
                setShowAlert(true);
                console.log("error msg: " + error.message);

            });
    }

    return (
        <div className="createChannel">
            <button className="button-59"
                onClick={() => setShowModal(true)}>
                New channel
            </button>
            <Modal show={showModal}
                onHide={() => setShowModal(false)}
                style={{ color: "black" }}>
                <ModalHeader closeButton>
                    <ModalTitle>Create a new channel</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <p>
                        <label>
                            Channel name
                            <p>
                                <input type="text"
                                    name="channel-name"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    required />
                            </p>
                        </label>
                    </p>
                    <p>
                        <label>Access
                            <p>
                                <select name="access"
                                    id="access"
                                    value={access}
                                    onChange={(e) => setAccess(e.target.value)}>
                                    <option value="public">public</option>
                                    <option value="private">private</option>
                                    <option value="protected">protected</option>
                                </select>
                            </p>
                        </label>
                    </p>
                    {access === 'protected' && (
                        <p>
                            <label>
                                Password
                                <p>
                                    <input type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={8}
                                        required />
                                </p>
                            </label>
                        </p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={handleChannelSubmit}
                    >
                        Create channel
                    </button>
                </ModalFooter>
            </Modal>
            <Alert variant="danger"
                show={showAlert}
                onClose={() => setShowAlert(false)}
                dismissible
                style={{ position: "absolute" }}
            >
                <p>
                    This channel name is already taken. Please chose an other name.
                </p>
            </Alert>
        </div>
    );
}

export default createChannel;
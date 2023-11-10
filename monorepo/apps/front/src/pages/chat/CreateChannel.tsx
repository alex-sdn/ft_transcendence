import React, { useContext, useState } from "react";
import SocketContext from "../../Socket";
import {
    Alert,
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
    const [access, setAccess] = useState<string>('public');
    const [password, setPassword] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);

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
        <div className="create-channel">
            <button className="button-59"
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
                        <ModalFooter>
                            <button className="button-59 btn-new-channel"
                                type="submit"
                            >
                                Create channel
                            </button>
                        </ModalFooter>
                    </Form>
                </ModalBody >
            </Modal >
            <Alert variant="danger"
                show={showAlert}
                onClose={() => setShowAlert(false)}
                dismissible
                style={{ position: "absolute" }}
                className="fixed-top"
            >
                <p>
                    This channel name is already taken.
                    Please chose an other name.
                </p>
            </Alert>
        </div >
    );
}

export default createChannel;
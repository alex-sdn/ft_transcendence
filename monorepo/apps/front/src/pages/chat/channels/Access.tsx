import React, { useState } from "react";
import { Form } from "react-router-dom";
import { Socket } from "socket.io-client";
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
import { channel } from "../../../layouts/ChannelsLayout";

interface accessProps {
    currentChannel: channel;
    accessModal: boolean;
    socket: Socket;
    onClose: () => void;
}

const Access: React.FC<accessProps> = ({
    currentChannel,
    accessModal,
    socket,
    onClose
}) => {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [access, setAccess] = useState<string>("");

    const handleAccessChange = async (event: React.FormEvent) => {
        event.preventDefault();

        const createPromise = new Promise<{
            sender: string;
            target: string;
            access: string;
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("access", { target: currentChannel.name, access: access, password: password });
                socket.on("access", (data) => {
                    resolve(data);
                });
                socket.on("error", (data) => {
                    reject(data);
                })
            }
        });

        createPromise
            .then(() => {
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
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Change access of <strong>{currentChannel.name}</strong>
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
                                    pattern="[a-zA-Z0-9_\-]{8,20}"
                                    title="Password can only contain letters, numbers, hyphens, and underscores, and a length between 8 and 20 characters"
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
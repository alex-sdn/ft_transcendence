import React, { useState } from "react";
import { channel } from "../../../layouts/ChannelsLayout";
import { Socket } from "socket.io-client";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

interface leaveProps {
    currentChannel: channel;
    leaveModal: boolean;
    socket: Socket;
    onClose: () => void;
}

const Leave: React.FC<leaveProps> = ({
    currentChannel,
    leaveModal,
    socket,
    onClose
}) => {
    const [error, setError] = useState<string>("");

    const handleLeave = async () => {
        const createPromise = new Promise<{
            sender: string;
            target: string
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("leave", { target: currentChannel.name });
                socket.on("leave", (data) => {
                    resolve(data);
                });
                socket.on("error", data => {
                    reject(data);
                });
            }
        });

        createPromise
            .then(() => {
                setError("");
                onClose();
                window.location.assign('/chat/channels');
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={leaveModal}
                onHide={onClose}
                style={{ color: "black" }}>
                <ModalHeader>
                    <ModalTitle>
                        Do you really want to leave <strong>{currentChannel.name}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody className="action-buttons">
                    <button className="button-59"
                        onClick={handleLeave}
                    >
                        Yes
                    </button>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                        }}
                    >
                        No
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                        }}
                    >
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Leave;
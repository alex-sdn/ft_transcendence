import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { Socket } from "socket.io-client";

interface accessProps {
    channelName: string;
    accessModal: boolean;
    socket: Socket;
    onClose: () => void;
}

const Access: React.FC<accessProps> = ({ channelName, accessModal, socket, onClose }) => {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    return (
        <div>
            <Modal show={accessModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Change access of <strong>{channelName}</strong>
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <input type="password"
                        placeholder="Chose a new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button>
                        Remove password
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Access;
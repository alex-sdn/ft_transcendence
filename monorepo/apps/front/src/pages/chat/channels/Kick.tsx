import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import SocketContext from "../../../Socket.js";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import { useLocation } from "react-router-dom";

interface kickProps {
    selectedMember: user;
    me: string;
    selectedChannel: string | undefined;
    kickModal: boolean;
    onClose: () => void;
}

const Kick: React.FC<kickProps> = ({
    selectedMember,
    me,
    selectedChannel,
    kickModal,
    onClose
}) => {
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");
    const currentUrl = useLocation();

    const handleKick = async () => {
        const createPromise = new Promise<{
            sender: string;
            target: string
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("kick", { target: selectedMember.name, channel: selectedChannel });
                socket.on("kick", (data) => {
                    resolve(data);
                });
                socket.on("error", data => {
                    reject(data);
                });
            }
        });

        createPromise
            .then((data) => {
                setError("");
                onClose();
                window.location.reload();
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={kickModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Do you really want to kick <strong>{selectedMember.name}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody className="action-buttons">
                    <button className="button-59"
                        onClick={handleKick}
                    >
                        Yes
                    </button>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                        }}>
                        No
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                        }}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default Kick;

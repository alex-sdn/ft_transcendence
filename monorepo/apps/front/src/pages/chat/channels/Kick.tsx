import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import SocketContext from "../../../Socket.js";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

interface kickProps {
    selectedMember: user;
    selectedChannel: string | undefined;
    kickModal: boolean;
    onClose: () => void;
}

const Kick: React.FC<kickProps> = ({
    selectedMember,
    selectedChannel,
    kickModal,
    onClose
}) => {
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");

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
                const message = data.sender + " kicked " + data.target;
                socket?.emit("message", { target: selectedChannel, message: message });
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
                <ModalBody>
                    <button className="button-59" onClick={handleKick}>Yes</button>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                        }}>
                        No
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
            </Modal>
        </div>
    )
}

export default Kick;
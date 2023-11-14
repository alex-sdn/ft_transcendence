import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import SocketContext from "../../Socket";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

interface banModalProps {
    selectedMember: user;
    selectedChannel: string | undefined;
    banModal: boolean;
    onClose: () => void;
}

const Ban: React.FC<banModalProps> = ({
    selectedMember,
    selectedChannel,
    banModal,
    onClose
}) => {
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");

    const handleBan = async () => {
        const createPromise = new Promise<{
            sender: string;
            target: string
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("ban", { target: selectedMember.name, channel: selectedChannel });
                socket.on("ban", (data) => {
                    resolve(data);
                });
                socket.on("error", data => {
                    reject(data);
                });
            }
        });

        createPromise
            .then((data) => {
                const message = data.sender + " banned " + data.target;
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
            <Modal show={banModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Do you really want to ban <strong>{selectedMember.name}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59" onClick={handleBan}>Yes</button>
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

export default Ban;
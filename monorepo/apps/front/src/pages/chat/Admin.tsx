import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import SocketContext from "../../Socket";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

interface adminModalProps {
    selectedMember: user;
    selectedChannel: string | undefined;
    adminModal: boolean;
    onClose: () => void;
}

const Admin: React.FC<adminModalProps> = ({
    selectedMember,
    selectedChannel,
    adminModal,
    onClose
}) => {
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");

    const handleAdmin = async () => {
        const createPromise = new Promise<{
            sender: string;
            target: string
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("admin", { target: selectedMember.name, channel: selectedChannel });
                socket.on("admin", (data) => {
                    resolve(data);
                });
                socket.on("error", data => {
                    reject(data);
                });
            }
        });

        createPromise
            .then((data) => {
                const message = data.sender + " made " + data.target + " an admin";
                socket?.emit("message", { target: selectedChannel, message: message });
                setError("");
                onClose();
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={adminModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Do you really want to make <strong>{selectedMember.name}</strong> an admin?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59"
                        onClick={handleAdmin}
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
            </Modal>
        </div>
    )
}

export default Admin;
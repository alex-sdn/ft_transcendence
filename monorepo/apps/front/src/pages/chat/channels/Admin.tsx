import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import SocketContext from "../../../Socket.js";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

interface adminProps {
    selectedMember: user;
    selectedChannel: string | undefined;
    adminModal: boolean;
    onClose: () => void;
}

const Admin: React.FC<adminProps> = ({
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
            .then(() => {
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
                <ModalBody className="action-buttons">
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

export default Admin;
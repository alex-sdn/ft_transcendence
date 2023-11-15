import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { Socket } from "socket.io-client";

interface passwordProps {
    channelName: string;
    passwordModal: boolean;
    socket: Socket;
    onClose: () => void;
}

const Password: React.FC<passwordProps> = ({ channelName, passwordModal, socket, onClose }) => {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    
    // const handlePasswordChange = async () => {
    //     const createPromise = new Promise<{
    //         sender: string;
    //         target: string
    //     }>((resolve, reject) => {
    //         if (socket) {
    //             socket.emit("mute", { target: selectedMember.name, channel: selectedChannel, time: duration });
    //             socket.on("mute", (data) => {
    //                 resolve(data);
    //             });
    //             socket.on("error", data => {
    //                 reject(data);
    //             });
    //         }
    //     });

    //     createPromise
    //         .then((data) => {
    //             setError("");
    //             onClose();
    //         })
    //         .catch((error) => {
    //             setError(error.message);
    //         });
    // }

    return (
        <div>
            <Modal show={passwordModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Change the password of <strong>{channelName}</strong>
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
                    {/* bouton pour remove le password */}
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Password;
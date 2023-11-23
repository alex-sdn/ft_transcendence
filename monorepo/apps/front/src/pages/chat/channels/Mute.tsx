import React, { useContext, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import { user } from './Channel.tsx';
import SocketContext from "../../../Socket.js";

interface muteProps {
    selectedMember: user;
    selectedChannel: string | undefined;
    muteModal: boolean;
    onClose: () => void;
}

const Mute: React.FC<muteProps> = ({
    selectedMember,
    selectedChannel,
    muteModal,
    onClose
}) => {
    const socket = useContext(SocketContext);
    const [duration, setDuration] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleMute = async () => {
        const createPromise = new Promise<{
            sender: string;
            target: string;
        }>((resolve, reject) => {
            if (socket) {
                socket.emit("mute", { target: selectedMember.name, channel: selectedChannel, time: duration });
                socket.on("mute", (data) => {
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
                setDuration("");
                onClose();
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={muteModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        For how long do you want you mute {selectedMember.name}?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <input type="number"
                        step={"any"}
                        min={1}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Duration in minutes"
                    />
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <button className="button-59" onClick={handleMute}>Mute</button>
                    <button className="button-59"
                        onClick={() => {
                            onClose();
                            setError("");
                            setDuration("")
                        }}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Mute;
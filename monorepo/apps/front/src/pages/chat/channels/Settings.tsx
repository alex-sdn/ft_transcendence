import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

import SocketContext from "../../../Socket.js";
import Access from "./Access.tsx";
import { channel } from "../../../layouts/ChannelsLayout.tsx";
import Invite from "./Invite.tsx";

interface settingsProps {
    me: user;
    currentChannel: channel;
    settingsModal: boolean;
    onClose: () => void;
}

const Settings: React.FC<settingsProps> = ({ me, currentChannel, settingsModal, onClose }) => {
    const [leaveModal, setLeaveModal] = useState<boolean>(false);
    const [accessModal, setAccessModal] = useState<boolean>(false);
    const [inviteModal, setInviteModal] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const socket = useContext(SocketContext);


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
            .then((data) => {
                const message = data.target + " left the channel";
                socket?.emit("message", { target: currentChannel.name, message: message });
                setError("");
                setLeaveModal(false);
                onClose();
                window.location.assign('/chat/channels');
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
        <div>
            <Modal show={settingsModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        <strong>{currentChannel.name}</strong>'s settings
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59"
                        onClick={() => setLeaveModal(true)}
                    >
                        Leave channel
                    </button>
                    {me.admin &&
                        <button className="button-59"
                            onClick={() => setInviteModal(true)}
                        >
                            Invite
                        </button>
                    }
                    {me.owner &&
                        <p>
                            <button className="button-59"
                                onClick={() => setAccessModal(true)}
                            >
                                Change access
                            </button>
                        </p>
                    }
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => onClose()}
                    >
                        Close
                    </button>
                </ModalFooter>
            </Modal>
            <Modal show={leaveModal}
                onHide={() => setLeaveModal(false)}
                style={{ color: "black" }}>
                <ModalHeader>
                    <ModalTitle>
                        Do you really want to leave <strong>{currentChannel.name}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59"
                        onClick={handleLeave}
                    >
                        Yes
                    </button>
                    <button className="button-59"
                        onClick={() => {
                            setLeaveModal(false);
                            setError("");
                        }}
                    >
                        No
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
            </Modal>
            {socket &&
                <Invite currentChannel={currentChannel}
                    inviteModal={inviteModal}
                    socket={socket}
                    onClose={() => setInviteModal(false)}
                />
            }
            {socket &&
                <Access currentChannel={currentChannel}
                    accessModal={accessModal}
                    socket={socket}
                    onClose={() => setAccessModal(false)}
                />
            }
        </div>
    );
}

export default Settings;
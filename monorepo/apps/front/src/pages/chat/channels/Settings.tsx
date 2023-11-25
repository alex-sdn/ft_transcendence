import React, { useContext, useState } from "react";
import { user } from './Channel.tsx';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

import SocketContext from "../../../Socket.js";
import Access from "./Access.tsx";
import { channel } from "../../../layouts/ChannelsLayout.tsx";
import Invite from "./Invite.tsx";
import Leave from "./Leave.tsx";

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
    const socket = useContext(SocketContext);

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
                    <p>
                        <button className="button-59"
                            onClick={() => setLeaveModal(true)}
                        >
                            Leave channel
                        </button>
                    </p>
                    <p className="action-buttons">
                        {me.admin &&
                            currentChannel.access === 'private' &&
                            <button className="button-59"
                                onClick={() => setInviteModal(true)}
                            >
                                Invite
                            </button>
                        }
                        {me.owner &&
                            <button className="button-59"
                                onClick={() => setAccessModal(true)}
                            >
                                Change access
                            </button>
                        }
                    </p>
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => onClose()}
                    >
                        Close
                    </button>
                </ModalFooter>
            </Modal>
            {socket &&
                <Leave currentChannel={currentChannel}
                    leaveModal={leaveModal}
                    socket={socket}
                    onClose={() => setLeaveModal(false)}
                />
            }
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
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import { user } from './Channel.tsx';

import Mute from './Mute.tsx';
import Kick from './Kick.tsx';
import Ban from './Ban.tsx';
import Admin from "./Admin.tsx";

interface channelUsersProps {
    members: user[];
    me: user;
}

const ChannelUsers: React.FC<channelUsersProps> = ({ members, me }) => {
    const { channelName } = useParams<{ channelName: string }>();
    const [selectedMember, setSelectedMember] = useState<user | null>(null);
    // Modals:
    const [profileModal, setProfileModal] = useState<boolean>(false);
    const [muteModal, setMuteModal] = useState<boolean>(false);
    const [kickModal, setKickModal] = useState<boolean>(false);
    const [banModal, setBanModal] = useState<boolean>(false);
    const [adminModal, setAdminModal] = useState<boolean>(false);

    return (
        <div className="members">
            <div className="members-list">
                <ul>
                    {members.map((member, index) => (
                        <li key={index}>
                            <button className="button-59"
                                onClick={() => {
                                    setSelectedMember(member);
                                    setProfileModal(true);
                                }}>
                                {member.name}
                                {member.owner &&
                                    <span className="material-symbols-outlined">
                                        family_star
                                    </span>
                                }
                                {member.admin && !member.owner &&
                                    <span className="material-symbols-outlined">
                                        kid_star
                                    </span>
                                }
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal show={profileModal}
                onHide={() => setProfileModal(false)}
                style={{ color: "black" }}
                size="lg"
                className="text-center"
            >
                {selectedMember &&
                    <ModalHeader className="justify-content-center">
                        <ModalTitle className="text-center">
                            {selectedMember.name}
                            {selectedMember.owner &&
                                <span className="material-symbols-outlined">
                                    family_star
                                </span>
                            }
                            {selectedMember.admin && !selectedMember.owner &&
                                <span className="material-symbols-outlined">
                                    kid_star
                                </span>
                            }
                        </ModalTitle>
                    </ModalHeader>
                }
                {selectedMember && me &&
                    <ModalBody>
                        <p>
                            <button className="button-59">Let's play!</button>
                        </p>
                        {me.admin && (
                            <div>
                                <p>
                                    <button onClick={() => setMuteModal(true)}
                                        className="button-59">
                                        Mute
                                    </button>
                                    <button onClick={() => setKickModal(true)}
                                        className="button-59">
                                        Kick
                                    </button>
                                    <button onClick={() => setBanModal(true)}
                                        className="button-59">
                                        Ban
                                    </button>
                                </p>
                                <p>
                                    <button onClick={() => setAdminModal(true)}
                                        className="button-59">
                                        Give admin rights
                                    </button>
                                </p>
                            </div>
                        )}
                    </ModalBody>
                }
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => setProfileModal(false)}
                    >
                        Close
                    </button>
                </ModalFooter>
            </Modal>
            {selectedMember &&
                <Mute selectedMember={selectedMember}
                    selectedChannel={channelName}
                    muteModal={muteModal}
                    onClose={() => setMuteModal(false)}
                />
            }
            {selectedMember &&
                <Kick selectedMember={selectedMember}
                    selectedChannel={channelName}
                    kickModal={kickModal}
                    onClose={() => setKickModal(false)}
                />
            }
            {selectedMember &&
                <Ban selectedMember={selectedMember}
                    selectedChannel={channelName}
                    banModal={banModal}
                    onClose={() => setBanModal(false)}
                />
            }
            {selectedMember &&
                <Admin selectedMember={selectedMember}
                    selectedChannel={channelName}
                    adminModal={adminModal}
                    onClose={() => setAdminModal(false)}
                />
            }
        </div>
    )
}

export default ChannelUsers;
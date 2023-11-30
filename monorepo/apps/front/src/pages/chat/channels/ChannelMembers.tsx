import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import Cookies from "js-cookie";

import { user } from './Channel.tsx';
import { channel } from "../../../layouts/ChannelsLayout.tsx";

import Mute from './Mute.tsx';
import Kick from './Kick.tsx';
import Ban from './Ban.tsx';
import Admin from "./Admin.tsx";
import axios from "axios";
import Block from "../friend/Block.tsx";

interface channelUsersProps {
    me: user;
    members: user[];
    currentChannel: channel;
}

const ChannelUsers: React.FC<channelUsersProps> = ({ me, members, currentChannel }) => {
    const jwtToken = Cookies.get('jwt-token');
    const [selectedMember, setSelectedMember] = useState<user | null>(null);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    // Modals:
    const [profileModal, setProfileModal] = useState<boolean>(false);
    const [muteModal, setMuteModal] = useState<boolean>(false);
    const [kickModal, setKickModal] = useState<boolean>(false);
    const [banModal, setBanModal] = useState<boolean>(false);
    const [adminModal, setAdminModal] = useState<boolean>(false);
    const [blockModal, setBlockModal] = useState<boolean>(false);

    useEffect(() => {
        const getBlocked = async () => {
            if (selectedMember) {
                const response = await axios.get(`/api/user/block/${selectedMember.id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                })
                if (response.status === 200) {
                    setIsBlocked(response.data);
                }
            }
        }
        getBlocked();
    }, [blockModal, selectedMember]);

    return (
        <div>
            <div className="members-list">
                <ul>
                    {members.map((member, index) => (
                        <li key={index}>
                            <button className="button-59"
                                onClick={() => {
                                    setSelectedMember(member);
                                    setProfileModal(true);
                                }}>
                                <span className="members-list-name">
                                    {member.name}
                                </span>
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
                            {selectedMember.name} {/* remplacer le nom du user par un lien vers son profile */}
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
                        {!isBlocked &&
                            <p>
                                <button onClick={() => {
                                    setBlockModal(true);
                                }}
                                    className="button-59">
                                    Block
                                </button>
                            </p>
                        }
                        {isBlocked &&
                            <p>
                                <button onClick={() => setBlockModal(true)}
                                    className="button-59">
                                    Unblock
                                </button>
                            </p>
                        }
                        {me.admin && (
                            <div>
                                <p className="action-buttons">
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
                                {me.owner && selectedMember &&
                                    <p>
                                        <button onClick={() => setAdminModal(true)}
                                            className="button-59">
                                            Give admin rights
                                        </button>
                                    </p>
                                }
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
                    selectedChannel={currentChannel.name}
                    muteModal={muteModal}
                    onClose={() => setMuteModal(false)}
                />
            }
            {selectedMember &&
                <Kick selectedMember={selectedMember}
                    selectedChannel={currentChannel.name}
                    kickModal={kickModal}
                    onClose={() => setKickModal(false)}
                />
            }
            {selectedMember &&
                <Ban selectedMember={selectedMember}
                    selectedChannel={currentChannel.name}
                    banModal={banModal}
                    onClose={() => setBanModal(false)}
                />
            }
            {selectedMember &&
                <Block id={selectedMember.id}
                    nickname={selectedMember.name}
                    isBlocked={isBlocked}
                    isChannel={true}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                />
            }
            {me.owner && selectedMember &&
                <Admin selectedMember={selectedMember}
                    selectedChannel={currentChannel.name}
                    adminModal={adminModal}
                    onClose={() => setAdminModal(false)}
                />
            }
        </div>
    )
}

export default ChannelUsers;
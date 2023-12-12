import React, { useContext, useEffect, useState } from "react";
import { Col, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";

import { user } from './Channel.tsx';
import { channel } from "../../../layouts/ChannelsLayout.tsx";

import Mute from './Mute.tsx';
import Kick from './Kick.tsx';
import Ban from './Ban.tsx';
import Admin from "./Admin.tsx";
import axios from "axios";
import Block from "../friend/Block.tsx";
import { Color } from "p5";

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
    const [error, setError] = useState<string>("");
    const socket = useContext(SocketContext);

    useEffect(() => {
        const getBlocked = async () => {
            if (selectedMember) {
                try {
                    const response = await axios.get(`/api/user/block/${selectedMember.id}`, {
                        headers: {
                            'Authorization': 'Bearer ' + jwtToken,
                        },
                    })
                    if (response.status === 200) {
                        setIsBlocked(response.data);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        getBlocked();
    }, [blockModal, selectedMember]);

    const inviteGame = async (event: React.FormEvent) => {
        event.preventDefault();
        if (socket && selectedMember) {
            socket.emit("inviteGame", { sender: me.name, target: selectedMember.name });
            socket.on("error", (data) => {
                setError(data.message);
            })
        }
    }

    useEffect(() => {
        if (error) {
            const timeoutId = setTimeout(() => {
                setError('');
            }, 3000); // Durée d'affichage en millisecondes (ici, 3 secondes)

            return () => clearTimeout(timeoutId);
        }
    }, [error]);

    const handleValidation = async () => {
        {
            if (selectedMember)
                return window.location.assign(`/profileUser/${selectedMember.id}`);
        }
    }

    return (
        <div>
            <div className="members-list">
                <p className="members">
                    <strong>
                        Members
                    </strong>
                </p>
                <p>
                    <strong>
                        You
                    </strong>
                </p>
                <button className="button-59">
                    <span className="members-list-name">
                        {me.name}
                    </span>
                    {me.owner &&
                        <span className="material-symbols-outlined">
                            family_star
                        </span>
                    }
                    {me.admin && !me.owner &&
                        <span className="material-symbols-outlined">
                            kid_star
                        </span>
                    }
                </button>
                <p>
                    <strong>
                        Other members
                    </strong>
                </p>
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
                            <button className="user-title" onClick={handleValidation}>{selectedMember.name}</button> {/* remplacer le nom du user par un lien vers son profile */}
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
                            <button className="button-59"
                                onClick={(e) => inviteGame(e)}
                            >
                                Let's play!
                            </button>
                        </p>
                        {error && <div className="text-danger">{error}</div>}
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
                    me={me.name}
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
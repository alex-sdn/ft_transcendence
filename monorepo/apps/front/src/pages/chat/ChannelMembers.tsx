import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";

import Mute from './Mute.tsx'
// import Ban from './Ban.tsx'
// import Kick from './Kick.tsx'

export interface user {
    name: string;
    owner: boolean;
    admin: boolean;
    avatar: string;
}

const ChannelUsers: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const { channelName } = useParams<{ channelName: string }>();
    const [profileModal, setProfileModal] = useState<boolean>(false);
    const [muteModal, setMuteModal] = useState<boolean>(false);
    const [allMembers, setAllMembers] = useState<user[]>([]);
    const [me, setMe] = useState<user>();
    const [selectedMember, setSelectedMember] = useState<user | null>(null);
    const [picture, setPicture] = useState<File>();

    useEffect(() => {
        const getChannelMembers = async () => {
            const membersResponse = await axios.get(`/api/chat/${channelName}/members`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            const meResponse = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (membersResponse.status === 200 && meResponse.status === 200) {
                const currentUserName = meResponse.data.nickname;

                if (Array.isArray(membersResponse.data)) {
                    const members: user[] = membersResponse.data.map((member: any) => ({
                        name: member.user.nickname,
                        owner: member.owner,
                        admin: member.admin,
                        avatar: member.user.avatar,
                    }))
                    const currentUser = members.find((member) => member.name === currentUserName);
                    setMe(currentUser);

                    const otherUsers = members.filter((member) => member.name !== currentUserName);
                    setAllMembers(otherUsers);
                }
            }
        }
        getChannelMembers();
    }, [channelName, me, jwtToken]); // fonction appelee chaque fois que les elements entre [] changent

    const fetchPicture = () => {
        if (selectedMember) {
            const blob = new Blob([selectedMember.avatar], { type: 'image/*' });
            const file = new File([blob], `${selectedMember.avatar}_avatar`);
            console.log(file);
            setPicture(file);
        }
    }

    return (
        <div className="members">
            <div className="members-list">
                <ul>
                    {allMembers.map((member, index) => (
                        <li key={index}>
                            <button className="button-59"
                                onClick={() => {
                                    setSelectedMember(member);
                                    // fetchPicture();
                                    setProfileModal(true);
                                    console.log(picture)
                                }}>
                                {member.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal show={profileModal}
                onHide={() => setProfileModal(false)}
                style={{ color: "black" }}
                size="lg"
            >
                <ModalHeader closeButton>

                </ModalHeader>
                {selectedMember && me && (
                    <ModalBody className="text-center">
                        {picture && <p><img src={URL.createObjectURL(picture)} /></p>}
                        <p>{selectedMember.name}</p>
                        <p>
                            <button className="button-59">Let's play!</button>
                        </p>
                        {me.admin && me.owner &&
                            <p>
                                <button onClick={() => setMuteModal(true)}
                                    className="button-59">Mute</button>
                                <button className="button-59">Kick</button>
                                <button className="button-59">Ban</button>
                            </p>}
                        {selectedMember.admin &&
                            <p>
                                <button className="button-59">Give admin rights</button>
                            </p>
                        }
                    </ModalBody>
                )}
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => setProfileModal(false)}
                    >
                        Close
                    </button>
                </ModalFooter>
            </Modal>
            {selectedMember && (
                <Mute selectedMember={selectedMember}
                    muteModal={muteModal}
                    onClose={() => setMuteModal(false)}
                />
            )}
        </div>
    )
}

export default ChannelUsers;
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";
import { user } from './ChannelMembers.tsx'
import TimePicker from "react-time-picker";

interface muteModalProps {
    selectedMember: user | null;
    muteModal: boolean;
    onClose: () => void;
}

const Mute: React.FC<muteModalProps> = ({ selectedMember, muteModal, onClose }) => {
    const [time, setTime] = useState('00:00');

    return (
        <div>
            <Modal show={muteModal}
                onHide={() => onClose}
                style={{ color: "black" }}
            >
                <ModalHeader>
                    <ModalTitle>
                        For how long do you want you mute {selectedMember?.name}?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <TimePicker onChange={() => setTime(time)}
                        value={time}
                    />
                </ModalBody>
                <ModalFooter>
                    <button className="button-59" onClick={onClose}>Close</button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Mute;
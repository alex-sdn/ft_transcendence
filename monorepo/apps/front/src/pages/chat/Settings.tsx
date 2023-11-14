import React from "react";
import { user } from './Channel.tsx';
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

interface settingsProps {
    me: user;
    channelName: string;
    settingsModal: boolean;
    onClose: () => void;
}

const Settings: React.FC<settingsProps> = ({ me, channelName, settingsModal, onClose }) => {
    return (
        <div>
            <Modal show={settingsModal}
                onHide={() => onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        <strong>{channelName}</strong>'s seetings
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <button className="button-59">Leave channel</button>
                    {me.owner &&
                        <p>
                            <button className="button-59">Change password</button>
                            <button className="button-59">Change access</button>
                        </p>
                    }
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Settings;
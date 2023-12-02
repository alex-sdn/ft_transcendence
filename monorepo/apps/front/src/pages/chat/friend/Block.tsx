import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

interface blockProps {
    nickname: string,
    isBlocked: boolean,
    isChannel: boolean,
    blockModal: boolean,
    onClose: () => void;
}

const Block: React.FC<blockProps> = ({
    nickname,
    isBlocked,
    isChannel,
    blockModal,
    onClose
}) => {
    const [error, setError] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');

    const blockUser = async () => {
        let response;
        if (!isBlocked) {
            response = await axios.post(`/api/user/block/${nickname}`, { nickname: nickname }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken,
                },
            });
            if (response.status === 201) {
                setError("");
                onClose();
                if (!isChannel)
                    window.location.assign('/chat/@me');
            }
        }
        else {
            response = await axios.delete(`/api/user/block/${nickname}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken,
                },
                data: {
                    nickname: nickname,
                },
            });
            if (response.status === 200) {
                setError("");
                onClose();
            }
        }
    }

    return (
        <div>
            <Modal show={blockModal}
                onHide={onClose}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    {!isBlocked &&
                        <ModalTitle>
                            Do you want to block <strong>{nickname}</strong>?
                        </ModalTitle>
                    }
                    {isBlocked &&
                        <ModalTitle>
                            Do you want to unblock <strong>{nickname}</strong>?
                        </ModalTitle>
                    }
                </ModalHeader>
                <ModalBody>
                    {!isBlocked &&
                        <p>You wont be abble to see this user's messages anymore</p>
                    }
                    {isBlocked &&
                        <p>You will see this user's messages again</p>
                    }
                    <p className="action-buttons">
                        < button className="button-59"
                            onClick={blockUser}
                        >
                            Yes
                        </button>
                        <button className="button-59"
                            onClick={() => {
                                setError("");
                                onClose();
                            }}>
                            No
                        </button>
                    </p>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <button className="button-59"
                        onClick={() => {
                            setError("");
                            onClose();
                        }}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div >
    );
}

export default Block;
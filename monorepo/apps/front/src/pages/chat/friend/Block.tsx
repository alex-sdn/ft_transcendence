import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

interface blockProps {
    id: string,
    nickname: string,
    isBlocked: boolean,
    isChannel: boolean,
    blockModal: boolean,
    onClose: () => void;
}

const Block: React.FC<blockProps> = ({
    id,
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
            try {
                response = await axios.post(`/api/user/block/${id}`, { nickname: nickname }, {
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
            catch (error) {
                console.log(error);
            }
        }
        else {
            try {
                response = await axios.delete(`/api/user/block/${id}`, {
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
            catch (error) {
                console.log(error);
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
                        <p>You won't be able to see this user's messages anymore</p>
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
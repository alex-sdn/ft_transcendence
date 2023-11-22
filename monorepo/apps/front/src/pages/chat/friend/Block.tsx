import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "react-bootstrap";

interface blockProps {
    nickname: string,
    blockModal: boolean,
    onClose: () => void;
}

const Block: React.FC<blockProps> = ({
    nickname,
    blockModal,
    onClose
}) => {
    const [error, setError] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');

    const blockUser = async () => {
        const response = await axios.post(`/api/user/block/${nickname}`, { nickname: nickname }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken,
            },
        });
        if (response.status === 201) {
            setError("");
            onClose();
        }
        else {
            console.log("user already blocked")
            setError("User already blocked");
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
                    <ModalTitle>
                        Do you want to block <strong>{nickname}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <p>You wont be abble to see this user's messages anymore</p>
                    <p className="action-buttons">
                        <button className="button-59"
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
        </div>
    );
}

export default Block;
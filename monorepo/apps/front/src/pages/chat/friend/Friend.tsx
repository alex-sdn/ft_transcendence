import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useParams } from "react-router-dom";

const Friend: React.FC = () => {
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [blockModal, setBlockModal] = useState<boolean>(false);
    const { userName } = useParams<{ userName: string }>();

    return (
        <div className="channel">
            <div className="name-settings">
                <h2>{userName}</h2>
                <button className="material-symbols-outlined"
                    onClick={() => setBlockModal(true)}
                >
                    block
                </button>
            </div>
            <div id='chat' >
                <p>
                    <input type='text'
                        name='message'
                        placeholder='Send a message'
                        onChange={(e) => setMessage(e.target.value)} />
                </p>
                <p>
                    <button
                        className="material-symbols-outlined"
                        id='send-button'
                        type='submit'
                        value={message}
                        disabled={!message}
                    >
                        send
                    </button>
                </p>
            </div>
            <Modal show={blockModal}
                onHide={() => setBlockModal(false)}
                style={{ color: "black" }}
                className="text-center"
            >
                <ModalHeader>
                    <ModalTitle>
                        Do you want to block <strong>{userName}</strong>?
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <p>You wont be abble to see this user's messages anymore</p>
                    <button className="button-59"
                        onClick={() => {
                            setBlockModal(false);
                            setError("");
                        }}>
                        No
                    </button>
                    <button className="button-59"
                    // onClick={blockUser}
                    >
                        Yes
                    </button>
                    {error && <div className="text-danger">{error}</div>}
                </ModalBody>
            </Modal>
        </div>
    );
}

export default Friend;
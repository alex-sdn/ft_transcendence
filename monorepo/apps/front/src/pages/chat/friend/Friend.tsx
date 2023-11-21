import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Block from "./Block";

const Friend: React.FC = () => {
    const [message, setMessage] = useState<string>("");
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
            {/* <div id='chat' >
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
            </div> */}
            {userName &&
                <Block nickname={userName}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                />
            }
        </div>
    );
}

export default Friend;
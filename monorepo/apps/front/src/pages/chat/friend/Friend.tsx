import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Block from "./Block";
import axios from "axios";
import Cookies from "js-cookie";

const Friend: React.FC = () => {
    const [message, setMessage] = useState<string>("");
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [blockModal, setBlockModal] = useState<boolean>(false);
    // const { id } = useParams<{ id: string }>();
    const { userName } = useParams<{ userName: string }>();
    const jwtToken = Cookies.get('jwt-token');

    useEffect(() => {
        const getBlocked = async () => {
            const response = await axios.get(`/api/user/block/${userName}`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            })
            if (response.status === 200) {
                setIsBlocked(response.data);
            }
        }
        getBlocked()
    }, [userName, jwtToken])

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
                    isBlocked={isBlocked}
                    isChannel={false}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                />
            }
        </div>
    );
}

export default Friend;
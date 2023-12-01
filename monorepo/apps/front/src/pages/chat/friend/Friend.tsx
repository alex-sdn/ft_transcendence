import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Block from "./Block";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from '../../../Socket';
import PrivMessages from "./PrivMessages";
import Nickname from "../../Nickname";

const Friend: React.FC = () => {
    const [message, setMessage] = useState<string>("");
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [blockModal, setBlockModal] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("");
    const [eventData, setEventData] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');
    const { id } = useParams<{ id: string }>();
    const socket = useContext(SocketContext);

    useEffect(() => {
        const getUserName = async () => {
            const response = await axios.get(`/api/user/id/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            })
            if (response.status === 200) {
                setUserName(response.data.nickname);
                setEventData("");
            }
        }
        getUserName();
    }, [id, jwtToken, eventData]);

    useEffect(() => {
        const getBlocked = async () => {
            const response = await axios.get(`/api/user/block/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            })
            if (response.status === 200) {
                setIsBlocked(response.data);
            }
        }
        getBlocked();
    }, [id, jwtToken]);

    useEffect(() => {
        socket?.on("refresh", () => {
            setEventData("refresh");
        })
        return () => {
            socket?.off("refresh");
        };
    }, [id, socket]);

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
            {userName && id &&
                <Block id={id}
                    nickname={userName}
                    isBlocked={isBlocked}
                    isChannel={false}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                />
            }
            <div className='privmessages-container' >
                {userName &&
                    <PrivMessages sender={userName} />
                }
            </div>
        </div>
    );
}

export default Friend;
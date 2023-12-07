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
            try {
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
            catch (error) {
                console.log(error);
                window.location.assign('/chat/@me');
            }
        }
        getUserName();
    }, [id, jwtToken, eventData]);

    useEffect(() => {
        const getBlocked = async () => {
            try {
                const response = await axios.get(`/api/user/block/${id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                })
                if (response.status === 200) {
                    setIsBlocked(response.data);
                }
            }
            catch (error) {
                console.log(error);
                window.location.assign('/chat/@me');
            }
        }
        getBlocked();
    }, [id, jwtToken]);

    useEffect(() => {
        socket?.on("refresh", () => {
            setEventData("refresh");
        })

        socket?.on("block", (data) => {
            if (data.sender == id) {
                window.location.assign('/chat/@me');
            }
        })

        return () => {
            socket?.off("refresh");
            socket?.off("block");
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
                {userName &&
                    <PrivMessages sender={userName} />
                }
            </div>
            {userName && id &&
                <Block id={id}
                    nickname={userName}
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
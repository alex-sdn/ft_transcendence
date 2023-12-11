import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import SocketContext from '../Socket';

const FriendsLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [myFriends, setMyFriends] = useState<{ id: number, userName: string }[]>([]);
    const [eventData, setEventData] = useState<string>("");
    const socket = useContext(SocketContext);

    useEffect(() => {
        const getMyFriends = async () => {
            try {
                const response = await axios.get('/api/user/me/friend', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200) {
                    if (Array.isArray(response.data)) {
                        const friends = response.data.map((user) => ({
                            id: user.user2.id,
                            userName: user.user2.nickname
                        }));
                        setMyFriends(friends);
                        setEventData("");
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        getMyFriends();
    }, [jwtToken, eventData]);

    useEffect(() => {
        socket?.on("refresh", () => {
            setEventData("refresh");
        })
        return () => {
            socket?.off("refresh");
        };
    }, [socket]);

    return (
        <div>
            <div>
                <nav>
                    <ul>
                        {myFriends.map((user, index) => (
                            <li key={index}>
                                <NavLink to={`/chat/@me/${user.id}`}>{user.userName}</NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default FriendsLayout;
import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const FriendsLayout: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [myFriends, setMyFriends] = useState<string[]>([]);

    useEffect(() => {
        const getMyFriends = async () => {
            const response = await axios.get('/api/user/me/friend', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) {
                if (Array.isArray(response.data)) {
                    const friends = response.data.map((user) => user.user2.nickname);
                    setMyFriends(friends);
                }
            }
        }
        getMyFriends();
    }, [jwtToken]);

    return (
        <div>
            <div>
                <nav>
                    <ul>
                        {myFriends.map((userName, index) => (
                            <li key={index}>
                                {jwtToken ?
                                    <NavLink to={`/chat/@me/${userName}`}>{userName}</NavLink>
                                    :
                                    <NavLink to="/login">{userName}</NavLink>
                                }
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
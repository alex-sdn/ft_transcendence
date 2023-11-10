import React, { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useParams } from "react-router-dom";

interface users {
    name: string;
    avatar: File;
    owner: boolean;
    admin: boolean;
}
const ChannelUsers: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    console.log(jwtToken)
    const { channelName } = useParams<{ channelName: string }>();

    useEffect(() => {
        const getChannelMembers = async () => {
            const response = await axios.get(`api/chat/${channelName}/members`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) {
                console.log(response);
            }
        }
        getChannelMembers();
    }, []);

    return (
        <div>

        </div>
    )
}

export default ChannelUsers;
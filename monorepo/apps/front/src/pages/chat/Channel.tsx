import React, { useContext, useState } from 'react';
import SocketContext from '../../Socket';
import { useParams } from 'react-router-dom';

interface users {
    name: string;
    avatar: File;
    owner: boolean;
    admin: boolean;
}

interface me {
    owner: boolean;
    admin: boolean;
}

interface channel {
    members: users[];
}

const Channel: React.FC = () => {
    const [message, setMessage] = useState<string>("");
    const [users, setUsers] = useState("")
    const socket = useContext(SocketContext);

    const { channelName } = useParams<{ channelName: string }>();

    const handleMessageSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
        // socket?.emit("message", {target: selectedChannel.name, message:message});
    }



    return (
        <div className="channel">
            <h2>{channelName}</h2>
            <div id='chat' >
                <p>
                    <input type='text'
                        placeholder='Send a message'
                        onChange={(e) => setMessage(e.target.value)} />
                </p>
                <p>
                    <button
                        className="material-symbols-outlined"
                        id='send-button'
                        type='submit'
                        value={message}
                        disabled={!message} >
                        send
                    </button>
                </p>
            </div>
            <div id='users'>
                <ul>

                </ul>
            </div>
        </div>


    );
}

export default Channel;
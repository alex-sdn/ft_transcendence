import axios from "axios";
import React, { useContext, useState } from "react";
import { Form } from "react-router-dom";
import SocketContext from "../../Socket";

interface MyChannels {
    name: string;
}

const createChannel: React.FC = () => {
    const [channelName, setChannelName] = useState("");
    const [access, setAccess] = useState('public');
    const [password, setPassword] = useState("");
    const socket = useContext(SocketContext);

    const handleChannelSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (socket)
            socket.emit("create", { target: channelName, access: access, password: password });
        window.location.assign('/chat');
    }

    const handleChannelNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChannelName(event.target.value,);
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value,);
    }

    return (
        <div className="createChannel">
            <Form method="post" action="/create-channel" onSubmit={handleChannelSubmit}>
                <p>
                    <label>
                        Channel name:
                        <p>
                            <input type="text"
                                name="channel-name"
                                value={channelName}
                                onChange={handleChannelNameChange}
                                required />
                        </p>
                    </label>
                </p>
                <p>
                    <label>Access</label>
                    <select name="access"
                        id="access"
                        value={access}
                        onChange={(e) => setAccess(e.target.value)}>
                        <option value="public">public</option>
                        <option value="private">private</option>
                        <option value="protected">protected</option>
                    </select>
                </p>
                {access === 'protected' && (
                    <p>
                        <label>
                            Password
                            <input type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                minLength={8}
                                required />
                        </label>
                    </p>
                )}
                <p>
                    <button className="button-59" type="submit">Create channel</button>
                </p>
            </Form>
        </div>
    );
}

export default createChannel;
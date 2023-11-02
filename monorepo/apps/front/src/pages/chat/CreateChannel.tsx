import axios from "axios";
import React, { useState } from "react";
import { Form } from "react-router-dom";

const createChannel: React.FC = () => {
    //const [channelName, setChannelName] = useState();
    const [access, setAccess] = useState('public');

    return (
        <div className="createChannel">
            <Form method="post" action="/create-channel" /*onSubmit={}*/>
                <p>
                    <label>
                        Channel name:
                        <p>
                            <input type="text"
                                name="channel-name"
                                //value={newNickname.nickname}
                                //onChange={handleNicknameChange}
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
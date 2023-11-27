import React, { useState } from "react";
import Cookies from "js-cookie";
import { Form } from "react-router-dom";
import axios from "axios";

const Nickname: React.FC = () => {
    const [newNickname, setnewNickname] = useState({ nickname: '' });
    const [error, setError] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');

    const handleNicknameSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.patch('/api/user/me/editNickname',
                JSON.stringify(newNickname), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken,
                },
            });
            if (response.status === 200) {
                window.location.assign("/profile_picture"); //check si first time logged
                // return window.location.reload();
            }
        } catch (error) {
            setError((error as any).response.data.message);
        }
    };

    const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setnewNickname({
            ...newNickname,
            nickname: event.target.value,
        });
    };

    return (
        <div>
            <Form method="post" action="/username" onSubmit={handleNicknameSubmit}>
                <label>
                    <p>
                        <span>Nickname:</span>
                    </p>
                    <p>
                        <input type="text"
                            name="nickname"
                            value={newNickname.nickname}
                            onChange={(e) => {
                                handleNicknameChange(e);
                                setError("")
                            }}
                            required />
                    </p>
                </label>
                {error &&
                    <p className="text-danger">
                        {error}
                    </p>
                }
                <p>
                    <button type="submit">Submit</button>
                </p>
            </Form>
        </div>
    );
}

export default Nickname;
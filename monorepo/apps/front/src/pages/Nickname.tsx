import React, { useState } from "react";
import Cookies from "js-cookie";
import { Form, useNavigate } from "react-router-dom";
import axios from "axios";

const Nickname: React.FC = () => {
    const [newNickname, setnewNickname] = useState({ nickname: '' });
    const jwtToken = Cookies.get('jwt-token');
    const navigate = useNavigate();

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
            console.log(response);
            if (response.status === 200) {
                //if 2fa === true => redirect 2fa
                return navigate('/profile_picture');
            } else {
                return { error: 'Nickname already taken' };
            }
        } catch (error) {
            console.error('Error during request:', error);
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
                            onChange={handleNicknameChange}
                            required />
                    </p>
                </label>
                <p>
                    <button type="submit">Submit</button>
                </p>
            </Form>
        </div>
    );
}

export default Nickname;
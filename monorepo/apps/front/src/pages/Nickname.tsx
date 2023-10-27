import React, { useState } from "react";
import { Form, redirect } from "react-router-dom";

const Nickname: React.FC = () => {
    const [newNickname, setnewNickname] = useState({ nickname: '' });

    const handleNicknameSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/user/me/editNickname', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': Bearer token,
                },
                body: JSON.stringify(newNickname),
            });
            if (response.ok) {
                //if 2fa === true => redirect 2fa
                return redirect('/profile_picture')
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
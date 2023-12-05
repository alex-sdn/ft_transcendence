import React, { useEffect, useState } from "react"
import Cookies from "js-cookie";
import { Form } from "react-router-dom";
import axios from "axios";

const FirstLog: React.FC = () => {
    const [newNickname, setnewNickname] = useState({ nickname: '' });
    const [image, setImage] = useState<File>();
    const [newImage, setNewImage] = useState<File>();
    const [errorNickname, setErrorNickname] = useState<string>("");
    const [errorImage, setErrorImage] = useState<string>("");
    const jwtToken = Cookies.get('jwt-token');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        let responseNickname, responseImage;
        try {
            responseNickname = await axios.patch('/api/user/me/editNickname',
                JSON.stringify(newNickname), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken,
                },
            });
        } catch (error) {
            setErrorNickname((error as any).response.data.message);
        }
        if (newImage && newImage.size > 100000)
            setErrorImage("File too large");
        else {
            try {
                if (newImage) {
                    const formData = new FormData();
                    formData.append("avatar", newImage);
                    responseImage = await axios.patch('/api/user/me/editAvatar', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': 'Bearer ' + jwtToken,
                        },
                    });
                }
            } catch (error) {
                setErrorImage((error as any).response.data.message);
            }
        }
        if ((!newImage && responseNickname?.status === 200) || (responseNickname?.status === 200 && responseImage?.status === 200))
            window.location.assign('/');
    };

    useEffect(() => {
        const fetchAvatar = async () => {
            let response = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            const fileName = response.data.avatar;

            response = await axios.get('/api/user/avatar/' + fileName, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
                responseType: 'arraybuffer',
            });
            if (response.status === 200) {
                const blob = new Blob([response.data]);
                const file = new File([blob], fileName);
                setImage(file);
            }
        };
        fetchAvatar();
    }, []);

    const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setnewNickname({
            ...newNickname,
            nickname: event.target.value,
        });
    };

    return (
        <Form className="first-log" method="post" action="username" onSubmit={handleSubmit}>
            <h2>Welcome to our Pong Game!</h2>
            <p>Set a nickname and choose a profile picture</p>
            <p className="first-log-nickname">
                {/* <p>
                    <label htmlFor="nickname">Nickname</label>
                </p> */}
                <input type="text"
                    name="nickname"
                    id="nickname"
                    value={newNickname.nickname}
                    pattern="[a-zA-Z0-9_\-]+"
                    title="Nickname can only contain letters, numbers, hyphens, and underscores."
                    placeholder="Choose a nickname"
                    onChange={(e) => {
                        handleNicknameChange(e);
                        setErrorNickname("");
                    }}
                    required
                />
            </p>
            {errorNickname &&
                <p className="text-danger">
                    {errorNickname}
                </p>
            }
            <div className='ProfilePicture first-log-picture'>
                {image && !newImage &&
                    <img src={URL.createObjectURL(image)}
                        alt='profile picture'
                    />
                }
                {newImage &&
                    <img src={URL.createObjectURL(newImage)}
                        alt='profile picture'
                    />
                }
                <p>
                    <input type="file"
                        accept='image/*'
                        onChange={(e) => {
                            setNewImage(e.target.files?.[0]);
                            setErrorImage("");
                        }}
                    />
                </p>
                {errorImage &&
                    <p className='text-danger'>
                        {errorImage}
                    </p>
                }
            </div>
            {/* <p className="first-log-nickname">
                <p>
                    <label htmlFor="nickname">Nickname</label>
                </p>
                <input type="text"
                    name="nickname"
                    id="nickname"
                    value={newNickname.nickname}
                    pattern="[a-zA-Z0-9_\-]+"
                    title="Nickname can only contain letters, numbers, hyphens, and underscores."
                    placeholder="Choose a nickname"
                    onChange={(e) => {
                        handleNicknameChange(e);
                        setErrorNickname("");
                    }}
                    required
                />
            </p>
            {errorNickname &&
                <p className="text-danger">
                    {errorNickname}
                </p>
            } */}
            <p>
                <button type="submit">Save changes</button>
            </p>
        </Form>
    );
}

export default FirstLog;
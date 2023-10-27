import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Form, useNavigate } from "react-router-dom"
import Cookies from "js-cookie";

const ProfilePicture: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [imageUploaded, setImageUploaded] = useState<File>();
    const [imageDisplayed, setImageDisplayed] = useState<string>();
    const navigate = useNavigate();

    const defaultAvatar = async () => {
        const res = await axios.get('/api/user/me', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
        },);
        console.log('on entre dans DefautAvatar', res.data.avatar.data, 'type : ', typeof res.data.avatar.data);
        const textDecoder = new TextDecoder('utf-8');
        const imageText = textDecoder.decode(res.data.avatar.data);
        console.log(imageText);
        return imageText;
    }

    useEffect(() => {
        const fetchDefaultAvatar = async () => {
            const avatarString = await defaultAvatar();
            setImageDisplayed(avatarString);
        };
        fetchDefaultAvatar();
    }, []);

    const selectImageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files?.[0]) {
            setImageDisplayed(URL.createObjectURL(event.target.files?.[0]));
        }
    };

    const changeImageHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        if (image) {
            const formData = new FormData();
            formData.append("avatar", image);
            try {
                const response = await axios.patch('/api/user/me/editAvatar', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                });
                if (response.status === 200)
                    navigate('/');
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className='ProfilePicture'>
            <h2>Choose a profile picture:</h2>
            {imageDisplayed ? (
                <img src={imageDisplayed} alt='profile picture' />
            ) : (
                <img src={defaultAvatar()} alt='default avatar' />
            )}
            <Form encType='multipart/form-data' onSubmit={changeImageHandler}>
                <p><input type="file" accept='image/*' onChange={selectImageHandler} /></p>
                <p><button type='submit'>Save changes</button></p>
            </Form>
        </div>
    );
}

export default ProfilePicture;
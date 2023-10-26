import React, { useState } from 'react'
import axios from 'axios'
import { Form, useNavigate } from "react-router-dom"
import DefaultProfilePicture from '../images/DefaultProfilePicture.jpg'

const ProfilePicture: React.FC = () => {
    const [image, setImage] = useState<string | undefined>(DefaultProfilePicture);
    const navigate = useNavigate();

    const selectImageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files?.[0]) {
            setImage(URL.createObjectURL(event.target.files?.[0]));
        }
    };

    const changeImageHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        if (image) {
            const formData = new FormData();
            formData.append("file", image);
        }
        try {
            const response = await axios.post('endpoint', FormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.ok)
                navigate('/');
        } catch (error) {
            //handle error here
        }
    };

    return (
        <div className='ProfilePicture'>
            <h2>Choose a profile picture:</h2>
            {image && <img src={image} alt='profile picture'/>}
            <Form encType='multipart/form-data' onSubmit={changeImageHandler}>
                <p><input type="file" accept='image/*' onChange={selectImageHandler} /></p>
                <p><button type='submit'>Save changes</button></p>
            </Form>
        </div>
    );
}

export default ProfilePicture;
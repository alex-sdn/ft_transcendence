import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom"
import DefaultProfilePicture from '../images/DefaultProfilePicture.jpg'

const ProfilePicture: React.FC = () => {
    const [image, setImage] = useState<string | undefined>(DefaultProfilePicture);
    const navigate = useNavigate();

    const imageSelectHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files?.[0];
        if (image) {
            const imageURL = URL.createObjectURL(image);
            setImage(imageURL);
        }
    };

    // const submitImageChange = (event: React.)

    return (
        <div className='ProfilePicture'>
            <h2>Choose a profile picture:</h2>
            {image && <img src={image} alt='profile picture'/>}
            <p><input type="file" accept='image/*' onChange={imageSelectHandler} /></p>
            {/* <p><button onClick={submitImageChange}>Change profile picture</button></p> */}
            <p><button onClick={() => navigate('/')}>Skip and play</button></p>
        </div>
    );
}

export default ProfilePicture;
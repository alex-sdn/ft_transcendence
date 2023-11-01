import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Form, Route, createRoutesFromElements, } from "react-router-dom"
import RootLayout from '../layouts/RootLayout';
import Cookies from "js-cookie";

const ProfilePicture: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [image, setImage] = useState<File>();
    // const navigate = useNavigate();

    useEffect(() => {
        const fetchDefaultAvatar = async () => {
            let response = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            const fileName = response.data.avatar;

            response = await axios.get('api/user/avatar/' + fileName, {
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
        fetchDefaultAvatar();
    }, []);

    const selectImageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files?.[0]) {
            setImage(event.target.files?.[0]);
        }
        //check size of the image
    };


        createRoutesFromElements(
          <Route path='/' element={<RootLayout />}>
          <Route path="profile_picture" element={<ProfilePicture/>} />
          </Route>
        )

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
                // if (response.status === 200)
                //     navigate('/');
                    if (response.status === 200)
                       window.location.assign('/profile');
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className='ProfilePicture'>
            <h2>Choose a profile picture:</h2>
            {image && <img src={URL.createObjectURL(image)} alt='profile picture' />}
            <Form encType='multipart/form-data' onSubmit={changeImageHandler}>
                <p><input type="file" accept='image/*' onChange={selectImageHandler} /></p>
                <p><button type='submit'>Save changes</button></p>
            </Form>
        </div>
    );
}

export default ProfilePicture;
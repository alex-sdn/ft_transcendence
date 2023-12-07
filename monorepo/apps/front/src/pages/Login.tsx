import React from 'react';
import Cookies from 'js-cookie'
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
	const loginFortyTwo: string = import.meta.env.VITE_FORTYTWOLOGIN;
    const navigate2 = useNavigate(); // FOR FAKELOGIN ONLY

    const authURL = "/api/auth?code=" + code;
    if (code) {
        fetch(authURL)
            .then(response => response.json()) // Ensure the response is treated as text
            .then(data => {
                // 'data' will be the string returned by the backend
                // rajouter token dans cookie
                if (data.has2fa) {
                    Cookies.set("jwt-2fa-token", data.access_token, { expires: 1 });
                    window.location.assign('/login2fa');
                    return;
                }
                Cookies.set("jwt-token", data.access_token, { expires: 1 });
                if (data.newUser) {
                    window.location.assign('/first-log');
                    return;
                }
                window.location.assign('/');
                // You can then set it in your component's state or use it as needed.
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    /**  FOR TESTING  **/
    const handleFakeLogin = async () => {
        try {
            const response = await axios.get('/api/auth/fakelogin');
            const data = response.data;
            // set cookie
            Cookies.set("jwt-token", data.access_token, { expires: 1 });
            if (data.newUser) {
                window.location.assign('/first-log');
                return;
                // return navigate2('/nickname')
            }
            else {
                window.location.assign('/');
                return;
                // return navigate2('/'); // Use navigate here
            }
        } catch (error) {
            console.error('ERRORFAKE:', error);
        }
    }
    /*******************/

    return (
        <div>
            <h2 className='login'>
                <a href={loginFortyTwo}>Login with 42</a>
            </h2>
            <button onClick={handleFakeLogin}>Fake Login</button>
        </div>
    );
}

export default Login;
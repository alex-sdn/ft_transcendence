import React from 'react';
import Cookies from 'js-cookie'
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const navigate2 = useNavigate(); // FOR FAKELOGIN ONLY

    const authURL = "/api/auth?code=" + code;
    const navigate = useNavigate();
    if (code) {
        fetch(authURL)
            .then(response => response.json()) // Ensure the response is treated as text
            .then(data => {
                // 'data' will be the string returned by the backend
                // rajouter token dans cookie
                Cookies.set("jwt-token", data.access_token, { expires: 1 });
                if (data.newUser)
                    return navigate('/nickname');
                else if (data.has2fa)
                    return navigate('/login2fa');
                return navigate('/');
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
            if (data.newUser)
                return navigate2('/nickname')
            else
                return navigate2('/'); // Use navigate here
        } catch (error) {
            console.error('ERRORFAKE:', error);
        }
    }
    /*******************/

    return (
        <div>
            <h2 className='login'>
                <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1b7f717c58b58406ad4b2abe9145475069d66ace504146041932a899c47ff960&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code">Login with 42</a>
            </h2>
            <button onClick={handleFakeLogin}>Fake Login</button>
        </div>
    );
}

export default Login;
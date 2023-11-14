import Cookies from 'js-cookie';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [status, setStatus] = useState<number>();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
	const navigate2 = useNavigate(); // FOR FAKELOGIN ONLY

    useEffect(() => {
        const fetchLogged = async () => {
            let response = await axios.get('/api/user/me', {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            setStatus(response.status);
        }
        fetchLogged();
    }, []);

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

    if (code) {
        const authURL = "/api/auth?code=" + code;
        const navigate = useNavigate();
        fetch(authURL)
            .then(response => response.json()) // Ensure the response is treated as text
            .then(data => {
                // 'data' will be the string returned by the backend
                // add the token in the Cookies
                Cookies.set("jwt-token", data.access_token, { expires: 1 });
                if (data.newUser)
                    return navigate('/nickname');
                else if (data.has2fa)
                    return navigate('/game');
                return navigate('/');
                // You can then set it in your component's state or use it as needed.
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <div>
            {(status === 200) ? <h2>Home</h2> :
                <h2 className='login'>
                    <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1b7f717c58b58406ad4b2abe9145475069d66ace504146041932a899c47ff960&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code">Login with 42</a>
                </h2>
                <button onClick={handleFakeLogin}>Fake Login</button>
            }
        </div>
    );
}

export default Home;
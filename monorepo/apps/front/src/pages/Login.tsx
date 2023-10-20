import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const authURL = "/api/auth?code=" + code;
    const navigate = useNavigate();
    fetch(authURL)
        .then(response => response.text()) // Ensure the response is treated as text
        .then(data => {
            // 'data' will be the string returned by the backend
            if (data === 'notfound') 
                return navigate('/game');
            console.log(data);
            // You can then set it in your component's state or use it as needed.
        })
        .catch(error => {
            console.error('Error:', error);
        });

    return (
        <h2>Login</h2>
    );
}

export default Login;
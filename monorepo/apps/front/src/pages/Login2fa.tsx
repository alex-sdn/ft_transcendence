import React, { useState } from 'react';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

const Login2fa: React.FC = () => {

    const jwtToken = Cookies.get('jwt-token');
    console.log('TOKEN == ' + jwtToken);
    const navigate = useNavigate();
    const [inputCode, setInputCode] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputCode(e.target.value);
        console.log('INPUTCODE =>>>' + inputCode);
      }
      const handleValidation = () => {
        login2fareq(inputCode);
      }
  
      const login2fareq = async (code: string) => {
        console.log('??????? CODE ?????? ===>>> ' + code);

        const responsesecret = await axios.post('/api/auth/signin/2fa', { code : code},
        {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          
             if (responsesecret.status === 201) {
              console.log('2FA successful'); 
              Cookies.set("jwt-token", responsesecret.data, { expires: 1 });
              return navigate('/');
             }
            else {
              console.log('2fa FAILED')}}

              
    return (
        <div>
        <input type='text' name='code' id='code' value={inputCode} onChange={handleChange} placeholder='Enter OTP'/>
        <button className='button-29' onClick={handleValidation}>ok</button>    
        </div>
    )
}

export default Login2fa;
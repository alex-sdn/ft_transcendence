import React, { useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'

const Login2fa: React.FC = () => {

  const jwtToken = Cookies.get('jwt-2fa-token');
  console.log('TOKEN == ' + jwtToken);
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

    try {
      const responsesecret = await axios.post('/api/auth/signin/2fa', { code: code },
        {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

      if (responsesecret.status === 201) {
        console.log('2FA successful');
        Cookies.remove('jwt-2fa-token');
        Cookies.set("jwt-token", responsesecret.data, { expires: 1 });
        window.location.assign('/');
        return;
      }
    }
    catch {
      console.log('2fa FAILED')
    }
  }


  return (

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>OTP Needed from your authentifier</div><br />
      <input type='text' name='code' id='code' value={inputCode} onChange={handleChange} placeholder='Enter OTP' />
      <button className='button-29' onClick={handleValidation}>ok</button>
    </div>
  )
}

export default Login2fa;

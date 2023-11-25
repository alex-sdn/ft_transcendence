import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'

const Twofa: React.FC = () => {

    const jwtToken = Cookies.get('jwt-token');
    const [stringTwofa, setStringTwofa] = useState<string>('');
    const [inputCode, setInputCode] = useState<string>('');

    useEffect(() => {
        const ac2fa = async () => {
            const response = await axios.post(
              '/api/user/me/edit2fa', 
              {}, 
              {
                headers: {
                  'Authorization': 'Bearer ' + jwtToken,
                },
              }
            );
            if (response.status === 201) {
              const resp2fa = response.data;
              setStringTwofa(resp2fa);
            }
        };
        ac2fa(); 
      }, []);
  

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputCode(e.target.value);
      }
      const handleValidation = () => {
        ac2fabutton();
      }

      const ac2fabutton = async () => {
          const responsesecret = await axios.post(
              '/api/user/me/activate2fa', {code: inputCode},
             {headers : {
                 'Authorization' : 'Bearer ' + jwtToken,
                 'Content-Type': 'application/json',
             },});
             if (responsesecret.status === 201) {
              console.log('\n ******** 2FA post successful');
              window.location.reload();
             }
            else {
              console.log('2fa post FAILED')}}
    return (
        <div>
        <img src={stringTwofa} alt="QR code" />
        <input type='text' name='code' id='code' value={inputCode} onChange={handleChange} placeholder='Enter OTP'/>
        <button className='button-29' onClick={handleValidation}>ok</button>
        </div>
    )
}

export default Twofa;
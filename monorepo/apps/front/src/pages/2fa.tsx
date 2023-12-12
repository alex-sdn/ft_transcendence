import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'

const Twofa: React.FC = () => {

  const jwtToken = Cookies.get('jwt-token');
  const [stringTwofa, setStringTwofa] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const ac2fa = async () => {
      try {
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
      }
      catch (error) { console.log(error); }
    };
    ac2fa();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCode(e.target.value);
    setError("");
  }
  const handleValidation = () => {
    ac2fabutton();
  }

  const ac2fabutton = async () => {
    try {
      const responsesecret = await axios.post(
        '/api/user/me/activate2fa', { code: inputCode },
        {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json',
          },
        });
      if (responsesecret.status === 201) {
        setError("");
        window.location.reload();
      }
    }
    catch (error) {
      console.log(error.response.data.message);
      setError(error.response.data.message);
    }
  }

  return (
    <div>
      <p className="twofa-center">
        <img src={stringTwofa} alt="QR code" />
      </p>
      <p className="twofa-center">
        <input type='text' name='code' id='code' value={inputCode} onChange={handleChange} placeholder='Enter OTP' />
        <button className='button-29' onClick={handleValidation}>ok</button>
      </p>
      {error && <div className="text-danger twofa-center">{error}</div>}
    </div>
  )
}

export default Twofa;
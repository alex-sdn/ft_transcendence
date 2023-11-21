import React, { useState } from 'react';
// import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const SearchNick: React.FC = () => {

    // const jwtToken = Cookies.get('jwt-token');
    const [inputNick, setInputCode] = useState<string>('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputCode(e.target.value);
        console.log(inputNick);
      }
      const handleValidation = () => {
        console.log('INPUTNICK = ' + inputNick);
        return navigate(`/profileUser/${inputNick}`);
      }

    return (
        <div>
        <input type='text' name='code' id='code' value={inputNick} onChange={handleChange} placeholder='Research'/>
        <button className='button-29' onClick={handleValidation}>ok</button>
        </div>
    )
}

export default SearchNick;

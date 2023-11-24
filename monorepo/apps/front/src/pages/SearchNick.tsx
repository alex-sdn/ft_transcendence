import React, { useState } from 'react';
import axios from 'axios'
import Cookies from "js-cookie";
// import { NavLink} from "react-router-dom";
import { useNavigate} from "react-router-dom";

const SearchNick: React.FC = () => {

    // const jwtToken = Cookies.get('jwt-token');
    const [inputNick, setInputCode] = useState<string>('');
    const [id, setId] = useState<number>();
    const navigate = useNavigate();
    const jwtToken = Cookies.get('jwt-token');
    var ID : string;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputCode(e.target.value);
        console.log(inputNick);
      }
      
        const getProfileData = async () => {
          console.log('inputnick validation = ', inputNick);
          const response = await axios.get(`/api/user/${inputNick}`, {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
          },);
          if (response.status === 200) {
            console.log("************304************");
            console.log(response.data.id);
            // setId(response.data.id);
            ID = response.data.id.toString();
            console.log('ID ========= ' + ID);
          }
          else 
          {console.log("**********else*************")}
        }
      const handleValidation = async () => {

        // <NavLink to={/ProfileUser/${inputNick}}>aller vers</NavLink>
        await getProfileData();
                console.log('test ========= ' + `/profileUser/${ID}`);
        
        return navigate(`/profileUser/${ID}`);
      }

    return (
        <div>
        <input type='text' name='code' id='code' value={inputNick} onChange={handleChange} placeholder='Research'/>
        <button className='button-29' onClick={handleValidation}>ok</button>
        {/* <NavLink to={`/ProfileUser/${inputNick}`}>aller vers</NavLink> */}
        </div>
    )
}

export default SearchNick;

import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Cookies from "js-cookie";
// import { NavLink} from "react-router-dom";
import { useNavigate} from "react-router-dom";

const SearchNick: React.FC = () => {

    // const jwtToken = Cookies.get('jwt-token');
    const [inputNick, setInputCode] = useState<string>('');
    const [user, setUser] = useState<any[]>([]);
    const [myid, setMyId] = useState<number>();
    // const [id, setId] = useState<number>();
    const navigate = useNavigate();
    const jwtToken = Cookies.get('jwt-token');
    var ID : string;

    useEffect(() => {
      const getProfileData = async () => {
        console.log('token = ', jwtToken);
        const response = await axios.get('/api/user/me', {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        },);
        if (response.status === 200) {
          const resp_profile = response.data;
          setMyId(resp_profile.id);
        }
      }
      getProfileData();
    },);

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
            ID = response.data.id.toString();
          }
          else 
          {console.log("Error")}
        }

      const handleValidation = async () => {
        await getProfileData();
        console.log("ID = " + ID + "myid = " + myid);
        if (ID === myid?.toString())
          { return window.location.assign('/profile');}
        else 
         {return window.location.assign(`/profileUser/${ID}`);}
      }

    const getuser = async (value: string) => {
      await axios.get('/api/user/all', {
          headers: {
              'Authorization': 'Bearer ' + jwtToken,
          },
      },)
          .then((response) => {
              const results = response.data.filter((user: any) => {
                  return (value && user && user.nickname && user.nickname.toLowerCase().includes(value.toLowerCase()));
              })
              setUser(results);
              console.log(results);
          })
          .catch((error) => console.log(error));
  }

    return (
        <div>
        <input type='text' name='code' id='code' value={inputNick} onChange={(e) => {setInputCode(e.target.value); getuser(e.target.value)}} placeholder='Research'/>
        <button className='button-29' onClick={handleValidation}>ok</button>
        <ul className="searchResultsUser">
                {user && user.map((element, index) => <li 
                onClick={() => {
                    setInputCode(element.nickname);
                    // setErrorName("");
                }} 
                key={index}>{element.nickname}</li>)}
            </ul>
        </div>
    )
}

export default SearchNick;

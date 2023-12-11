import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Cookies from "js-cookie";

const SearchNick: React.FC = () => {

    const [inputNick, setInputCode] = useState<string>('');
    const [user, setUser] = useState<any[]>([]);
    const [myid, setMyId] = useState<number>();
    const [showPopup, setShowPopup] = useState(false);
    const jwtToken = Cookies.get('jwt-token');
    var ID : string;

    useEffect(() => {
      const getProfileData = async () => {
        try{
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
        catch (error)
            {console.log(error);}
      }
      getProfileData();
    },);
      
        const getProfileData = async () => {
          try {
              const response = await axios.get(`/api/user/${inputNick}`, {
                headers: {
                  'Authorization': 'Bearer ' + jwtToken,
                },
              },);
              if (response.status === 200) {
                ID = response.data.id.toString();
              }
          }
          catch (error)
          {console.log(error);}
        }

      const handleValidation = async () => {
        await getProfileData();
        if (ID === myid?.toString())
          { return window.location.assign('/profile');}
        else if ( ID === undefined)
          { setShowPopup(true);
            return;}
        else 
         {return window.location.assign(`/profileUser/${ID}`);}
      }


      setTimeout(() => {
        setShowPopup(false);
    }, 4000);

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
        {showPopup && 
                                ( <span className='popup'> &nbsp;User Not Found</span> )
                                }
        <ul className="searchResultsUser">
                {user && user.map((element, index) => <li 
                onClick={() => {
                    setInputCode(element.nickname);
                }} 
                key={index}>{element.nickname}</li>)}
            </ul>
        </div>
    )
}

export default SearchNick;
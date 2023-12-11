import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
// import ProfileFriends from './Profilefriends';
// import ProfileUser from './ProfileUser';

const ProfileList: React.FC = () => {

  const jwtToken = Cookies.get('jwt-token');
  const [lists, setLists] = useState<any[]>([]);

    
  useEffect(() => {
      const getLists = async () => {
        try {
            const response = await axios.get('/api/user/me/friend', {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
        },);
        if (response.status === 200) {
            const resp_lists= response.data;
            setLists(resp_lists);
            console.log(resp_lists);
            }}
         catch (error)
            {console.log(error);}
      }
      getLists();
    }, []);
  const handleValidation = async (ID : string) => {
     {return window.location.assign(`/profileUser/${ID}`);}
  }

  return (
      <div>
          <div className='_h1' style={{ textAlign: 'center' }}>Friends</div>
          <div className='_info'>
              {lists.length > 0 ?
                <ul>
                    {lists.map((list, index) =>
                        <li key ={index + 1}>
                          <button onClick={() => handleValidation(list.user2.id)}>{list.user2.nickname}</button>
                        </li>
                    )}
                </ul>
                :
                <div>No Friends Here Yet 👀</div>
              }
          </div>
      </div>
  )
}

export default ProfileList;
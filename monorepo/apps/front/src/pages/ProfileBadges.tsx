import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
// import ProfileFriends from './Profilefriends';
// import ProfileUser from './ProfileUser';

const ProfileBadges: React.FC = () => {

  const jwtToken = Cookies.get('jwt-token');
  const [Badges, setBadges] = useState<any[]>([]);

    
  useEffect(() => {
      const getBadges = async () => {
        try {
            const response = await axios.get('/api/user/me/achievements', {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
        },);
        if (response.status === 200) {
            const resp_Badges= response.data;
            setBadges(resp_Badges);
            console.log(resp_Badges);
            }}
         catch (error)
            {console.log(error);}
      }
      getBadges();
    }, []);

  return (
      <div>
          <div className='_info' style={{ textAlign: 'center' }}>
              {/* {Badges.length > 0 ?
                <ul>
                    {Badges.map((Badge, index) =>
                        <ul key ={index + 1}>
                          Badge
                        </ul>
                    )}
                </ul>
                :
                <div>No Achievements Yet 👀</div>
              } */}
              <div>******BADGES HERE********</div>
          </div>
      </div>
  )
}

export default ProfileBadges;
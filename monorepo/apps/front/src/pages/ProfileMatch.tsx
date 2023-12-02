import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
// import ProfilePicture from './ProfilePicture';
// import Modal from 'react-modal';
// import Nickname from './Nickname';
// import Twofa from './2fa';
// import SearchNick from './SearchNick';


const ProfileMatch: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [id, setId] = useState<number>();
    const [matches, setMatches] = useState<any[]>([]);

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
        setId(resp_profile.id);
        console.log(resp_profile);
      }
    }
    getProfileData();
  },);

  useEffect(() => {
    const getMatches = async () => {
      console.log('token = ', jwtToken);
      const response = await axios.get('/api/user/me/matches', {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
      },);
      if (response.status === 200) {
        const resp_match = response.data;
        setMatches(resp_match);
        console.log(resp_match);
      }
    }
    getMatches();
  }, []);

    return (
        <div> 
            {matches.length > 0 && (
                <ul>
                    {matches.map((match, index) =>
                    (
                        <ul key={index + 1}>
                        {match.id = match.user1.id ? 
                        // ecrire si victory ou defeat
                        <div>{match.user1.win ? <span>VICTORY&nbsp;</span> : <span>DEFEAT&nbsp;</span>}
                        {/* ecrire against qui ? */}
                         against&nbsp; {match.user2.nickname}&nbsp;
                        {/*ecrire le score */}
                        <div>Score : {match.p1score} / {match.p2score} </div>
                        {/* ecrire la date */}
                        <div>&nbsp;On&nbsp; {match.date} </div>
                        </div>
                          : 2
                        }
                        {/* {match.user1.nickname} against {match.user2.nickname} */}
                        </ul>
                    )
                    )}
                </ul>
            )

            }
        </div>
        )
    }
    
    export default ProfileMatch;
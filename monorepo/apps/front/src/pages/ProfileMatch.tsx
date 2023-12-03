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
                        {id === match.user1.id ? 

                        // ecrire si victory ou defeat
                        <div>
                        {/* <div>ID = {id}&nbsp;&nbsp;MATCH USER1 ID = {match.user1.id}</div> */}
                        {match.p1score < match.p2score ? <span className='_defeat'> {match.p1score} / {match.p2score} : &nbsp;DEFEAT</span> : <span className='_victory'>  {match.p1score} / {match.p2score} : &nbsp; VICTORY</span>}
                        {/* ecrire against qui ? */}
                        &nbsp;against&nbsp;<span className='_nickname'> {match.user2.nickname}</span>
                        {/* ecrire la date */}
                        &nbsp;<span className='_date'> {new Date(match.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })} </span> 
                       
                        </div>

                          : 

                        // ecrire si victory ou defeat
                        <div>
                          
                        {match.p1score > match.p2score ? <span className='_defeat'>{match.p2score} / {match.p1score} &nbsp; DEFEAT</span> : <span className='_victory'>{match.p2score} / {match.p1score} &nbsp; VICTORY</span>}
                        {/* ecrire against qui ? */}
                        &nbsp; against&nbsp; <span className='_whiteTab'>{match.user1.nickname} </span>
                        {/* ecrire la date */}
                        &nbsp;On&nbsp; <span className='_blackTab'>{match.date} </span>

                        </div>

                        }
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
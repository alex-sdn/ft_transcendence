import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'


const ProfileMatch: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [id, setId] = useState<number>();
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        const getProfileData = async () => {
            try {
                const response = await axios.get('/api/user/me', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200) {
                    const resp_profile = response.data;
                    setId(resp_profile.id);
                }
            }
            catch (error) { console.log(error); }
        }
        getProfileData();
    },);

    useEffect(() => {
        const getMatches = async () => {
            try {
                const response = await axios.get('/api/user/me/matches', {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                },);
                if (response.status === 200) {
                    const resp_match = response.data.reverse();
                    setMatches(resp_match);
                }
            }
            catch (error) { console.log(error); }
        }
        getMatches();
    }, []);

    return (
        <div>
            {matches.length > 0 ?
                <ul>
                    {matches.map((match, index) =>
                        <div>
                            {match.p1score < match.p2score ? <span className='_defeat'> {match.p1score} / {match.p2score} : &nbsp;DEFEAT</span> : <span className='_victory'>  {match.p1score} / {match.p2score} : &nbsp; VICTORY</span>}
                            &nbsp;against&nbsp;<span className='_nickname'> {match.user2.nickname}</span>
                            &nbsp;<span className='_date'> {new Date(match.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })} </span>

                        </div>
                    )}
                </ul>
                :
                <div> No matches done yet ! 🤺 </div>
            }
        </div>
    )
}

export default ProfileMatch;
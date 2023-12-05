import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
import { useParams } from 'react-router-dom';
import SearchNick from './SearchNick';
import Block from "./chat/friend/Block";


const ProfileUser: React.FC = () => {
    const { ID } = useParams<{ ID?: string }>();

  const [nickname, setNickname] = useState<string>('');
  const [image, setImage] = useState<File>();
  const [loss, setLoss] = useState<number>();
  const [win, setWin] = useState<number>();
  const [lp, setLp] = useState<number>();
  const [gameNb, setGameNb] = useState<number>();
  const [id, setId] = useState<number>();
  const [matches, setMatches] = useState<any[]>([]);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockModal, setBlockModal] = useState<boolean>(false);
  const jwtToken = Cookies.get('jwt-token');

  // REQUETE INFOS
  useEffect(() => {
    const getProfileData = async () => {
      const response = await axios.get(`/api/user/id/${ID}`, {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
      },);
      if (response.status === 200) {
        const resp_profile = response.data;
        setNickname(resp_profile.nickname);
        setLoss(resp_profile.loss);
        setWin(resp_profile.win);
        setLp(resp_profile.LP);
        setGameNb(resp_profile.loss + resp_profile.win);
        setId(resp_profile.id);
      }
    }
    getProfileData();
  }, [id]);

  //REQUETE MATCHS
  useEffect(() => {
    const getMatches = async () => {
      console.log('token = ', jwtToken);
      const response = await axios.get(`/api/user/matches/${ID}`, {
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
  }, [id]);

//REQUETE AVATAR
  useEffect(() => {
    const fetchDefaultAvatar = async () => {
      let response = await axios.get(`/api/user/id/${ID}`, {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
      },);
      const fileName = response.data.avatar;
      response = await axios.get('/api/user/avatar/' + fileName, {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
        responseType: 'arraybuffer',
      }, );
      if (response.status === 200) {
        const blob = new Blob([response.data]);

        const file = new File([blob], fileName);
        setImage(file);
      }
    };
    fetchDefaultAvatar();
  }, [id]);

  //BLOCK
  useEffect(() => {
      const getBlocked = async () => {
          const response = await axios.get(`/api/user/block/${nickname}`, {
              headers: {
                  'Authorization': 'Bearer ' + jwtToken,
              },
          })
          if (response.status === 200) {
              setIsBlocked(response.data);
          }
      }
      getBlocked()
  }, [nickname, jwtToken])


  return (
  <div>
    <div className="_profile">
    <p><SearchNick/></p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' />}
 
 
            <div>

                <button className="material-symbols-outlined" onClick={() => setBlockModal(true)}>
                    block
                </button>

            {nickname &&
                <Block nickname={nickname}
                    isBlocked={isBlocked}
                    isChannel={false}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                />
            }
            </div>


    </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>{nickname}</h1> &emsp;
    </div>

      <div className="_info"> <p>Game played : <span className='_score'>{gameNb}</span></p>
        <p>Victory : <span className='_score'>{win} </span></p>
        <p>Loss : <span className='_score'>{loss}</span></p>

        <p>Ladder Points : <span className='_score'>{lp}</span> </p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
        </div>
    </div>
</div>
<div className='_scoreTab'>
        <h1>Recent Games</h1>
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
</div>
      )
}

export default ProfileUser;

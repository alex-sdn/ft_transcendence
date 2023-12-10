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
  const [isFriend, SetIsFriend] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockModal, setBlockModal] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const jwtToken = Cookies.get('jwt-token');

  // REQUETE INFOS
  useEffect(() => {
      const getProfileData = async () => {
          try {
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
          catch (error)
              {console.log(error);}
      }
      getProfileData();
  }, [id]);

  //REQUETE MATCHS
  useEffect(() => {
      const getMatches = async () => {
          try {
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
          catch (error)
              {console.log(error);}
      }
      getMatches();
  }, [id]);

//REQUETE AVATAR
  useEffect(() => {
      const fetchDefaultAvatar = async () => {
          try{
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
          }
          catch (error)
              {console.log(error);}
      };
      fetchDefaultAvatar();
  }, [id]);

  //BLOCK
  useEffect(() => {
      const getBlocked = async () => {
          try {
            const response = await axios.get(`/api/user/block/${nickname}`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            })
            if (response.status === 200) 
                {setIsBlocked(response.data);}
          }
          catch (error)
              {console.log(error);}
      }
      getBlocked()
  }, [nickname, jwtToken])
  
//GET FRIEND
useEffect(() => {
    const getFriend = async () => {
        try { 
            const response = await axios.get(`/api/user/friend/${ID}`, {
                headers: {
                  'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) 
            {SetIsFriend(response.data)}
        }
        catch (error)
            {console.log(error);}
    }
    getFriend();
},);

//POST FRIEND
const postClic = () => {
    postFriend();
}

const postFriend = async () => {
  try {
  const response = await axios.post(
    `/api/user/friend/${ID}`, 
    {}, 
    {
      headers: {
        'Authorization': 'Bearer ' + jwtToken,
      },
    }
  );
  if (response.status === 201) 
      {window.location.reload();}
  }
  catch (error)
  { 
    setShowPopup(true);
    console.log(error);}
};

setTimeout(() => {
    setShowPopup(false);
}, 4000);

//DELETE FRIEND
const dltClic = () => {
    dltFriend();
}

const dltFriend = async () => {
    try {
        const response = await axios.delete(`/api/user/friend/${ID}`, {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
        },);
        if (response.status === 200) 
            {window.location.reload();}
    }
    catch (error)
        {console.log(error);}
}


  return (
  <div>

    <div className="_profile">

          <p><SearchNick/></p>
          <div className='wrapper'>
              <div className="_info">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                  {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' />}
                        &emsp; <span style={{ display: 'flex', flexDirection: 'column' }}>
                            <button className="button-29" onClick={() => setBlockModal(true)}>🚫</button>
                                {nickname &&
                                    <Block nickname={nickname}
                                        isBlocked={isBlocked}
                                        isChannel={false}
                                        blockModal={blockModal}
                                        onClose={() => setBlockModal(false)}
                                    />
                                }

                            <span> {isFriend === true ?
                                <button className="button-29" onClick={dltClic}> 👤➖ </button> 
                                :
                                <button className="button-29" onClick={postClic}> 👤➕ </button>}

                                {showPopup && 
                                ( <div className='popup'> <p>Request already sent</p></div> )
                                } 
                            </span>
                              
                        </span>
                  </div>
                  <br/><div className='_h1'>{nickname}</div><br/>
                  <p>Game played : <span className='_score'>{gameNb}</span></p>
                  <p>Victory : <span className='_score'>{win} </span></p>
                  <p>Loss : <span className='_score'>{loss}</span></p>
                  <p>Ladder Points : <span className='_score'>{lp}</span> </p>
              </div>
          </div>
    </div>
    <div className='_scoreTab'>
        <h1>Recent Games</h1>
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
</div>
      )
}

export default ProfileUser;
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
  const [error, setError] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [firstgame, setFirstGame] = useState<boolean>();
  const [threetozero, setThreeToZero] = useState<boolean>();
  const [threerow, setThreeRow] = useState<boolean>();
  const [fivehundred, setFiveHundred] = useState<boolean>();
  const [five, setFive] = useState<boolean>();
  const [ten, setTen] = useState<boolean>();
  const [twenty, setTwenty] = useState<boolean>();
  const [fifty, setFifty] = useState<boolean>();
  const img1 = '/achievements/img1.PNG';
  const img2 = '/achievements/img2.PNG';
  const img3 = '/achievements/img3.PNG';
  const img4 = '/achievements/img4.PNG';
  const img5 = '/achievements/img5.PNG';
  const img6 = '/achievements/img6.PNG';
  const img7 = '/achievements/img7.PNG';
  const img8 = '/achievements/img8.PNG';
  const or = '/achievements/or.png';
  const orj = '/achievements/orj.png';
  const brz = '/achievements/brz.png';
  let achv1 = "Play your first game";
  let achv2 = "Win 3 to 0";
  let achv3 = "Win 3 games in a row";
  let achv4 = "reach 500 LP";
  let achv5 = "win 5 games total";
  let achv6 = "win 10 games total";
  let achv7 = "win 20 games total";
  let achv8 = "win 50 games total";
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
      catch (error) { console.log(error); }
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
      catch (error) { console.log(error); }
    }
    getMatches();
  }, [id]);

  //REQUETE AVATAR
  useEffect(() => {
    const fetchDefaultAvatar = async () => {
      try {
        let response = await axios.get(`/api/user/id/${ID}`, {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        },);
        const fileName = response.data.avatar;
        try {
          response = await axios.get('/api/user/avatar/' + fileName, {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
            responseType: 'arraybuffer',
          },);
          if (response.status === 200) {
            const blob = new Blob([response.data]);

            const file = new File([blob], fileName);
            setImage(file);
          }
        }
        catch (error) {
          console.log(error);
        }
      }
      catch (error) {
        console.log(error);
      }
    };
    fetchDefaultAvatar();
  }, [id]);

  //BLOCK
  useEffect(() => {
    const getBlocked = async () => {
      try {
        const response = await axios.get(`/api/user/block/${ID}`, {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        })
        if (response.status === 200) { 
          setIsBlocked(response.data);
          console.log("is blocked? ")
          console.log(response.data)
        }
      }
      catch (error) {
        console.log(error);
        // setError(error.response.data.message);
      }
    }
    getBlocked()
  }, [nickname, jwtToken, blockModal])

  //GET FRIEND
  useEffect(() => {
    const getFriend = async () => {
      try {
        const response = await axios.get(`/api/user/friend/${ID}`, {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        },);
        if (response.status === 200) { SetIsFriend(response.data) }
      }
      catch (error) {
        console.log(error);
      }
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
      if (response.status === 201) { window.location.reload(); }
    }
    catch (error) {
      setError(error.response.data.message);
      setShowPopup(true);
      console.log(error.response.data.message);
    }
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
      if (response.status === 200) { window.location.reload(); }
    }
    catch (error) { console.log(error); }
  }

  //ACHIEVEMENTS
  useEffect(() => {
    const getBadges = async () => {
      try {
        const response = await axios.get(`/api/user/achievements/${ID}`, {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        },);
        if (response.status === 200) {
          const resp_Badges= response.data;
          setFirstGame(resp_Badges.playOne);
          setThreeToZero(resp_Badges.win3to0);
          setThreeRow(resp_Badges.win3inRow);
          setFiveHundred(resp_Badges.reach500LP);
          setFive(resp_Badges.win5);
          setTen(resp_Badges.win10);
          setTwenty(resp_Badges.win20);
          setFifty(resp_Badges.win50);
        }
      }
      catch (error) { console.log(error); }
    }
    getBadges();
  }, []);


  return (
    <div>

      <div className="_profile">

        <p><SearchNick /></p>
        <div className='wrapper'>
          <div className="_info">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' />}
              &emsp; <span style={{ display: 'flex', flexDirection: 'column' }}>
                <button className="button-29" onClick={() => setBlockModal(true)}>🚫</button>
                {nickname &&
                  <Block id={ID || ""}
                    nickname={nickname}
                    isBlocked={isBlocked}
                    isChannel={true}
                    blockModal={blockModal}
                    onClose={() => setBlockModal(false)}
                  />
                }

                <span> {isFriend === true ?
                  <button className="button-29" onClick={dltClic}> 👤➖ </button>
                  :
                  <button className="button-29" onClick={postClic}> 👤➕ </button>}

                  {showPopup &&
                    (<div className='popup'> <p>{error}</p></div>)
                  }
                </span>

              </span>
            </div>
            <br /><div className='_h1'>{nickname}</div><br />
            <p>Game played : <span className='_score'>{gameNb}</span></p>
            <p>Victory : <span className='_score'>{win} </span></p>
            <p>Loss : <span className='_score'>{loss}</span></p>
            <p>Ladder Points : <span className='_score'>{lp}</span> </p>
          </div>
          <div className='_scoreTab'>
            <div className='_h1' style={{ textAlign: 'center' }}>Achievements</div>

            <div className='_info' style={{ textAlign: 'center' }}>
            {firstgame === true ? <span className="image-container">    <img src={img1} alt="firstgame" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv1}</div> 
                  </span>        :  <span className="image-container">  <img src={orj} alt="firstgame" className="blurred-image" /> 
                                                                        <div className="overlay-text">{achv1}</div> </span> }&nbsp;

            {threetozero === true ? <span className="image-container">  <img src={img2} alt="threetozero" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv2}</div>
                        </span> : <span className="image-container">    <img src={or} alt="threetozero" className="blurred-image" />
                                                                        <div className="overlay-text">{achv2}</div> </span> }&nbsp;

            {threerow === true ? <span className="image-container">     <img src={img3} alt="threerow" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv3}</div>
                        </span> : <span className="image-container">    <img src={orj} alt="threerow" className="blurred-image" />
                                                                        <div className="overlay-text">{achv3}</div> </span> }&nbsp;

            {fivehundred === true ? <span className="image-container">  <img src={img4} alt="fivehundred" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv4}</div>
                        </span> : <span className="image-container">    <img src={or} alt="fivehundred" className="blurred-image" />
                                                                        <div className="overlay-text">{achv4}</div> </span> }&nbsp;

            {five === true ? <span className="image-container">         <img src={img5} alt="five" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv5}</div>
                        </span> : <span className="image-container">    <img src={orj} alt="five" className="blurred-image" />
                                                                        <div className="overlay-text">{achv5}</div> </span> }&nbsp;

                                                                        
             {ten === true ? <span className="image-container">         <img src={img6} alt="ten" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv6}</div>
                        </span> : <span className="image-container">    <img src={brz} alt="ten" className="blurred-image" />
                                                                        <div className="overlay-text">{achv6}</div> </span> }&nbsp;

              {twenty === true ? <span className="image-container">     <img src={img7} alt="twenty" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv7}</div>
                        </span> : <span className="image-container">    <img src={brz} alt="twenty" className="blurred-image" />
                                                                        <div className="overlay-text">{achv7}</div> </span> }&nbsp;

              {fifty === true ? <span className="image-container">      <img src={img8} alt="fifty" className="blurred-image"/> 
                                                                        <div className="overlay-text">{achv8}</div>
                        </span> : <span className="image-container">    <img src={or} alt="fifty" className="blurred-image" />
                                                                        <div className="overlay-text">{achv8}</div> </span> }&nbsp;
          </div>

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
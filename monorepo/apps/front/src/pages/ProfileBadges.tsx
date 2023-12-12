import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
// import ProfileFriends from './Profilefriends';
// import ProfileUser from './ProfileUser';

const ProfileBadges: React.FC = () => {

  const jwtToken = Cookies.get('jwt-token');
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
            setFirstGame(resp_Badges.playOne);
            setThreeToZero(resp_Badges.win3to0);
            setThreeRow(resp_Badges.win3inRow);
            setFiveHundred(resp_Badges.reach500LP);
            setFive(resp_Badges.win5);
            setTen(resp_Badges.win10);
            setTwenty(resp_Badges.win20);
            setFifty(resp_Badges.win50);
            }}
         catch (error)
            {console.log(error);}
      }
      getBadges();
    }, []);


  return (
      <div>
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
  )
}

export default ProfileBadges;
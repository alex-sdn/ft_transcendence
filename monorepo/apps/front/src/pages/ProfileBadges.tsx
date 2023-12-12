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

  const img1 = '/achievements/1.jpg';
  const img2 = '/achievements/2.jpg';
  const img3 = '/achievements/3.jpg';
  const img4 = '/achievements/4.jpg';
  const img5 = '/achievements/5.jpg';
  const img6 = '/achievements/6.jpg';
  const img7 = '/achievements/7.jpg';
  const img8 = '/achievements/8.jpg';

    
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
            // setBadges(resp_Badges);
            // console.log(resp_Badges);
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
            <span>{firstgame === true ? <img src={img1} alt="firstgame" style={{width: '100px', height: '100px', }}/>
                   : <img src={img1} alt="firstgame" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>  }</span>
            <span>{threetozero === true ? <img src={img2} alt="threetozero" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img2} alt="threetozero" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
            <span>{threerow === true ? <img src={img3} alt="threerow" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img3} alt="threerow" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
            <span>{fivehundred === true ? <img src={img4} alt="fivehundred" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img4} alt="fivehundred" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
            <span>{five === true ? <img src={img5} alt="five" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img5} alt="five" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
            <span>{ten === true ? <img src={img6} alt="ten" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img6} alt="ten" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
            <span>{twenty === true ? <img src={img7} alt="twenty" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img7} alt="twenty" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/> }</span>
            <span>{fifty === true ? <img src={img8} alt="fifty" style={{width: '100px', height: '100px', }}/> 
                    :<img src={img8} alt="fifty" style={{width: '100px', height: '100px', filter: 'grayscale(100%)'}}/>}</span>
          </div>
      </div>
  )
}

export default ProfileBadges;

// style={{width: '40px', height: '40px', }}
// style={{width: '40px', height: '40px', filter: 'grayscale(100%)'}}

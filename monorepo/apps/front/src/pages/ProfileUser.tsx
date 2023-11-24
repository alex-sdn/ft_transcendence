import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
    const { ID } = useParams<{ ID?: string }>();

  const [nickname, setNickname] = useState<string>('');
  const [image, setImage] = useState<File>();
  const [loss, setLoss] = useState<number>();
  const [win, setWin] = useState<number>();
  const [lp, setLp] = useState<number>();
  const [gameNb, setGameNb] = useState<number>();
  const [id, setId] = useState<number>();


  const jwtToken = Cookies.get('jwt-token');

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

//   const customStyles = {
//     content: {
//       top: '50%',
//       left: '50%',
//       right: 'auto',
//       bottom: 'auto',
//       transform: 'translate(-50%, -50%)',
//       width: 'auto',
//       height: 'auto',
//       background: 'black',
//       margin: '30px',
//     },
//   };

  return (
    <div className="_profile">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' />}
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
      )
}

export default Profile;

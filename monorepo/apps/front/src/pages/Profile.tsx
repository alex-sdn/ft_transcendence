import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
import ProfilePicture from './ProfilePicture';
import Modal from 'react-modal';
import Nickname from './Nickname';

const Profile: React.FC = () => {

  const [nickname, setNickname] = useState<string>('');
  const [image, setImage] = useState<File>();
  const [loss, setLoss] = useState<number>();
  const [win, setWin] = useState<number>();
  const [lp, setLp] = useState<number>();
  const [twofa, setTwofa] = useState<boolean>();
  const [gameNb, setGameNb] = useState<number>();


  const jwtToken = Cookies.get('jwt-token');
  useEffect(() => {
    const getProfileData = async () => {
        console.log('token = ', jwtToken);
        const response = await axios.get('/api/user/me', {
            headers : {
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
          setTwofa(resp_profile.twofa);
          console.log(resp_profile);
       }
    } 



    getProfileData();
  },);

  useEffect(() => {
    const fetchDefaultAvatar = async () => {
        let response = await axios.get('/api/user/me', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
        },);
        const fileName = response.data.avatar;

        response = await axios.get('api/user/avatar/' + fileName, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
            },
            responseType: 'arraybuffer',
        });
        if (response.status === 200) {
            const blob = new Blob([response.data]);
            const file = new File([blob], fileName);
            setImage(file);
        }
    };
    fetchDefaultAvatar();
}, []);


//MODALE start {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    window.location.reload();
    setIsOpen(false);
  };
// } MODALE end

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      width: '250px',
      height: '350px',
    },
  };

  return (
    <div className="_profile">
       <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' />}

 {/* MODALE start */}
{ <div>
  <button className="button-29" onClick={openModal}>⚙️</button>
  <Modal 
    isOpen={isOpen}
    onRequestClose={closeModal}
    contentLabel='Pp change'
    style={customStyles}>
      <button onClick={closeModal}>x</button>
      <ProfilePicture/>
  </Modal>
</div> } </div>
{/* MODALE end*/}

<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <h1>{nickname}</h1>&emsp;
     { <div>
  <button className="button-29" onClick={openModal}>⚙️</button>
  <Modal 
    isOpen={isOpen}
    onRequestClose={closeModal}
    contentLabel='Nick change'
    style={customStyles}>
      <button onClick={closeModal}>x</button>
      <Nickname/>
  </Modal>
</div> } </div>

      <div className="_info"> <p>Game played : <span className='_score'>{gameNb}</span></p> 
        <p>Victory : <span className='_score'>{win} </span></p>
        <p>Loss : <span className='_score'>{loss}</span> </p>
        <p>Ladder Points : <span className='_score'>{lp}</span> </p>
        <p>Two factor authentification : {twofa ? <span className='_score'>activated</span> : <span className='_score'> deactivated</span>} </p>
      </div>
    </div>

  )


}

export default Profile;

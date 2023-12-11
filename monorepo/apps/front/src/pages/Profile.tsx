import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
import ProfilePicture from './ProfilePicture';
import Modal from 'react-modal';
import Nickname from './Nickname';
import Twofa from './2fa';
import ProfileMatch from './ProfileMatch';
import SearchNick from './SearchNick';
import Profilefriends from './Profilefriends';
import ProfileList from './ProfileList';
import ProfileBadges from './ProfileBadges';

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
        try {
            const response = await axios.get('/api/user/me', {
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
                setTwofa(resp_profile.has2fa);
            }
        }
        catch (error)
            {console.log(error);}
    }
    getProfileData();
  },);

  //REQUETE AVATAR
  useEffect(() => {
      const fetchDefaultAvatar = async () => {
          try{
              let response = await axios.get('/api/user/me', {
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
              });
              if (response.status === 200) 
              {
                  const blob = new Blob([response.data]);
                  const file = new File([blob], fileName);
                  setImage(file);
              }
          }
          catch (error)
              {console.log(error);}
      };
      fetchDefaultAvatar();
  }, []);

  //SCORING
  

  //MODALE PP {
  const [isOpenpic, setIsOpenpic] = useState(false);

  const openModalpic = () => {
      setIsOpenpic(true);
  };

  const closeModalpic = () => {
      window.location.reload();
      setIsOpenpic(false);
  };

  //  MODALE NICKNAME

  const [isOpennic, setIsOpennic] = useState(false);

  const openModalnic = () => {
      setIsOpennic(true);
  };

  const closeModalnic = () => {
      window.location.reload();
      setIsOpennic(false);
  };

  //2FA activation Modale

  const [isOpenfa, setIsOpenfa] = useState(false);

  const openModalfa = () => {
      setIsOpenfa(true);
  };

  const closeModalfa = () => {
      window.location.reload();
      setIsOpenfa(false);
  };

  //2FA deactivation Modale

  const [isOpenNofa, setIsOpenNofa] = useState(false);

  const openModalNofa = () => {
      setIsOpenNofa(true);
  };

  const closeModalNofa = () => {
      window.location.reload();
      setIsOpenNofa(false);
  };

  const handleClic = () => {
      deac2fabutton();
  }

  const deac2fabutton = async () => {
    try {
        const response = await axios.delete('/api/user/me/edit2fa', {
          headers: {
            'Authorization': 'Bearer ' + jwtToken,
          },
        },);
        if (response.status === 200) {
          console.log('2FA successfully deactivated');
          window.location.reload();
        }
    }
    catch (error) 
        { console.log('Error encountered when deactivating 2FA'); }
  }
  
  //MODALE FRIENDS REQUEST
  const [isOpenfnd, setIsOpenfnd] = useState(false);

  const openModalfnd = () => {
      setIsOpenfnd(true);
  };

  const closeModalfnd = () => {
      window.location.reload();
      setIsOpenfnd(false);
  };

  //STYLE
  const customStyles = {
      content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          height: 'auto',
          background: 'black',
          margin: '50px',
      },
  };

  return (
    <div className="_profile">
      
        <p><SearchNick/></p>
        <div className='wrapper'>
            <div className="_info">  
                <div style={{ display: 'flex', alignItems: 'center' }}>
                {image && <img className="_avatar-img" src={URL.createObjectURL(image)} alt='profile picture' /> }
                &emsp; <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <button className="button-29" onClick={openModalpic}>⚙️</button>
                            <Modal
                              isOpen={isOpenpic}
                              onRequestClose={closeModalpic}
                              contentLabel='Pp change'
                              style={customStyles}>
                              <button onClick={closeModalpic}>x</button>
                              <ProfilePicture />
                            </Modal>
                        <span>
                          <button onClick={openModalfnd} className="button-29">👤❗</button>
                              <Modal
                                isOpen={isOpenfnd}
                                onRequestClose={closeModalfnd}
                                style={customStyles}>
                                <button onClick={closeModalfnd}>x</button>
                                <Profilefriends />
                              </Modal>
                        </span>
                    </span>
                </div><br/>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className='_h1'>{nickname}</span>
                    {<span>
                         &emsp;<button className="button-29" onClick={openModalnic}>⚙️</button>
                        <Modal
                            isOpen={isOpennic}
                            onRequestClose={closeModalnic}
                            contentLabel='Nick change'
                            style={customStyles}>
                            <button onClick={closeModalnic}>x</button>
                            <Nickname />
                        </Modal>
                    </span>}  
                </div><br/>
                <p>Game played : <span className='_score'>{gameNb}</span></p>
                <p>Victory : <span className='_score'>{win} </span></p>
                <p>Loss : <span className='_score'>{loss}</span></p>
                <p>Ladder Points : <span className='_score'>{lp}</span> </p>
                <p>Two Factor Auth : 
                    <div style={{ display: 'flex', flexDirection: 'row' }}> 
                        {twofa ? <span className='_score'>activated</span> : <span className='_score'> deactivated</span>} &emsp;
                        {twofa ?
                            <span>
                              <button className="button-29" onClick={openModalNofa}> ⚙️ </button>
                              <Modal
                                  isOpen={isOpenNofa}
                                  onRequestClose={closeModalNofa}
                                  style={customStyles}>
                                  <div>Are you sure you want to deactivate 2fa ?</div>
                                  <button className='button-29' onClick={handleClic}>YES</button>
                                  <button onClick={closeModalNofa} className='button-29'>NO</button>
                              </Modal>
                            </span>
                          :
                            <span>
                                <button className="button-29" onClick={openModalfa}> ⚙️ </button>
                                <Modal
                                    isOpen={isOpenfa}
                                    onRequestClose={closeModalfa}
                                    style={customStyles}>
                                    <button onClick={closeModalfa}>x</button>
                                    <Twofa />
                                </Modal>
                            </span>
                        }
                    </div>
                </p>
            </div>
            <div className='_scoreTab'>
              {/* <ProfileList/> */}
              <ProfileBadges/>
            </div>
        </div>
        <div className='_scoreTab'>
            <span className='_h1'>Recent Games</span>
            <p> <ProfileMatch/> </p>
        </div>

    </div>
  )
}
export default Profile;

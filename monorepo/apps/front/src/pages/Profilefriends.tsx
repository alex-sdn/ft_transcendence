import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'
// import Modal from 'react-modal';
// import SearchNick from './SearchNick';

const ProfileFriends: React.FC = () => {
    const jwtToken = Cookies.get('jwt-token');
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        const friendsreq = async () => {
          console.log('token = ', jwtToken);
          const response = await axios.get('/api/user/me/friend/requests', {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
          },);
          if (response.status === 200) {
            const resp_req = response.data;
            setRequests(resp_req);
            console.log(resp_req);
          }
          else 
          {}
        }
        friendsreq();
      },[]);

//ADD    
      const postFriend = async (ID : string) => {
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
        {    return window.location.reload();}
        }
        catch (error)
        {}
      };

//REFUSE
const dltFriend = async (ID :string) => {
    console.log('token = ', jwtToken);
    const response = await axios.delete(`/api/user/friend/${ID}`, {
      headers: {
        'Authorization': 'Bearer ' + jwtToken,
      },
    },);
    if (response.status === 200) 
    {    return window.location.reload();}
    else 
    {console.log("Error./ delete /api/user/friend/${ID}");}
  }

//MODALE
const [isOpenfa, setIsOpenfa] = useState(false);

const openModalfa = () => {
  setIsOpenfa(true);
};

const closeModalfa = () => {
  window.location.reload();
  setIsOpenfa(false);
};
      
    return (
        <div>
          {requests.length > 0 ? 
                            <ul>
                            {requests.map((request, index) =>
                            (
                                <ul key={index + 1}>
                                        <div>
                                            <button className="_victory" onClick={() => postFriend(request.requester.id)}>✅</button>
                                            <button className="_defeat" onClick={() => dltFriend(request.requester.id)}>❌</button>
                                            <span className='_score'>{request.requester.nickname}</span>
                                        </div>
                                </ul>
                            ))}
                        </ul>
          :
                <p className='_score'><br/>No Pending Requests <br/></p>
          }

            {/* {requests.length > 0 &&  (
                <ul>
                    {requests.map((request, index) =>
                    (
                        <ul key={index + 1}>
                                <div>
                                    <button className="_victory" onClick={() => postFriend(request.requester.id)}>✅</button>
                                    <button className="_defeat" onClick={() => dltFriend(request.requester.id)}>❌</button>
                                    <span className='_score'>{request.requester.nickname}</span>
                                </div>
                        </ul>
                    ))}
                </ul>
            )
            } */}
            
        </div>
        )
      }
      
      export default ProfileFriends;
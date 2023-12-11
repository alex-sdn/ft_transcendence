import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios'

const ProfileFriends: React.FC = () => {
  const jwtToken = Cookies.get('jwt-token');
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const friendsreq = async () => {
      try {
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
      }
      catch (error) { console.log(error); }
    }
    friendsreq();
  }, []);

  //ADD    
  const postFriend = async (ID: string) => {
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
      if (response.status === 201) { return window.location.reload(); }
    }
    catch (error) { console.log(error); }
  };

  //REFUSE
  const dltFriend = async (ID: string) => {
    try {
      const response = await axios.delete(`/api/user/friend/${ID}`, {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
      },);
      if (response.status === 200) { return window.location.reload(); }
    }
    catch (error) { console.log(error); }
  }

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
        <p className='_score'><br />No Pending Requests <br /></p>
      }
    </div>
  )
}

export default ProfileFriends;
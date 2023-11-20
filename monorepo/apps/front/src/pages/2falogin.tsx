// import React, { useEffect, useState } from 'react';
// import Cookies from "js-cookie";
// import axios from 'axios'
// import ProfilePicture from './ProfilePicture';
// import Modal from 'react-modal';
// import Nickname from './Nickname';

// const Twofa: React.FC = () => {

//     return (
//         <></>
//     )
// }

// export default Twofa;




// import React, { useState } from 'react';
// import Cookies from "js-cookie";
// import axios from 'axios'
// // import ProfilePicture from './ProfilePicture';
// // import Modal from 'react-modal';
// // import Nickname from './Nickname';

// const Login2fa: React.FC = () => {

//     const jwtToken = Cookies.get('jwt-token');
//     console.log('TOKEN == ' + jwtToken);
//     const [inputCode, setInputCode] = useState<string>('');

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setInputCode(e.target.value);
//         console.log('INPUTCODE =>>>' + inputCode);
//       }
//       const handleValidation = () => {
//         login2fareq(inputCode);
//       }
  
//       const login2fareq = async (code: string) => {
//         //   const responsesecret = await axios.get(
//         //       '/api/auth/signin/2fa', {code: inputCode},
//         //      {headers : {
//         //          'Authorization' : 'Bearer ' + jwtToken,
//         //          'Content-Type': 'application/json',
//         //      },});
//         console.log('??????? CODE ?????? ===>>> ' + code);

//         const responsesecret = await axios.get('/api/auth/signin/2fa', 
//         {
//             params: { code },
//             headers: {
//               'Authorization': 'Bearer ' + jwtToken,
//               'Content-Type': 'application/x-www-form-urlencoded',
//             },
//           });
          
//              if (responsesecret.status === 200) {
//               console.log('2FA successful'); 
//               window.location.reload();
//              }
//             else {
//               console.log('2fa FAILED')}}

              
//     return (
//         <div>
//         <input type='text' name='code' id='code' value={inputCode} onChange={handleChange} placeholder='Enter OTP'/>
//         <button className='button-29' onClick={handleValidation}>ok</button>    
//         </div>
//     )
// }

// export default Login2fa;

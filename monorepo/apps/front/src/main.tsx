import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

//style
import './style/header.css';
import './style/index.css';
import './style/NotFound.css';
import './style/Login.css';
import './style/ProfilePicture.css';
import './style/Chat.css';
import './style/createChannel.css';
import './style/Profile.css';
import 'bootstrap/dist/css/bootstrap.min.css'

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

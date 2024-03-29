import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

//style
import './style/header.css';
import './style/index.css';
import './style/NotFound.css';
import './style/Login.css';
import './style/ProfilePicture.css';
import './style/Profile.css';
import './style/FirstLog.css'
import './style/ProfileMatch.css';
import './style/Tabs.css';
//chat
import './style/chat/Chat.css';
import './style/chat/Channel.css'
import './style/chat/CreateChannel.css';
import './style/chat/ChannelSearchbar.css'
import './style/chat/ChannelsLayout.css'
import './style/chat/ChannelMembers.css'

//game
import './style/game/Game.css'

import './style/chat/Messages.css'
import './style/chat/PrivMessages.css'

import 'bootstrap/dist/css/bootstrap.min.css'

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

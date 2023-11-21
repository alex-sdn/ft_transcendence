import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'

import SocketContext, { initializeSocket } from './Socket'

// layouts
import RootLayout from './layouts/RootLayout'
import ChatLayout from './layouts/ChatLayout'
import ChannelsLayout from './layouts/ChannelsLayout'
import MeLayout from './layouts/FriendsLayout'

//pages
import Home from './pages/Home'
import Game from './pages/Game'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Nickname from './pages/Nickname'
import Login2fa from './pages/Login2fa'
import ProfilePicture from './pages/ProfilePicture'
import ProfileUser from './pages/ProfileUser'
import Channel from './pages/chat/channels/Channel'
import Friend from './pages/chat/friend/Friend'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="game" element={<Game />} />
      <Route path="chat" element={<ChatLayout />}>
        <Route path='channels' element={<ChannelsLayout />}>
          <Route path=":channelName" element={<Channel />} />
        </Route>
        <Route path="@me" element={<MeLayout />}>
          <Route path=":userName" element={<Friend />} />
        </Route>
      </Route>
      <Route path="profile" element={<Profile />} />
      <Route path="login2fa" element={<Login2fa />} />
      <Route path="login" element={<Login />} />
      <Route path="nickname" element={<Nickname />} />
      {/* <Route path="disconnect" element={<Disconnect />} /> */}
      <Route path="profile_picture" element={<ProfilePicture />} />
      <Route path="profileUser/:Nick" element={<ProfileUser />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
)

function App() {
  const socket = initializeSocket();

  return (
    <SocketContext.Provider value={socket}>
      <RouterProvider router={router} />
    </SocketContext.Provider>
  );
}

export default App

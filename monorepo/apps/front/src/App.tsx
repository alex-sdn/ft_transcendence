import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
  Navigate
} from 'react-router-dom'
import Cookies from "js-cookie";
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
import ProfileMatch from './pages/ProfileMatch'
import Channel from './pages/chat/channels/Channel'
import Friend from './pages/chat/friend/Friend'

const jwtToken = Cookies.get('jwt-token');
const jwt2faToken = Cookies.get('jwt-2fa-token');

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={jwtToken ? <Home /> : <Navigate to='/login' />} />
      <Route path="game" element={jwtToken ? <Game /> : <Navigate to='/login' />} />
      <Route path="chat" element={jwtToken ? <ChatLayout /> : <Navigate to='/login' />}>
        <Route path='channels' element={jwtToken ? <ChannelsLayout /> : <Navigate to='/login' />}>
          <Route path=":channelName" element={jwtToken ? <Channel /> : <Navigate to='/login' />} />
        </Route>
        <Route path="@me" element={jwtToken ? <MeLayout /> : <Navigate to='/login' />}>
          <Route path=":userName" element={jwtToken ? <Friend /> : <Navigate to='/login' />} />
        </Route>
      </Route>
      <Route path="profile" element={jwtToken ? <Profile /> : <Navigate to='/login' />} />
      <Route path="login2fa" element={jwt2faToken ? <Login2fa /> : <Navigate to='/login' />} />
      <Route path="login" element={<Login />} />
      <Route path="nickname" element={jwtToken ? <Nickname /> : <Navigate to='/login' />} />
      {/* <Route path="disconnect" element={<Disconnect />} /> */}
      <Route path="profile_picture" element={jwtToken ? <ProfilePicture /> : <Navigate to='/login' />} />
      <Route path="profile_user" element={jwtToken ? <ProfileUser/> : <Navigate to='/login' />} />
      <Route path="profile_match" element={jwtToken ? <ProfileMatch/> : <Navigate to='/login' />} />
      <Route path='*' element={jwtToken ? <NotFound /> : <Navigate to='/login' />} />
    </Route>
  )
)

function App() {
  const socket = initializeSocket();

  return (
    <SocketContext.Provider value={socket || null}>
      <RouterProvider router={router} />
    </SocketContext.Provider>
  );
}

export default App

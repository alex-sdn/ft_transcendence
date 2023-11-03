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

//pages
import Home from './pages/Home'
import Game from './pages/Game'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Nickname from './pages/Nickname'
import ProfilePicture from './pages/ProfilePicture'
import Channel from './pages/chat/Channel'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="game" element={<Game />} />
      <Route path="chat" element={<ChatLayout />}>
        {/* <Route path=":channelName/:channelId" element={<Channel />}/> */}
        {/* <Route path=':userName' element={<PrivMsg />} /> */}
        <Route path="channel/:channelId" element={<Channel />} />
      </Route>
      <Route path="profile" element={<Profile />} />
      <Route path="login" element={<Login />} />
      <Route path="nickname" element={<Nickname />} />
      <Route path="profile_picture" element={<ProfilePicture />} />
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

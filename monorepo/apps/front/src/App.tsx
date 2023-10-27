
//import './App.css'

import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'

// layouts
import RootLayout from './layouts/RootLayout'

//pages
import Home from './pages/Home'
import Game from './pages/Game'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Nickname from './pages/Nickname'
import ProfilePicture from './pages/ProfilePicture'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="game" element={<Game />} />
      <Route path="chat" element={<Chat />} />
      <Route path="profile" element={<Profile />} />
      <Route path="login" element={<Login />} />
      <Route path="nickname" element={<Nickname />} />
      <Route path="profile_picture" element={<ProfilePicture />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App

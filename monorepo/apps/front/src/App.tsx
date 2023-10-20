
//import './App.css'

import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'

// pages
import RootLayout from './layouts/RootLayouts'
import Home from './pages/Home'
import Game from './pages/Game'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="game" element={<Game />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          
          <Route path='*' element={<NotFound />}/>
      </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App

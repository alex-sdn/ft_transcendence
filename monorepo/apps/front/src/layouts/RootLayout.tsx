import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const RootLayout: React.FC = () => {

  const navigate = useNavigate();
  const jwtToken = Cookies.get('jwt-token');

  const disconnect = () => {
    Cookies.remove('jwt-token');
    return navigate('/login');
  }

  return (
    <div className='root-layout'>
      <header>
        <h1>Pong Game</h1>
        <nav className="navbar links">
          {jwtToken ? <NavLink to="/">Home</NavLink> : <NavLink to="/login">Home</NavLink>}
          {jwtToken ? <NavLink to="game">Game</NavLink> : <NavLink to="/login">Game</NavLink>}
          {jwtToken ? <NavLink to="chat">Chat</NavLink> : <NavLink to="/login">Chat</NavLink>}
          {jwtToken ? <NavLink to="profile">Profile</NavLink> : <NavLink to="/login">Profile</NavLink>}
          <button className='button-59' onClick={disconnect}>Logout</button> 
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;

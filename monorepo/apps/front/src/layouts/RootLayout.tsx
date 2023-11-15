import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const RootLayout: React.FC = () => {

  const disconnect = () => {
    Cookies.remove('jwt-token');
    window.location.reload();
  }

  const jwtToken = Cookies.get('jwt-token');
  return (
    <div className='root-layout'>
      <header>
        <h1>Pong Game</h1>
        <nav className="navbar links">
          {jwtToken ? <NavLink to="/">Home</NavLink> : <NavLink to="/login">Home</NavLink>}
          {jwtToken ? <NavLink to="game">Game</NavLink> : <NavLink to="/login">Game</NavLink>}
          {jwtToken ? <NavLink to="chat">Chat</NavLink> : <NavLink to="/login">Chat</NavLink>}
          {jwtToken ? <NavLink to="profile">Profile</NavLink> : <NavLink to="/login">Profile</NavLink>}
          <button className='button-29' onClick={disconnect}>Disconnection</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;

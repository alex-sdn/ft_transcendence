import React, { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import SocketContext from "../Socket";

const RootLayout: React.FC = () => {

  const socket = useContext(SocketContext);

  const disconnect = () => {
    Cookies.remove('jwt-token');
    if (socket)
      socket.disconnect();
    window.location.assign('/login');
  }

  return (
    <div className='root-layout'>
      <header>
        <h1>Pong Game</h1>
        <nav className="navbar links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="game">Game</NavLink>
          <NavLink to="chat">Chat</NavLink>
          <NavLink to="profile">Profile</NavLink>
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

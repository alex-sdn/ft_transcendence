import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const RootLayout: React.FC = () => {
  return (
    <div className='root-layout'>
      <header>
        <nav>
          <h1>Pong Game</h1>
          <NavLink to="/">Home</NavLink>
          <NavLink to="game">Game</NavLink>
          <NavLink to="chat">Chat</NavLink>
          <NavLink to="profile">Profile</NavLink>
          <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5aa910e46806ef2878fcc39c28b29ced49eea2c7be64920d660e8ef997c748c0&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth&response_type=code">Login</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
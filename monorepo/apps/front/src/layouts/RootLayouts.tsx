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
          <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1b7f717c58b58406ad4b2abe9145475069d66ace504146041932a899c47ff960&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code">Login</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
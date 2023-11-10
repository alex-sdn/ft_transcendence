import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const RootLayout: React.FC = () => {
  return (
    <div className='root-layout'>
      <header>
        <h1>Pong Game</h1>
        <nav className="navbar links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="game">Game</NavLink>
          <NavLink to="chat">Chat</NavLink>
          <NavLink to="profile">Profile</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
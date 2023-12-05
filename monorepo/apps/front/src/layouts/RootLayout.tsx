import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import SocketContext from "../Socket";
import { Modal, ModalHeader, ModalTitle } from "react-bootstrap";
import axios from "axios";

const RootLayout: React.FC = () => {
  const [inviteModale, setInviteModale] = useState<boolean>(false);
  const [user, setUser] = useState<string>("");
  var me: string;
  const socket = useContext(SocketContext);
  const jwtToken = Cookies.get('jwt-token');

  const disconnect = () => {
    Cookies.remove('jwt-token');
    if (socket)
      socket.disconnect();
    window.location.assign('/login');
  }

  const getMe = async () => {
    if (jwtToken) {
      const response = await axios.get('/api/user/me', {
        headers: {
          'Authorization': 'Bearer ' + jwtToken,
        },
      })
      if (response.status === 200) {
        me = response.data.nickname;
      }
    }
  }

  useEffect(() => {
    const getEvent = async () => {

      await getMe();

      if (socket) {
        socket.on("invite", (data) => {
          if (me === data.target) {
            setInviteModale(true);
            setUser(data.sender);
          }
        });
        //invite game
      }

      return () => {
        if (socket)
          socket.off("invite");
      }
    }
    getEvent()
  }, []);

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
      <Modal show={inviteModale}
        onHide={() => setInviteModale(false)}
        style={{ color: "black" }}
      >
        <ModalHeader>
          <ModalTitle>
            Do you want to play with <strong>{user}</strong>?
          </ModalTitle>
        </ModalHeader>
      </Modal>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;

import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import SocketContext from "../Socket";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import axios from "axios";

const RootLayout: React.FC = () => {
  const [inviteChannelModale, setInviteChannelModale] = useState<boolean>(false);
  const [inviteGameModale, setInviteGameModale] = useState<boolean>(false);
  const [user, setUser] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [error, setError] = useState<string>("");
  var me: string;
  var status: string;
  const socket = useContext(SocketContext);
  const jwtToken = Cookies.get('jwt-token');

  const disconnect = () => {
    Cookies.remove('jwt-token');
    if (socket)
      socket.disconnect();
    window.location.assign('/login');
  }

  useEffect(() => {
    const getMe = async () => {
      if (jwtToken) {
        try {
          const response = await axios.get('/api/user/me', {
            headers: {
              'Authorization': 'Bearer ' + jwtToken,
            },
          })
          if (response.status === 200) {
            me = response.data.nickname;
            status = response.data.status;
          }
        }
        catch (error) {
          console.log(error);
        }
      }
    }
    getMe();
  }, [jwtToken, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("inviteGame", (data) => {
        if (me == data.target && status != "ingame") {
          setInviteGameModale(true);
          setUser(data.sender);
        }
      })

      socket.on("invite", (data) => {
        if (me == data.target && status != "ingame") {
          setInviteChannelModale(true);
          setUser(data.sender);
          setChannel(data.channel);
        }
      })

      socket.on("startGame", () => {
        window.location.assign('/');
      })

    }

    return () => {
      if (socket) {
        socket.off("invite");
        socket.off("inviteGame");
        socket.off("startGame");
      }
    }
  }, []);

  const handleJoinChannel = async (event: React.FormEvent) => {
    event.preventDefault();
    const createPromise = new Promise<{ target: string }>((resolve, reject) => {
      if (socket) {
        socket.emit("join", { target: channel, password: "" });
        socket.on("join", (data) => {
          resolve(data);
        });
        socket.on("error", (data) => {
          reject(data);
        });
      }
    });

    createPromise
      .then((data) => {
        window.location.assign(`/chat/channels/${data.target}`);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  const handlePlayGame = async (event: React.FormEvent) => {
    event.preventDefault();
    if (socket) {
      socket.emit("inviteGame", { sender: me, target: user });
      socket.on("error", (data) => {
        setError(data.message);
      })
    }
  }

  const handleRefuse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (socket) {
      socket.emit("refuseInvite", { sender: me, target: user });
      setError("");
      setInviteGameModale(false);
    }
  }

    return (
      <div className='root-layout'>
        <header>
          <h1>Pong Game</h1>
          <nav className="navbar links">
            <NavLink to="/">Game</NavLink>
            <NavLink to="chat">Chat</NavLink>
            <NavLink to="profile">Profile</NavLink>
            <button className='button-59' onClick={disconnect}>Logout</button>
          </nav>
        </header>

        <Modal show={inviteChannelModale}
          onHide={() => setInviteChannelModale(false)}
          style={{ color: "black" }}
          className="text-center"
        >
          <ModalHeader>
            <ModalTitle>
              <strong>{user}</strong> invited you to join <strong>{channel}</strong>
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            Do you want to join <strong>{channel}</strong>?
            <p className="action-buttons">
              <button className="button-59"
                onClick={(e) => handleJoinChannel(e)}
              >
                Yes
              </button>
              <button className="button-59"
                onClick={() => {
                  setError("");
                  setInviteChannelModale(false);
                }}>
                No
              </button>
            </p>
          </ModalBody>
        </Modal>

        <Modal show={inviteGameModale}
          onHide={() => setInviteGameModale(false)}
          style={{ color: "black" }}
          className="text-center"
        >
          <ModalHeader>
            <ModalTitle>
              <strong>{user}</strong> invited you to play
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            Do you want to play with <strong>{user}</strong>?
            <p className="action-buttons">
              <button className="button-59"
                onClick={(e) => handlePlayGame(e)}
              >
                Yes
              </button>
              <button className="button-59"
                onClick={(e) => handleRefuse(e)}>
                No
              </button>
            </p>
            {error && <div className="text-danger">{error}</div>}
          </ModalBody>
        </Modal>
        <main>
          <Outlet />
        </main>
      </div>
    );
  };

  export default RootLayout;

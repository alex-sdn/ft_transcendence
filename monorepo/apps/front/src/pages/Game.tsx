import React, { useContext, useEffect, useState, useRef } from 'react';
import SocketContext from "../Socket.js";

/******************************************************************************
*                         INTERFACES & CONSTANTS                              *
******************************************************************************/

export const gameConst = {
    PLAYGROUND_WIDTH: 600,
    PLAYGROUND_HEIGHT: 400,
    PADDLE_MOVE_SPEED: 10,
    PADDLE_HEIGHT: 100,
    PADDLE_WIDTH: 10,
    PADDLE_OFFSET: 10,
};

export interface PuckPos {
    x: number;
    y: number;
}

export interface PuckDir {
    x: number;
    y: number;
}

export interface Puck {
    puckPos: PuckPos;
    puckDir: PuckDir;
}

export interface Paddle {
    leftPos: number;
    rightPos: number;
}

export interface Score {
    left: number;
    right: number;
}

export interface Nickname {
    left: string;
    right: string;
}

export enum ROLE {
    Left,
    Right,
    Undefined,
}

// export interface Room {
//     name: string;
//     role: ROLE;
// }

/******************************************************************************
*                                   GAME                                      *
******************************************************************************/

const Game: React.FC = () => {
    const [paddle, setPaddle] = useState<Paddle>({ leftPos: gameConst.PLAYGROUND_HEIGHT / 2, rightPos: gameConst.PLAYGROUND_HEIGHT / 2});
    const [score, setScore] = useState<Score>({ left: 0, right: 0});
    const [puckPos, setPuckPos] = useState<PuckPos>({ x: gameConst.PLAYGROUND_WIDTH / 2, y: gameConst.PLAYGROUND_HEIGHT / 2 });
    const [puckDir, setPuckDir] = useState<PuckDir>({ x: 0, y: 0 });
    const [roomName, setRoomName] = useState<string | null>(null);
    const [role, setRole] = useState<ROLE>(ROLE.Undefined);
    const [nickname, setNickname] = useState<Nickname>({ left: "", right: ""});

    const [AskReady, setAskReady] = useState(false);

    const canvasRef = useRef<any>(null);

    const socket = useContext(SocketContext);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Puck",
                ({
                    puckPos,
                    puckDir,
                }: Puck) => {
                    setPuckPos(puckPos);
                    setPuckDir(puckDir);
                    //render animation from here for optimization
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Puck");
        }
        }, [roomName]);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Score",
                ({
                    left,
                    right,
                }: Score) => {
                    setScore({ left: left, right: right});
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Puck");
        }
        }, [roomName]);
    
    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Paddle",
                ({
                    leftPos,
                    rightPos
                }: Paddle) => {
                    setPaddle({ leftPos: leftPos, rightPos: rightPos});
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Paddle");
        };
    }, [roomName]);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Room",
                ({
                    name,
                    role,
                    leftNickname,
                    rightNickname
                }: Room) => {
                    setRoomName(name);
                    setRole(role);
                    setNickname({ left: leftNickname, right: rightNickname});
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Room");
        };
    }, []);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "AreYouReady",
                () => {
                    console.log("Are you ready ?");
                    setAskReady(true);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Ready");
        };
    }, []);

    /******************************************************************************
    *                              KEYS HANDLING                                  *
    ******************************************************************************/

    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (event.type === 'keydown') {
                if (event.key === 'ArrowUp') {
                    console.log("----ROOM NAME----");
                    console.log(roomName);
                    console.log(role);
                    socket?.emit('keys', { action: 'upPressed', roomName : roomName, role : role });
                }
                if (event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'downPressed', roomName : roomName, role : role });
                }
            } 
            else if (event.type === 'keyup') {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'released', roomName : roomName, role : role });
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyPress);
        };
    }, [roomName]);

    /******************************************************************************
    *                               GAME OPTIONS                                  *
    ******************************************************************************/

    const playWithRobot = () => {
        console.log('****ROBOT****');
        socket?.emit('robot', { action: 'robot' });
    };
    
    const playDefaultGame = () => {
        console.log('****DEFAULT****');
        socket?.emit('default', { action: 'default' });
    };
    
    const playUpgradedGame = () => {
        console.log('****UPGRADED****');
        socket?.emit('upgraded', { action: 'upgraded' });
    };

    const IAmReady = () => {
        console.log('****READY****');
        console.log("-ROOM NAME-")
        console.log(roomName);
        console.log("-ROOM ROLE-")
        console.log(role);
        socket?.emit('ready', { roomName: roomName });
        setAskReady(false);
    };

    /******************************************************************************
    *                                GAME CANVA                                   *
    ******************************************************************************/

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctxt = canvas.getContext("2d");
          if (ctxt) {
            canvas.width = gameConst.PLAYGROUND_WIDTH;
            canvas.height = gameConst.PLAYGROUND_HEIGHT;
    
            // background canvas white
            ctxt.fillStyle = "white";
            ctxt.fillRect(0, 0, canvas.width, canvas.height);
    
            // black border
            ctxt.strokeStyle = "black";
            ctxt.lineWidth = 3;
            ctxt.setLineDash([]);
            ctxt.strokeRect(0, 0, canvas.width, canvas.height);
    
            // dashed divider line
            ctxt.setLineDash([23, 14.7]);
            ctxt.beginPath();
            ctxt.moveTo(canvas.width / 2, 0);
            ctxt.lineTo(canvas.width / 2, canvas.height);
            ctxt.stroke();
    
            // both paddles
            // ctxt.fillStyle = "#262f69"; --> color for bonus
            ctxt.fillStyle = "black";
            ctxt.fillRect(10, paddle.leftPos - gameConst.PADDLE_HEIGHT / 2, gameConst.PADDLE_WIDTH, gameConst.PADDLE_HEIGHT);
            // ctxt.fillStyle = "#482669"; --> color for bonus
            ctxt.fillRect(
              canvas.width - gameConst.PADDLE_WIDTH - gameConst.PADDLE_OFFSET,
              paddle.rightPos - gameConst.PADDLE_HEIGHT / 2,
              gameConst.PADDLE_WIDTH,
              gameConst.PADDLE_HEIGHT,
            );
    
            // puck
              ctxt.fillStyle = "black";
              ctxt.fillRect(
                puckPos.x - gameConst.PADDLE_WIDTH / 2,
                puckPos.y - gameConst.PADDLE_WIDTH / 2,
                gameConst.PADDLE_WIDTH,
                gameConst.PADDLE_WIDTH,
              );

            // scores
            ctxt.font = "50px 'Calibri', bold";
            ctxt.fillStyle = "black";
            ctxt.textAlign = "center";
            ctxt.textBaseline = "top";
            ctxt.fillText(score.left, canvas.width * 0.25, 20);
            ctxt.fillText(score.right, canvas.width * 0.75, 20);

            // nicknames
            ctxt.font = "20px 'Calibri', bold";
            ctxt.fillStyle = "black";
            ctxt.textAlign = "center";
            ctxt.textBaseline = "bottom";
            ctxt.fillText(nickname.left, canvas.width * 0.25, 20);
            ctxt.fillText(nickname.right, canvas.width * 0.75, 20);

          }
        }
      }, [paddle, puckPos, puckDir, score, AskReady]);

    return (
        <div>
            
            <p>Game is working!</p>

            <div>

            </div>
            
                <canvas ref={canvasRef} width={600} height={400}></canvas>
            
            <div>
                <button onClick={playWithRobot}>Robot</button>
                <button onClick={playDefaultGame}>Default</button>
                <button onClick={playUpgradedGame}>Upgraded</button>
                {AskReady && 
                    (<button onClick={IAmReady}>Ready</button>)
                }
            </div>

        </div>
    );
};

export default Game;

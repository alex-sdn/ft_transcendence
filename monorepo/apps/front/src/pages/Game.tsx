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

export enum OPTION {
    Robot,
    Retro,
    CoolCat,
    WeirdCrowd,
}

/******************************************************************************
*                                   GAME                                      *
******************************************************************************/

const Game: React.FC = () => {
    const [paddle, setPaddle] = useState<Paddle>({ leftPos: gameConst.PLAYGROUND_HEIGHT / 2, rightPos: gameConst.PLAYGROUND_HEIGHT / 2 });
    const [score, setScore] = useState<Score>({ left: 0, right: 0 });
    const [puckPos, setPuckPos] = useState<PuckPos>({ x: gameConst.PLAYGROUND_WIDTH / 2, y: gameConst.PLAYGROUND_HEIGHT / 2 });
    const [puckDir, setPuckDir] = useState<PuckDir>({ x: 0, y: 0 });
    const [roomName, setRoomName] = useState<string | null>(null);
    const [role, setRole] = useState<ROLE>(ROLE.Undefined);
    const [nickname, setNickname] = useState<Nickname>({ left: "", right: "" });

    const [gameOption, setGameOption] = useState<OPTION>(OPTION.Retro);

    const [AskOption, setAskOption] = useState(true);

    const [AskReady, setAskReady] = useState(false);

    const [Countdown, setCountdown] = useState(false);

    const [GameEnd, setGameEnd] = useState(false);

    const [Count, setCount] = useState<number>(0);

    const [LogOut, setLogOut] = useState(false);

    const [ScreenIssue, setScreenIssue] = useState(false);

    const canvasRef = useRef<any>(null);

    const socket = useContext(SocketContext);

    useEffect(() => {
        if (socket) {
            socket.on(
                "Puck",
                ({
                    puckPos,
                    puckDir,
                }: Puck) => {
                    setPuckPos(puckPos);
                    setPuckDir(puckDir);
                    // render animation from here for optimization
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Puck");
        }
    }, [roomName]);

    useEffect(() => {
        if (socket) {
            socket.on(
                "Score",
                ({
                    left,
                    right,
                }: Score) => {
                    setScore({ left: left, right: right });
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Puck");
        }
    }, [roomName]);

    useEffect(() => {
        if (socket) {
            socket.on(
                "Paddle",
                ({
                    leftPos,
                    rightPos
                }: Paddle) => {
                    setPaddle({ leftPos: leftPos, rightPos: rightPos });
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Paddle");
        };
    }, [roomName]);

    useEffect(() => {
        if (socket) {
            socket.on(
                "Room",
                ({
                    name,
                    role,
                    leftNickname,
                    rightNickname, 
                }: any) => {
                    setRoomName(name);
                    setRole(role);
                    setNickname({ left: leftNickname, right: rightNickname });
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Room");
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on(
                "AreYouReady",
                () => {
                    console.log("Are you ready ?");
                    setAskReady(true);
                    setAskOption(false);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("AreYouReady");
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on(
                "LogOut",
                () => {
                    console.log("Oops, your competitor has just logged out...");
                    setLogOut(true);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("LogOut");
        };
    }, [roomName]);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Countdown",
                (nbr: number) => {
                    if(nbr === 4)
                        setCountdown(false);                    
                    else
                        setCountdown(true);
                    setCount(nbr);                
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Countdown");
        };
    }, [roomName]);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "GameEnd",
                () => {
                    setGameEnd(true);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("GameEnd");
        };
    }, [roomName]);

    /******************************************************************************
    *                              KEYS HANDLING                                  *
    ******************************************************************************/

    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (event.type === 'keydown') {
                if (event.key === 'ArrowUp') {
                    socket?.emit('keys', { action: 'upPressed', roomName: roomName, role: role });
                }
                if (event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'downPressed', roomName: roomName, role: role });
                }
            }
            else if (event.type === 'keyup') {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'released', roomName: roomName, role: role });
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
        socket?.emit('robot', { action: 'robot' });
        setGameOption(OPTION.Robot);
        setAskOption(false);
    };
    
    const playRetro = () => {
        socket?.emit('retro', { action: 'retro' });
        setGameOption(OPTION.Retro);
        setAskOption(false);
    };
    
    const playCoolCat = () => {
        socket?.emit('coolCat', { action: 'coolCat' });
        setGameOption(OPTION.CoolCat);
        setAskOption(false);
    };

    const playWeirdCrowd = () => {
        socket?.emit('weirdCrowd', { action: 'weirdCrowd' });
        setGameOption(OPTION.WeirdCrowd);
        setAskOption(false);
    };

    const IAmReady = () => {
        console.log('front emit READY');
        socket?.emit('ready', { roomName: roomName });
        setAskReady(false);
        setAskOption(false);
    };

    /******************************************************************************
    *                               INITIALIZATION                                *
    ******************************************************************************/

    const NewGame = () => {

        // clean all in back
        socket?.emit('clean', { roomName: roomName });

        // init all in front
        setPaddle({ leftPos: gameConst.PLAYGROUND_HEIGHT / 2, rightPos: gameConst.PLAYGROUND_HEIGHT / 2 });
        setScore({ left: 0, right: 0 });
        setPuckPos({ x: gameConst.PLAYGROUND_WIDTH / 2, y: gameConst.PLAYGROUND_HEIGHT / 2 });
        setPuckDir({ x: 0, y: 0 });
        setRoomName(null);
        setRole(ROLE.Undefined);
        setNickname({ left: "", right: "" });
        setAskReady(false);
        setLogOut(false);
        setGameOption(OPTION.Retro);
        setAskOption(true);
        setScreenIssue(false);
        setCountdown(false);
        setCount(0);
        setGameEnd(false);
    };

    /******************************************************************************
    *                               SCREEN SIZE                                   *
    ******************************************************************************/

    useEffect(() => {

        const handleResize = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
                    
            if (viewportWidth < 600 || viewportHeight < 400) {
                setScreenIssue(true);
            }
            else {
                setScreenIssue(false);
            }

        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
            ctxt.font = "50px 'Orbitron', bold";
            ctxt.fillStyle = "black";
            ctxt.textAlign = "center";
            ctxt.textBaseline = "top";
            ctxt.fillText(score.left, canvas.width * 0.25, 20);
            ctxt.fillText(score.right, canvas.width * 0.75, 20);

            // nicknames
            ctxt.font = "20px 'Orbitron', bold";
            ctxt.fillStyle = "black";
            ctxt.textAlign = "center";
            ctxt.textBaseline = "bottom";
            ctxt.fillText(nickname.left, canvas.width * 0.25, 20);
            ctxt.fillText(nickname.right, canvas.width * 0.75, 20);
          }
        }
    }, [paddle, puckPos, puckDir, score, AskReady, LogOut]);

    return (
        <div>
            <div>

                {AskOption && (
                <div>
                    <button onClick={playWithRobot}>Human vs Machine</button>
                    <button onClick={playRetro}>Retro Pong Game</button>
                    <button onClick={playCoolCat}>Cool Cat Version</button>
                    <button onClick={playWeirdCrowd}>Weird Crowd Edition</button>
                </div>)
                }

                {AskReady &&
                    (<button onClick={IAmReady}>Ready</button>)
                }

                {Countdown && 
                    (<div> 
                        {Count}
                    </div>)
                }

                {!AskOption && !AskReady && !ScreenIssue && !Countdown && (Count >=4 ) &&
                (<div>            
                    <canvas id="responsive-canvas" ref={canvasRef}></canvas>
                </div>)
                }
                
                {ScreenIssue && 
                    (<div>Please increase the size of your screen. The minimum required is: 600 * 400. Thank you!</div>)
                }

                {LogOut &&
                    (<div>Oops, your competitor has just logged out... So you've just won!</div>)
                }

                {LogOut &&
                    (<button onClick={NewGame}>New Game</button>)
                }

                {GameEnd &&
                    (<button onClick={NewGame}>New Game</button>)
                }

            </div>

        </div>
    );
};

export default Game;

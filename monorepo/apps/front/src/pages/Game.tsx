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
    //BALL_RADIUS: 6,
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

export enum ROLE {
    Left,
    Right,
    Undefined,
}

export interface Room {
    name: string;
    role: ROLE;
}

/******************************************************************************
*                                   GAME                                      *
******************************************************************************/

const Game: React.FC = () => {
    const [paddle, setPaddle] = useState<Paddle>({ leftPos: gameConst.PLAYGROUND_HEIGHT / 2, rightPos: gameConst.PLAYGROUND_HEIGHT / 2});
    const [score, setScore] = useState<Score>({ left: 0, right: 0});
    const [puckPos, setPuckPos] = useState<PuckPos>({ x: gameConst.PLAYGROUND_WIDTH / 2, y: gameConst.PLAYGROUND_HEIGHT / 2 });
    const [puckDir, setPuckDir] = useState<PuckDir>({ x: 0, y: 0 });
    const [room, setRoom] = useState<Room>({ name: "", role: ROLE.Undefined });

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
                    //console.log("PUCK");
                    //render animation from here for optimization
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Puck");
        }
        }, []);

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
        }, []);
    
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
                    console.log("PADDLE");
                    console.log(paddle.leftPos);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Paddle");
        };
    }, []);

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
                    console.log("PADDLE");
                    console.log(paddle.leftPos);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Paddle");
        };
    }, []);

    useEffect(() => {
        if (socket)
        {
            socket.on(
                "Room",
                ({
                    name,
                    role
                }: Room) => {
                    setRoom({ name: name, role: role});
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Room");
        };
    }, []);

    /******************************************************************************
    *                              KEYS HANDLING                                  *
    ******************************************************************************/

    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (event.type === 'keydown') {
                if (event.key === 'ArrowUp') {
                    socket?.emit('keys', { action: 'upPressed' });
                }
                if (event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'downPressed' });
                }
                if (event.key === ' ') {
                    socket?.emit('gameStart', { action: 'gameStart' });
                }
            } 
            else if (event.type === 'keyup') {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    socket?.emit('keys', { action: 'released' });
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyPress);
        };
    }, []);

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
        socket?.emit('ready', { action: 'ready' });
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
            //ctxt.fillStyle = "#262f69";
            ctxt.fillStyle = "black";
            ctxt.fillRect(10, paddle.leftPos - gameConst.PADDLE_HEIGHT / 2, gameConst.PADDLE_WIDTH, gameConst.PADDLE_HEIGHT);
            //ctxt.fillStyle = "#482669";
            ctxt.fillRect(
              canvas.width - gameConst.PADDLE_WIDTH - gameConst.PADDLE_OFFSET,
              paddle.rightPos - gameConst.PADDLE_HEIGHT / 2,
              gameConst.PADDLE_WIDTH,
              gameConst.PADDLE_HEIGHT,
            );
    
            // puck
            //if (!isWaiting) {
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
            //}
          }
        }
      }, [paddle, puckPos, puckDir, score]);

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
                <button onClick={IAmReady}>IAmReady</button>
            </div>

        </div>
    );
};

export default Game;

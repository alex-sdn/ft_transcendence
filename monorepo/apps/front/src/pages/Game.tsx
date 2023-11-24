import React, { useContext, useEffect, useState, useRef } from 'react';
import SocketContext from "../Socket.js";

/******************************************************************************
*                         INTERFACES & CONSTANTS                              *
******************************************************************************/

let intervalId: any;

export const gameConst = {
    PLAYGROUND_WIDTH: 600,
    PLAYGROUND_HEIGHT: 400,
    PADDLE_MOVE_SPEED: 10,
    PADDLE_HEIGHT: 100,
    PADDLE_WIDTH: 10,
    BALL_RADIUS: 6,
};

export interface PuckPos {
    x: number;
    y: number;
}

export interface PuckDir {
    x: number;
    y: number;
}

//export interface PaddlePos {
//    y: number;
//    ychange: number;
//}

export interface Puck {
    puckPos: PuckPos;
    puckDir: PuckDir;
}

export interface Paddle {
    leftPos: number;
    rightPos: number;
}

/******************************************************************************
*                                   GAME                                      *
******************************************************************************/

const Game: React.FC = () => {
    const [paddle, setPaddle] = useState<Paddle>({ leftPos: gameConst.PLAYGROUND_HEIGHT / 2, rightPos: gameConst.PLAYGROUND_HEIGHT / 2});;
    //const [rightPos, setRightPos] = useState<PaddlePos>({ y: gameConst.PLAYGROUND_HEIGHT / 2, ychange: 0 });;
    const [puckPos, setPuckPos] = useState<PuckPos>({ x: gameConst.PLAYGROUND_WIDTH / 2, y: gameConst.PLAYGROUND_HEIGHT / 2 });
    const [puckDir, setPuckDir] = useState<PuckDir>({ x: 0, y: 0 });

    const canvasRef = useRef(null);

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
                    //render animation
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
                    console.log(paddle.leftPos);
                    //console.log(leftPos.y);
                    //leftPos.y += leftPos.ychange;
                    //leftPos.y = constrain(leftPos.y, gameConst.PADDLE_HEIGHT / 2, gameConst.PLAYGROUND_HEIGHT - gameConst.PADDLE_HEIGHT / 2);
                }
            );
        }
        return () => {
            if (socket)
                socket.off("Paddle");
        };
    }, []);

    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (event.type === 'keydown') {
                if (event.key === 'ArrowUp') {
                    socket?.emit('userAction', { action: 'upPressed' });
                    //leftPos.ychange = -10;
                }
                if (event.key === 'ArrowDown') {
                    socket?.emit('userAction', { action: 'downPressed' });
                    //leftPos.ychange = 10;
                }
                if (event.key === ' ') {
                    socket?.emit('gameStart', { action: 'gameStart' });
                }
            } 
            //else if (event.type === 'keyup') {
            //    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            //        socket?.emit('userAction', { action: 'released' });
            //        //leftPos.ychange = 0;
            //    }
            //}
        };
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctxt = canvas.getContext("2d");
          if (ctxt) {
            canvas.width = gameConst.PLAYGROUND_WIDTH;
            canvas.height = gameConst.PLAYGROUND_HEIGHT;
    
            // make background canvas white
            ctxt.fillStyle = "white";
            ctxt.fillRect(0, 0, canvas.width, canvas.height);
    
            // draw a black border
            ctxt.strokeStyle = "black";
            ctxt.lineWidth = 3;
            ctxt.setLineDash([]);
            ctxt.strokeRect(0, 0, canvas.width, canvas.height);
    
            // draw the dashed divider line
            ctxt.setLineDash([30, 15]);
            ctxt.beginPath();
            ctxt.moveTo(canvas.width / 2, 0);
            ctxt.lineTo(canvas.width / 2, canvas.height);
            ctxt.stroke();
    
            // draw both paddles
            ctxt.fillStyle = "black";
            ctxt.fillRect(40, paddle.leftPos, gameConst.PADDLE_WIDTH, gameConst.PADDLE_HEIGHT);
            ctxt.fillRect(
              canvas.width - gameConst.PADDLE_WIDTH - 40,
              paddle.rightPos,
              gameConst.PADDLE_WIDTH,
              gameConst.PADDLE_HEIGHT,
            );
    
            // draw the ball
            //if (!isWaiting) {
              ctxt.fillStyle = "black";
              ctxt.fillRect(
                puckPos.x - gameConst.PADDLE_WIDTH / 2,
                puckPos.y / 2 - gameConst.PADDLE_WIDTH / 2,
                gameConst.PADDLE_WIDTH,
                gameConst.PADDLE_WIDTH,
              );
            //}
          }
        }
      }, [paddle, puckPos, puckDir]);

    return (
        <div>
            <h1>WebSocket Game Test</h1>
            <div>

            </div>
            <canvas ref={canvasRef} width={600} height={400}></canvas>
        </div>
    );
};

export default Game;
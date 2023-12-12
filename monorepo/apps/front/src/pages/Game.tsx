import React, { useContext, useEffect, useState, useRef } from 'react';
import SocketContext from "../Socket.js";
import Sketch from "react-p5";
import p5Types from "p5";
import { useLocation, redirect } from 'react-router-dom';

/******************************************************************************
*                         INTERFACES & CONSTANTS                              *
******************************************************************************/

const PRECISION = 4;

const DELTAX = 0; //-430
const DELTAY = 0; //-200

export const gameConst = {
    PLAYGROUND_WIDTH: 600 * PRECISION,
    PLAYGROUND_HEIGHT: 400 * PRECISION,
    PADDLE_MOVE_SPEED: 10 * PRECISION,
    PADDLE_HEIGHT: 100 * PRECISION,
    PADDLE_WIDTH: 10 * PRECISION,
    PADDLE_OFFSET: 10 * PRECISION,
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

    const [Count, setCount] = useState<number>(4);

    const [LogOut, setLogOut] = useState(false);

	const [cancelled, setCancelled] = useState<boolean>(false);

    const [ScreenIssue, setScreenIssue] = useState(false);

    const [ThereIsCrowd, setThereIsCrowd] = useState(false);

    const [Coolcat, setCoolcat] = useState(false);

    const [WaitingRoom, setWaitingRoom] = useState(false);

    const [showTextRobot, setShowTextRobot] = useState(false);
    const [showTextRetro, setShowTextRetro] = useState(false);
    const [showTextWeirdCrowd, setShowTextWeirdCrowd] = useState(false);
    const [showTextCoolCat, setShowTextCoolCat] = useState(false);

    const canvasRef = useRef<any>(null);

    const leftEyeCanvasRef = useRef<any>(null);
    const rightEyeCanvasRef = useRef<any>(null);

    const socket = useContext(SocketContext);

    const [backgroundImg, setBackgroundImg] = useState(null);

    const [previousPuckPositions, setPreviousPuckPositions] = useState<PuckPos[]>([]);

	useEffect(() => {
		socket?.on("Cancelled", () => {
            setCancelled(true);
		})
	})

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
                    setAskReady(true);
                    setAskOption(false);
                    setWaitingRoom(false);
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
        if (socket) {
            socket.on(
                "Countdown",
                (nbr: number) => {
                    if (nbr === -1)
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
        if (socket) {
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
                    if (!Coolcat)
                        socket?.emit('keys', { action: 'upPressed', roomName: roomName, role: role });
                }
                if (event.key === 'ArrowDown') {
                    if (!Coolcat)
                        socket?.emit('keys', { action: 'downPressed', roomName: roomName, role: role });
                }
            }
            else if (event.type === 'keyup') {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    if (!Coolcat)
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
        setWaitingRoom(true);
    };

    const playRetro = () => {
        socket?.emit('retro', { action: 'retro' });
        setGameOption(OPTION.Retro);
        setAskOption(false);
        setWaitingRoom(true);
    };

    const playCoolCat = () => {
        socket?.emit('coolcatopt', { action: 'coolcatopt' });
        setGameOption(OPTION.CoolCat);
        setAskOption(false);
        setCoolcat(true);
        setWaitingRoom(true);
    };

    const playWeirdCrowd = () => {
        socket?.emit('weirdCrowd', { action: 'weirdCrowd' });
        setGameOption(OPTION.WeirdCrowd);
        setAskOption(false);
        setThereIsCrowd(true);
        setWaitingRoom(true);
    };

    const IAmReady = () => {
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
        setCount(4);
        setGameEnd(false);
        setCoolcat(false);
        setWaitingRoom(false);
        setThereIsCrowd(false);
		setCancelled(false);
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

                // background canvas black
                ctxt.fillStyle = "black";
                ctxt.fillRect(0, 0, canvas.width, canvas.height);

                // white border
                ctxt.strokeStyle = "white";
                ctxt.lineWidth = 3 * PRECISION;
                ctxt.setLineDash([]);
                ctxt.strokeRect(0, 0, canvas.width, canvas.height);

                // dashed divider line
                ctxt.setLineDash([23 * PRECISION, 14.7 * PRECISION]);
                ctxt.beginPath();
                ctxt.moveTo(canvas.width / 2, 0);
                ctxt.lineTo(canvas.width / 2, canvas.height);
                ctxt.stroke();

                // both paddles
                // ctxt.fillStyle = "#262f69"; --> color for bonus
                ctxt.fillStyle = "white";
                ctxt.fillRect(gameConst.PADDLE_OFFSET, paddle.leftPos - gameConst.PADDLE_HEIGHT / 2, gameConst.PADDLE_WIDTH, gameConst.PADDLE_HEIGHT);
                // ctxt.fillStyle = "#482669"; --> color for bonus
                ctxt.fillRect(
                    canvas.width - gameConst.PADDLE_WIDTH - gameConst.PADDLE_OFFSET,
                    paddle.rightPos - gameConst.PADDLE_HEIGHT / 2,
                    gameConst.PADDLE_WIDTH,
                    gameConst.PADDLE_HEIGHT,
                );

                // puck
                ctxt.fillStyle = "white";
                ctxt.fillRect(
                    puckPos.x - gameConst.PADDLE_WIDTH / 2,
                    puckPos.y - gameConst.PADDLE_WIDTH / 2,
                    gameConst.PADDLE_WIDTH,
                    gameConst.PADDLE_WIDTH,
                );

                // scores
                ctxt.font = "200px 'Orbitron', bold";
                ctxt.fillStyle = "white";
                ctxt.textAlign = "center";
                ctxt.textBaseline = "top";
                ctxt.fillText(score.left, canvas.width * 0.25, 20);
                ctxt.fillText(score.right, canvas.width * 0.75, 20);

                // nicknames
                ctxt.font = "100px 'Orbitron', bold";
                ctxt.fillStyle = "white";
                ctxt.textAlign = "center";
                ctxt.textBaseline = "bottom";
                ctxt.fillText(nickname.left, canvas.width * 0.25, canvas.height - 30);
                ctxt.fillText(nickname.right, canvas.width * 0.75, canvas.height - 30);
            }
        }
    }, [paddle, puckPos, puckDir, score, AskReady, LogOut, ScreenIssue]);

    /******************************************************************************
    *                                CROWD CANVA                                   *
    ******************************************************************************/

    function getPupil(canvas: any, puckX: number, puckY: number) {

        var rect = canvas.getBoundingClientRect();

        var X = puckX - (rect.left + rect.width / 2);
        var Y = puckY - (rect.top + rect.height / 2);
        var XYs = Math.abs(X) + Math.abs(Y);
        var Xr = (XYs == 0) ? 0 : X / (XYs);
        var Yr = (XYs == 0) ? 0 : Y / (XYs);

        var Zm = Math.pow(
            Math.pow(rect.width, 2) +
            Math.pow(rect.height, 2)
            , 0.5);

        var eyelimit = Zm * 2 / Math.PI
        var Z = Zm * 12 / 100 * Math.atan(Math.pow(Math.pow(X, 2) + Math.pow(Y, 2), 0.5) / eyelimit);

        return {
            x: (rect.left + rect.width / 2) +
                0.7 * Math.pow(Math.pow(Z, 2) * Math.abs(Xr), 0.5) *
                ((Xr < 0) ? -1 : 1),
            y: (rect.top + rect.height / 2) +
                0.7 * Math.pow(Math.pow(Z, 2) * Math.abs(Yr), 0.5) *
                ((Yr < 0) ? -1 : 1),
            x2: (rect.left + rect.width / 2) +
                Math.pow(Math.pow(Z, 2) * Math.abs(Xr), 0.5) *
                ((Xr < 0) ? -1 : 1),
            y2: (rect.top + rect.height / 2) +
                Math.pow(Math.pow(Z, 2) * Math.abs(Yr), 0.5) *
                ((Yr < 0) ? -1 : 1)
        };
    }

    function eyeball(canvas: any, coord: any) {

        var rect = canvas.getBoundingClientRect();
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        var grd = context.createRadialGradient(
            coord.x - rect.left, coord.y - rect.top, 40,
            coord.x2 - rect.left, coord.y2 - rect.top, 15);

        if (ThereIsCrowd && !AskOption && !AskReady && !ScreenIssue && !Countdown && (Count <= 0)) {
            grd.addColorStop(0.95, "black");
            grd.addColorStop(0.94, "blue");
            grd.addColorStop(0.41, "blue");
            grd.addColorStop(0.40, "white");
        }

        context.fillStyle = grd;
        context.beginPath();
        context.arc(100, 100, 50, 0, 2 * Math.PI);
        context.fill();
    }

    useEffect(() => {

        const leftCanvas = leftEyeCanvasRef.current;
        const rightCanvas = rightEyeCanvasRef.current;

        eyeball(leftCanvas, getPupil(leftCanvas, puckPos.x + DELTAX, puckPos.y + DELTAY));
        eyeball(rightCanvas, getPupil(rightCanvas, puckPos.x + DELTAX, puckPos.y + DELTAY));

    }, [puckPos]);

    /******************************************************************************
    *                                 COOL CAT                                    *
    ******************************************************************************/

    useEffect(() => {
        setPreviousPuckPositions(prevPositions => [...prevPositions, puckPos]);

        const maxPositions = 10;
        if (previousPuckPositions.length > maxPositions) {
            setPreviousPuckPositions(prevPositions => prevPositions.slice(-maxPositions));
        }
    }, [puckPos]);

    const canvasX = (window.innerWidth - gameConst.PLAYGROUND_WIDTH / 4) / 2;
    const canvasY = (window.innerHeight - gameConst.PLAYGROUND_HEIGHT / 4) / 2;

    function setup(p5: p5Types) {
        p5.createCanvas(gameConst.PLAYGROUND_WIDTH / 4, gameConst.PLAYGROUND_HEIGHT / 4).position(canvasX, canvasY);
    }

    function drawStar(p5: p5Types, x: any, y: any, radius1: any, radius2: any, npoints: any, color: any) {
        let angle = p5.TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        p5.fill(color);
        p5.beginShape();
        for (let a = 0; a < p5.TWO_PI; a += angle) {
            let sx = x + p5.cos(a) * radius2;
            let sy = y + p5.sin(a) * radius2;
            p5.vertex(sx, sy);
            sx = x + p5.cos(a + halfAngle) * radius1;
            sy = y + p5.sin(a + halfAngle) * radius1;
            p5.vertex(sx, sy);
        }
        p5.endShape(p5.CLOSE);
    }

    function draw(p5: p5Types) {

        p5.background(0); // black
        p5.fill(0);
        if (score.left >= 4 || score.right >= 4)
            p5.stroke('blue');
        else
            p5.stroke(255); //white
        p5.rect(0, 0, gameConst.PLAYGROUND_WIDTH / 4, gameConst.PLAYGROUND_HEIGHT / 4);

        p5.noStroke();

        p5.fill(255); // white
        p5.textSize(24);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text(`${score.left} - ${score.right}`, gameConst.PLAYGROUND_WIDTH / 8, 10);

        p5.textFont('Orbitron');
        p5.textSize(16);
        p5.textAlign(p5.CENTER, p5.BOTTOM);
        p5.text(`${nickname.left} - ${nickname.right}`, gameConst.PLAYGROUND_WIDTH / 8, gameConst.PLAYGROUND_HEIGHT / 4 - 10);

        let gradientColor: any;

        // puck or star
        if (score.left >= 2 || score.right >= 2) {
            gradientColor = p5.lerpColor(p5.color(255, 0, 0), p5.color(0, 0, 255), puckPos.x / gameConst.PLAYGROUND_WIDTH);
            if (score.left >= 3 || score.right >= 3)
                drawStar(p5, puckPos.x / 4, puckPos.y / 4, 5, 10, 5, gradientColor);
            else
                drawStar(p5, puckPos.x / 4, puckPos.y / 4, 5, 10, 5, p5.color(255, 255, 255));
        }
        else {
            p5.ellipse(puckPos.x / 4, puckPos.y / 4, 10, 10);
        }

        // traînée filante
        if (score.left >= 5 || score.right >= 5) {
            previousPuckPositions.forEach((position, index) => {
                const alphaValue = p5.map(10 - index, 0, previousPuckPositions.length - 1, 255, 0);
                p5.fill(gradientColor.levels[0], gradientColor.levels[1], gradientColor.levels[2], alphaValue);
                p5.ellipse(position.x / 4, position.y / 4, 20 - index, 20 - index);
            });
        }

        // paddles

        if (score.left >= 6 || score.right >= 6)
            p5.fill('#A251FA'); // violet
        else
            p5.fill(255); // white
        p5.rect(gameConst.PADDLE_OFFSET / 4, paddle.leftPos / 4 - gameConst.PADDLE_HEIGHT / 8, gameConst.PADDLE_WIDTH / 4, gameConst.PADDLE_HEIGHT / 4);
        p5.rect(
            gameConst.PLAYGROUND_WIDTH / 4 - gameConst.PADDLE_WIDTH / 4 - gameConst.PADDLE_OFFSET / 4,
            paddle.rightPos / 4 - gameConst.PADDLE_HEIGHT / 8,
            gameConst.PADDLE_WIDTH / 4,
            gameConst.PADDLE_HEIGHT / 4
        );


        if (p5.keyIsPressed) {
            if (p5.keyCode == p5.UP_ARROW) {
                socket?.emit('coolcat', { action: 'upPressed', roomName: roomName, role: role });
            } else if (p5.keyCode == p5.DOWN_ARROW) {
                socket?.emit('coolcat', { action: 'downPressed', roomName: roomName, role: role });
            }
        }
    }

    return (
        <div>
            <div>
                {Coolcat && !AskOption && !AskReady && !ScreenIssue && !Countdown && !LogOut && (Count <= 0) &&
                    <Sketch setup={setup} draw={draw} />
                }
                {AskOption && (
                    <div className="button-container">
                        <div className="button-wrapper"
                            onClick={playWithRobot}
                            onMouseEnter={() => setShowTextRobot(true)}
                            onMouseLeave={() => setShowTextRobot(false)}
                        >
                            <button className="robot-button" />
                            {AskOption && showTextRobot &&
                                <div className="info-text">
                                    <p><b> HUMAN VS MACHINE </b></p>
                                    <p>All alone?</p>
                                    <p>Our robot will always </p>
                                    <p>be there for you!</p>
                                </div>
                            }
                        </div>

                        <div className="button-wrapper"
                            onClick={playRetro}
                            onMouseEnter={() => setShowTextRetro(true)}
                            onMouseLeave={() => setShowTextRetro(false)}
                        >
                            <button className="retro-button" />
                            {AskOption && showTextRetro &&
                                <div className="info-text">
                                    <p><b> RETRO MODE </b></p>
                                    <p>Try our original version of pong</p>
                                    <p>as it was played in the 70s</p>
                                    <p>by Allan Alcorn himself!</p>
                                </div>
                            }
                        </div>

                        <div className="button-wrapper"
                            onClick={playCoolCat}
                            onMouseEnter={() => setShowTextCoolCat(true)}
                            onMouseLeave={() => setShowTextCoolCat(false)}
                        >
                            <button className="coolcat-button" />
                            {AskOption && showTextCoolCat &&
                                <div className="info-text">
                                    <p><b> COOL CAT EDITION </b></p>
                                    <p>Wanna play it cool?</p>
                                    <p>Try a smoother version of pong</p>
                                    <p>with some surprises along the way...</p>
                                </div>
                            }
                        </div>

                        <div className="button-wrapper"
                            onClick={playWeirdCrowd}
                            onMouseEnter={() => setShowTextWeirdCrowd(true)}
                            onMouseLeave={() => setShowTextWeirdCrowd(false)}
                        >
                            <button className="weirdcrowd-button" />
                            {AskOption && showTextWeirdCrowd &&
                                <div className="info-text">
                                    <p> <b>WEIRD CROWD VERSION </b></p>
                                    <p>What would be a tennis match</p>
                                    <p>without its weird crowd</p>
                                    <p>following the ball</p>
                                </div>
                            }
                        </div>
                    </div>)
                }

                {AskReady && !cancelled &&
                    <button className="ready-button"
                        onClick={IAmReady}
                    >
                        Ready
                    </button>
                }

                {Countdown && (Count != 0) &&
                    (<div id="countdown">
                        {Count}
                    </div>)
                }

                {Countdown && (Count == 0) &&
                    (<div id="countdown">
                        FIGHT !
                    </div>)
                }

                {!Coolcat && !AskOption && !AskReady && !ScreenIssue && !Countdown && !LogOut && (Count <= 0) &&
                    (<div id="retro">
                        <canvas id="responsive-canvas" ref={canvasRef}></canvas>
                    </div>)
                }

                {
                    WaitingRoom && (gameOption != OPTION.Robot) &&
                    (<div id="waiting">WAITING ROOM
                        <img src="waitingroom.png" />
                    </div>)
                }

                {ScreenIssue &&
                    (<div style={{ textAlign: 'center' }}>Please increase the size of your screen. The minimum required is: 600 * 400. Thank you!</div>)
                }

				{cancelled && 
					(<div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', fontSize: '30px' }}>Oops, your competitor just cancelled the match...</div>)
				}

                {LogOut &&
                    (<div style={{ textAlign: 'center' }}>Oops, your competitor has just logged out... So you've just won!</div>)
                }

                {LogOut &&
                    (<div className='you-won' id="countdown">
                        You won !
                    </div>)
                }

                {GameEnd &&
                    (((score.left > score.right) && role == ROLE.Left) ||
                        ((score.right > score.left) && role == ROLE.Right)) &&
                    (<div className='you-won' id="countdown">
                        You won !
                    </div>)
                }

                {GameEnd &&
                    (((score.left < score.right) && role == ROLE.Left && !LogOut) ||
                        ((score.right < score.left) && role == ROLE.Right && !LogOut)) &&
                    (<div className='you-lost' id="countdown">
                        You lost !
                    </div>)
                }


                {(LogOut || GameEnd || cancelled) &&
                    (<button className="newgame-button" onClick={NewGame}>New Game</button>)
                }

                {true &&
                    (<div id="crowdContainer">
                        <canvas id="leftEyeCanvas" width="200" height="200" ref={leftEyeCanvasRef}>
                        </canvas>
                        <canvas id="rightEyeCanvas" width="200" height="200" ref={rightEyeCanvasRef}>
                        </canvas>
                    </div>)
                }

            </div>

        </div >
    );
};

export default Game;

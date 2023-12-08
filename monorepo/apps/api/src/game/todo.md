TO DO:

URGENT:
- [X] : math of game
- [X] : handle lags (info sent 1000/60 frames) --> setInterval -> do it the other way around from front to back [BALL OK / PADDLE OK] --> was a socket transforming into http long polling issue OK
- [X] : print scores on screen
- [X] : socket room / waiting room
- [X] : send results of game to db for profiles (+ achievements + status in game)
- [X] : handle deconnection + clean end of game / init + what if switch page during game --> raise the question of socket subspace
- [X] : responsive screen
- [ ] : extra features (upgraded option)
- [ ] : check if front send good room name
- [ ] : when game starts --> withdraw user from all waiting lists

NOT URGENT:
- [ ] : timeout / lag --> OK but what if fake timeout created on purpose in back ? --> ping pong method
- [ ] : robot
- [ ] : set countdown
- [ ] : maths optimization (render animation + canva by entities + better keys handling)
- [X] : admin-ui socket
- [X] : CORS (check if problem with sockets)
- [X] : check file change weird detection ("File change detected. Starting incremental compilation...") --> cors ? npm prebuild ? --> getaround --> npm run start
- [O] : redis / redux --> learn about web socket adapter
- [ ] : improve front with bootstrap, modals, props, etc
- [ ] : upgrade design of game (p5js)
- [X] : compare features with original pong

WITH ALEX :
- [X] : add achievements
- [X] : create robot user

WITH SOLENE & ALEX :
- [X] : send & receive invitation from chat

WITH SOLENE :
- [X] : .css

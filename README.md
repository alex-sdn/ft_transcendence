# ft_transcendence

A website for playing Pong online!

## Stack
- **Frontend:** React TS + Vite
- **Backend:** NestJS
- **Database:** PostgreSQL (using Prisma)

## Features
- Play an online game of Pong against random players through matchmaking, invite friends to a private game, or train against a Robot.
- Customize your profile and visit other players' profiles to see their match history, stats, achievements, and add them as friends.
- Chat in group channels with public / private / protected access and administrator commands (kick, ban, mute, block, invite), or in private DMs.
- Authenticate through 42's API with 2FA for added security.

## Tools
### Swagger

Visualize the structure of our API at `http://localhost:3000/api`

### Prisma Studio

Visualize and edit the database by running `npx prisma studio` (need to open the 5555 port in the docker-compose.yml)

## How to run
Launch with docker using `docker-compose up --build` (.env needed)

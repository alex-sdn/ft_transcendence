# ft_transcendence

### run back+front locally:

Inside monorepo/ folder:

- in monorepo/apps/api/.env set DATABASE_URL as LOCAL_URL
- `npm run db:up` to launch DB container
- `npm run dev` to launch api & client
- `npm run db:stop` to stop container or `npm run db:down` to delete
- IF missing dependencies: `npm install`
- IF "ERROR @prisma/client" -> `cd apps/api && npx prisma generate`


### run all in docker network:

Root folder:

- in monorepo/apps/api/.env set DATABASE_URL as DOCKER_URL
- `docker-compose up --build -d` to launch all
- `docker-compose stop` to stop or `docker-compose down` to delete

(volume broken for live dev /!\)

## TOOLS

### DBDIAGRAM.IO 

aim: visualize our database relationship diagrams
- in monorepo/apps/api/ npx prisma generate (or if you're lazy make prisma)
- copy paste the content of the generated file api/prisma/dbml/schema.dbml in https://dbdiagram.io/

### PRISMA STUDIO

aim: visual editor of database
- in monorepo/apps/api/ npx prisma studio (or make studio)
(localhost:5555 in browser won't work)

### SWAGGER

aim: visualize all our API's resources
- in your browser, "http://localhost:3000/api"

### SOCKET.IO ADMIN UI

aim: visualize statistics of sockets connection
- add following code in your WebsocketGateway:
> afterInit() {
    instrument(this.server, {
        auth: false,
        mode: "development",
    });
}
- go to https://admin.socket.io/#/ and fill Server URL with "http://localhost:3000"
- then Advanced options > WebSocket only

### INSOMNIA

aim: send test requests

### JWT.IO

aim: decode JWT
- go to https://jwt.io/ and copy paste your token

### PRETTIER / ESLINT

aim: code formatters
- in vs code, on any .ts file, do "ctrl+shift+P" then "Format Document"

### CADDY

aim: caddy server can be used as a scalable reverse proxy

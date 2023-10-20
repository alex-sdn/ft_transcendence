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
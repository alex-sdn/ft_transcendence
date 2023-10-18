# ft_transcendence

**run back+front locally:**

Inside monorepo/ folder:

- `npm run db:up` to launch DB container
- `npm run dev` to launch api & client
- `npm run db:stop` to stop container or `npm run db:down` to delete


**run all in docker network** (volume broken)

Root folder:

- `docker-compose up --build -d` to launch all
- `docker-compose down` to stop or `docker-compose down` to delete
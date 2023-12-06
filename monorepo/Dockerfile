FROM node:20

WORKDIR /app

COPY . .

WORKDIR ./monorepo
# RUN rm -rf ./monorepo/node_modules
# RUN npm install
# RUN npm install turbo --global

# WORKDIR ./apps/api
# RUN npm install

# WORKDIR ../front
# RUN npm install

# WORKDIR ../../
RUN npm install

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]
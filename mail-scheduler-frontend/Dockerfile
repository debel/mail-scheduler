FROM node:lts

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY src /app/src
COPY public /app/public

CMD ["npm", "run", "start"]
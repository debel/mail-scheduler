FROM node:lts

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY config /app/config
COPY src /app/src

CMD ["npm", "run", "start"]
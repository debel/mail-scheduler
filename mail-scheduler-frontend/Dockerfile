FROM node@lts

WORKDIR = /app

COPY package.json /app
COPY package-lock.json /app

COPY src /app
COPY public /app

CMD ["npm", "install"]

CMD ["npm", "run", "build"]

ENTRYPOINT ["npm", "run", "start"]
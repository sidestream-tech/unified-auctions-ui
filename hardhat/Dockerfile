FROM node:16.9.1 as dependency-base

ENV APP_ROOT /app

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . ${APP_ROOT}

RUN npm ci

EXPOSE 8545

CMD [ "npm", "run", "dev" ]

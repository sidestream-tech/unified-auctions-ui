FROM node:16.9.1 as dependency-base

ENV APP_ROOT /hardhat

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

COPY ./frontend/hardhat/package.json .
COPY ./frontend/hardhat/package-lock.json .
RUN npm ci

COPY . ${APP_ROOT}

EXPOSE 8545

CMD [ "npm", "run", "dev" ]

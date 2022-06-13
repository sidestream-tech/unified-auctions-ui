ARG NODE_VERSION=node:16.9.1

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /hardhat

# copy the core, note .dockerignore
WORKDIR /hardhat
COPY ./hardhat/package.json .
COPY ./hardhat/package-lock.json .

COPY ./core /core

RUN npm ci

COPY ./frontend /frontend

FROM $NODE_VERSION AS development

COPY --from=dependency-base /hardhat /hardhat

WORKDIR /hardhat
EXPOSE 8545
CMD ["npm", "run", "dev"]

# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.9.1

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /core

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .
COPY ./core /core

RUN npm ci

FROM $NODE_VERSION AS development

ARG REMOTE_RPC_URL
ENV REMOTE_RPC_URL=${REMOTE_RPC_URL}
ARG LOCAL_RPC_URL
ENV LOCAL_RPC_URL=${LOCAL_RPC_URL}

COPY --from=dependency-base /core /core

WORKDIR /core

CMD [ "npm", "run", "test"]

FROM $NODE_VERSION AS hardhat
ARG REMOTE_RPC_URL
ENV REMOTE_RPC_URL=${REMOTE_RPC_URL}
COPY --from=dependency-base /core /core
WORKDIR /core
CMD [ "npm", "run", "hardhat"]

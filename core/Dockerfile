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

ARG ALCHEMY_URL
ENV ALCHEMY_URL=${ALCHEMY_URL}
ARG NETWORK
ENV NETWORK=${NETWORK}
ARG NETWORK_HOST
ENV NETWORK_HOST=${NETWORK_HOST}
ARG NETWORK_POST
ENV NETWORK_POST=${NETWORK_POST}

COPY --from=dependency-base /core /core

WORKDIR /core

CMD [ "npm", "run", "test", "${NETWORK_HOST}" ]

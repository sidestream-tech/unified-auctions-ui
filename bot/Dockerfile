# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.9.1

# FROM segment/chamber:2.10.7 AS chamber

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /core
RUN mkdir -p /bot

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .

# copy the app, note .dockerignore
WORKDIR /bot
COPY ./bot/package.json .
COPY ./bot/package-lock.json .

WORKDIR /core
COPY ./core /core

WORKDIR /bot
RUN npm ci

COPY ./bot /bot

FROM $NODE_VERSION AS development

# COPY --from=chamber /chamber /bin/chamber
COPY --from=dependency-base /core /core
COPY --from=dependency-base /bot /bot

# WORKDIR /bot
# CMD chamber exec $SECRET_CHAMBER_PATH -- npm run dev

FROM dependency-base AS production-base

WORKDIR /bot
RUN npm run build

FROM $NODE_VERSION AS production

# COPY --from=chamber /chamber /bin/chamber
COPY --from=production-base /core /core
COPY --from=production-base /bot /bot

# Service hostname
ENV NUXT_HOST=0.0.0.0

# start the app
WORKDIR /bot
# CMD chamber exec $SECRET_CHAMBER_PATH -- npm start
CMD ["npm", "start"]

# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.9.1

FROM segment/chamber:2.10.7 AS chamber

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /notification-service

# copy the app, note .dockerignore
WORKDIR /notification-service
COPY ./notification-service/package.json .
COPY ./notification-service/package-lock.json .

WORKDIR /notification-service
RUN npm ci

COPY ./notification-service /notification-service

FROM $NODE_VERSION AS development

COPY --from=chamber /chamber /bin/chamber
COPY --from=dependency-base /notification-service /notification-service

WORKDIR /notification-service
CMD chamber exec $SECRET_CHAMBER_PATH -- npm run dev

FROM dependency-base AS production-base

WORKDIR /notification-service
RUN npm run build

FROM $NODE_VERSION AS production

COPY --from=chamber /chamber /bin/chamber
COPY --from=production-base /notification-service /notification-service

# start the app
WORKDIR /notification-service
CMD chamber exec $SECRET_CHAMBER_PATH -- npm start

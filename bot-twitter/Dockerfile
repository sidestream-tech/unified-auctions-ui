# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.9.1

FROM segment/chamber:2.10.7 AS chamber

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /core
RUN mkdir -p /bot-twitter

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .

# copy the app, note .dockerignore
WORKDIR /bot-twitter
COPY ./bot-twitter/package.json .
COPY ./bot-twitter/package-lock.json .

FROM dependency-base AS development-base

WORKDIR /core
RUN npm ci

WORKDIR /bot-twitter
RUN npm ci

COPY ./core /core
COPY ./bot-twitter /bot-twitter

FROM $NODE_VERSION AS development

COPY --from=chamber /chamber /bin/chamber
COPY --from=development-base /core /core
COPY --from=development-base /bot-twitter /bot-twitter

WORKDIR /bot-twitter
CMD ["chamber", "exec", "auction-ui/bot/dev", "--", "npm", "run", "dev"]

FROM dependency-base AS production-base

WORKDIR /core
RUN npm ci --production

# do not use `--production` for bot-twitter as it relies on
# devDependency `@nuxt/typescript-build` to run `npm run generate` below
WORKDIR /bot-twitter
RUN npm ci


COPY ./core /core
COPY ./bot-twitter /bot-twitter

# generate will also take care of building
# if necessary
WORKDIR /bot-twitter
RUN npm run generate

FROM $NODE_VERSION AS production

COPY --from=chamber /chamber /bin/chamber
COPY --from=production-base /core /core
COPY --from=production-base /bot-twitter /bot-twitter

# Service hostname
ENV NUXT_HOST=0.0.0.0

# start the app
WORKDIR /bot-twitter
CMD ["chamber", "exec", "auction-ui/bot/production", "--", "npm", "start" ]

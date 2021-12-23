FROM node:16.9.1 AS dependency-base

# create destination directory
RUN mkdir -p /core
RUN mkdir -p /bot-twitter

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .
RUN npm ci

# copy the app, note .dockerignore
WORKDIR /bot-twitter
COPY ./bot-twitter/package.json .
COPY ./bot-twitter/package-lock.json .
RUN npm ci

FROM dependency-base AS production-base

# do not bake env variables

# generate will also take care of building
# if necessary
COPY ./core /core
COPY ./bot-twitter .
RUN npm run generate

FROM production-base AS production

# Service hostname
ENV NUXT_HOST=0.0.0.0

# start the app
CMD [ "npm", "start" ]

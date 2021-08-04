FROM node:14-alpine AS dependency-base

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the app, note .dockerignore
COPY package.json .
COPY package-lock.json .
RUN npm ci

FROM dependency-base AS production-base

# Set server origin
ARG SERVER_ORIGIN
ENV SERVER_ORIGIN=${SERVER_ORIGIN}

# generate will also take care of building
# if necessary
COPY . .
RUN npm run generate

FROM production-base AS production

# Service hostname
ENV NUXT_HOST=0.0.0.0

# start the app
CMD [ "npm", "start" ]

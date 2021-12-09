FROM node:16.9.1 AS dependency-base

# create destination directory
RUN mkdir -p /core
RUN mkdir -p /frontend

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .
RUN npm ci

# copy the app, note .dockerignore
WORKDIR /frontend
COPY ./frontend/package.json .
COPY ./frontend/package-lock.json .
RUN npm ci

FROM dependency-base AS production-base

# bake env variables
ARG INFURA_PROJECT_ID
ENV INFURA_PROJECT_ID=${INFURA_PROJECT_ID}
ARG PRODUCTION_DOMAIN
ENV PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN}
ARG CONTACT_EMAIL
ENV CONTACT_EMAIL=${CONTACT_EMAIL}

# generate will also take care of building
# if necessary
COPY ./core /core
COPY ./frontend .
RUN npm run generate

FROM production-base AS production

# Service hostname
ENV NUXT_HOST=0.0.0.0

# start the app
CMD [ "npm", "start" ]

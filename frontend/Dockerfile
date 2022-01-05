# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.9.1

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /core
RUN mkdir -p /frontend

# copy the core, note .dockerignore
WORKDIR /core
COPY ./core/package.json .
COPY ./core/package-lock.json .

# copy the app, note .dockerignore
WORKDIR /frontend
COPY ./frontend/package.json .
COPY ./frontend/package-lock.json .

FROM dependency-base AS development-base

WORKDIR /core
RUN npm ci

WORKDIR /frontend
RUN npm ci

FROM $NODE_VERSION AS development

COPY --from=development-base /core /core
COPY --from=development-base /frontend /frontend

COPY ./core /core
COPY ./frontend /frontend

WORKDIR /frontend
CMD ["npm", "run", "dev"]

FROM dependency-base AS production-base

WORKDIR /core
RUN npm ci --production

# the frontend needs `@nuxt/typescript-build` which technically is
# a development only dependency
WORKDIR /frontend
RUN npm ci

# bake env variables
ARG INFURA_PROJECT_ID
ENV INFURA_PROJECT_ID=${INFURA_PROJECT_ID}
ARG PRODUCTION_DOMAIN
ENV PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN}
ARG CONTACT_EMAIL
ENV CONTACT_EMAIL=${CONTACT_EMAIL}

COPY ./core /core
COPY ./frontend /frontend

# generate will also take care of building
# if necessary
WORKDIR /frontend
RUN npm run generate

FROM nginx:stable-alpine AS production

COPY --from=production-base /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

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

WORKDIR /core
COPY ./core /core

WORKDIR /frontend
RUN npm ci

COPY ./frontend /frontend

FROM $NODE_VERSION AS development

COPY --from=dependency-base /core /core
COPY --from=dependency-base /frontend /frontend

WORKDIR /frontend
CMD ["npm", "run", "dev"]

FROM cypress/included:9.5.1 AS e2e

ARG CYPRESS_FRONTEND_URL
ENV CYPRESS_FRONTEND_URL=${CYPRESS_FRONTEND_URL}
ARG CYPRESS_NETWORK
ENV CYPRESS_NETWORK=${CYPRESS_NETWORK}

COPY --from=dependency-base /core /core
COPY --from=dependency-base /frontend /frontend
EXPOSE 3000
WORKDIR /frontend
RUN npm install


ENTRYPOINT [ "/bin/sh" ]

FROM dependency-base AS production-base

# bake env variables
ARG INFURA_PROJECT_ID
ENV INFURA_PROJECT_ID=${INFURA_PROJECT_ID}
ARG PRODUCTION_DOMAIN
ENV PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN}
ARG CONTACT_EMAIL
ENV CONTACT_EMAIL=${CONTACT_EMAIL}
ARG STAGING_BANNER_URL
ENV STAGING_BANNER_URL=${STAGING_BANNER_URL}
ARG DEFAULT_ETHEREUM_NETWORK
ENV DEFAULT_ETHEREUM_NETWORK=${DEFAULT_ETHEREUM_NETWORK}
ARG HEAPIO_ID
ENV HEAPIO_ID=${HEAPIO_ID}

WORKDIR /frontend
RUN npm run generate

FROM nginx:stable-alpine AS production

COPY --from=production-base /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

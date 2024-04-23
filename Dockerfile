# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-slim as base

EXPOSE 8080

LABEL fly_launch_runtime="Backer Upper"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

COPY ./src ./src
COPY ./package.json ./package.json

# Install pnpm
ARG PNPM_VERSION=9.0.4
RUN npm install -g pnpm@$PNPM_VERSION
RUN npm install -g sanity@latest
RUN npm install

COPY --from=denoland/deno:bin-1.42.4 /deno /usr/local/bin/deno


# Throw-away build stage to reduce size of final image
FROM base as build


# Start the server by default, this can be overwritten at runtime
CMD [ "deno",  "run", "--allow-env", "--allow-write", "--allow-net", "--allow-run",  "/app/src/main.ts" ]

# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:24-alpine

# must be root to prepare the directories; this command is implied, but being explicit for clarity
USER root

# install curl
RUN apk add --no-cache curl

# set working directory to monorepo root
WORKDIR /app

# change owner to node user
RUN chown node:node /app

# If you mount a local folder in your compose.yaml, the host's permissions will overwrite whatever you did in the Dockerfile. To avoid permission issues, you can pre-create the .next directory and set the owner to `node` user. This way, when the container runs as non-root, it will have the necessary permissions to write to that directory.

# pre-create the directory and set the owner to `node` user to ensure it is writable when the container runs as non-root
RUN mkdir -p /app/apps/web/.next && chown -R node:node /app/apps/web/.next

USER node

# copy package*.json
COPY --chown=node:node ./package*.json eslint.config.ts ./

# copy app-specific package*.json
COPY /apps/web/package*.json ./apps/web/

# # (Optional) copy shared package metadata
# COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

# copy the rest of the source code, ensuring the ownership is set to node user 
COPY --chown=node:node . ./

# expose the port Next.js runs on during development
EXPOSE 3000

# set working directory to app-specific folder
WORKDIR /app/apps/web

# Now next dev runs correctly relative to its own package.json

# run the Next.js app in development mode from its own package.json
# TODO: consider running from root instead using the root package.json scripts, especially after a potential transition to `pnpm` and/or `turbo` (Turborepo)
CMD ["npm", "run", "dev"]

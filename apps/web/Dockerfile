# Use a specific Node.js version base image for stability

# --- BASE STAGE (shared) ---
FROM node:24-alpine AS base

# NOTE: `USER root` is implied in most environments, but add it if need be in the future

# Change working directory to /app
WORKDIR /app

# TODO: is this only needed for local dev? maybe not needed in CI?
# If you mount a local folder in your compose.yaml, the host's permissions will overwrite whatever you did in the Dockerfile. To avoid permission issues, you can pre-create the .next directory and set the owner to `node` user. This way, when the container runs as non-root, it will have the necessary permissions to write to that directory.
# Pre-create the .next directory and set the owner to `node` user to ensure it is writable when the container runs as non-root
RUN mkdir -p /app/apps/web/.next && chown -R node:node ./apps/web/.next

# Install curl
RUN apk add --no-cache curl

# Copy package files early to leverage layer caching
COPY --chown=node:node package*.json ./
COPY --chown=node:node ./apps/web/package.json ./apps/web

# # change owner to node user ... needed? this is from original Dockerfile, but if we are running as root, then it may not be necessary; however, if we switch to non-root user later, then it may be necessary to ensure the correct permissions for the app directory
# RUN chown node:node /app

# --- DEV-LOCAL STAGE (for local dev only) ---
FROM base AS dev-local

# install dependencies as node user
RUN npm install

# switch to non-root user for better security
USER node

# expose the port Next.js runs on during development
EXPOSE 3000

# command to run the Next.js app in development mode with the workspace flag to specify the webapp
CMD ["npm", "run", "dev", "-w", "apps/web"]

# --- DEV-CI STAGE (for testing dev container in CI only) ---
FROM base AS dev-ci

# we need to copy the files below in CI because we aren't mounting them  due to a permissions issue (see `volumes` in `compose.ci.yaml`)
COPY --chown=node:node ./apps/web/. ./apps/web

# Use a specific Node.js version base image for stability

# --- BASE STAGE (shared) ---
FROM node:24-alpine AS base

# NOTE: `USER root` is implied in most environments, but add it if need be in the future

# Install curl
RUN apk add --no-cache curl

# Change working directory to /app
WORKDIR /app

# change owner to node user
RUN chown node:node .

# TODO: is this only needed for local dev? maybe not needed in CI?
# If you mount a local folder in your compose.base.yaml, the host's permissions will overwrite whatever you did in the Dockerfile. To avoid permission issues, you can pre-create the .next directory and set the owner to `node` user. This way, when the container runs as non-root, it will have the necessary permissions to write to that directory.
# Pre-create the .next directory and set the owner to `node` user to ensure it is writable when the container runs as non-root
RUN mkdir -p ./apps/web/.next && chown -R node:node ./apps/web/.next
# # Also do this for the generated types directory in node_modules, which is needed for Chakra UI to work properly; without this, Docker may not be able to write to this directory when running as non-root, which can cause issues with Chakra UI's styled-system types
# RUN mkdir -p ./node_modules/@chakra-ui/react/dist/types/styled-system/generated/ && chown -R node:node ./node_modules/@chakra-ui/react/dist/types/styled-system/generated/

# # change owner to node user ... needed? this is from original Dockerfile, but if we are running as root, then it may not be necessary; however, if we switch to non-root user later, then it may be necessary to ensure the correct permissions for the app directory
# RUN chown node:node /app

# --- DEV-LOCAL STAGE (for local dev only) ---
FROM base AS dev-local

# switch to non-root user for better security
USER node

# Copy root and webapp package*.json and install dependencies as node user
COPY --chown=node:node ./package*.json .
COPY --chown=node:node ./apps/web/package.json ./apps/web
RUN npm install

# expose the port Next.js runs on during development
EXPOSE 3000

# command to run the Next.js app in development mode with the workspace flag to specify the webapp
# TODO: to truly test, we try to run `dev` script in webapp, but this is failing:
# CMD ["npm", "run", "dev", "-w", "apps/web"]
# FIXME: get the above working
# Instead, we run only `next-dev` for now:
CMD ["npm", "run", "next-dev", "-w", "apps/web"]

# --- DEV-CI STAGE (for testing dev container in CI only) ---
FROM dev-local AS dev-ci

# we need to copy the files below in CI because we aren't mounting them due to a permissions issue (see `volumes` in `compose.ci.yaml`)
COPY --chown=node:node ./apps/web/. ./apps/web

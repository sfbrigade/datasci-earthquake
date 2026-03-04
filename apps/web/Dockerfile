#Dockerfile for next.js

# Use a specific Node.js version base image for stability
FROM node:24-alpine

# Must be root to prepare the directories; this command is implied, but being explicit for clarity
USER root

# Install curl
RUN apk add --no-cache curl

WORKDIR /app

# change owner to node user
RUN chown node:node /app


# If you mount a local folder in your compose.yaml, the host's permissions will overwrite whatever you did in the Dockerfile. To avoid permission issues, you can pre-create the .next directory and set the owner to `node` user. This way, when the container runs as non-root, it will have the necessary permissions to write to that directory.

# Pre-create the directory and set the owner to `node` user to ensure it is writable when the container runs as non-root
RUN mkdir -p /app/.next && chown -R node:node /app/.next

USER node

# # Copy root package files into the target root folder
# COPY --chown=node:node ./package*.json ./

# # Copy package*.json, next-env.d.ts from root folder
# COPY --chown=node:node ./package*.json ./next-env.d.ts ./
# Copy app-specific package files from webapp folder
# This matches the monorepo structure inside the container
COPY --chown=node:node ./apps/web/package.json ./apps/web/package-lock.json /app

# Run install from the app folder

RUN chown -R node:node /app

RUN npm install

# Copy the rest of the application, ensuring the ownership is set to node user 
COPY --chown=node:node ./apps/web/. /app

# Expose the port Next.js runs on during development
EXPOSE 3000

# Command to run the Next.js app in development mode
# This command should correspond to the "dev" script in your package.json

CMD ["npm", "run", "next-dev"]

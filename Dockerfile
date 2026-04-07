# syntax=docker/dockerfile:1

#Dockerfile for next.js

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

RUN echo 'taketake0' && npm config get cache
RUN echo 'taketake00' && ls -la /home/node
RUN echo 'taketake000' && ls -la /home/node/.npm
RUN echo 'turnturn' && getent passwd 1000
RUN sudo chown -R 1000:1000 "/home/node/.npm"

RUN echo 'swing0' && ls -la /home/node
RUN echo 'swing00' && ls -la /home/node/.npm

# Copy package*.json and install dependencies, as node user
COPY --chown=node:node ./package*.json ./
#RUN npm install
RUN --mount=type=cache,target=/home/node/.npm npm install

# Copy the rest of the application, ensuring the ownership is set to node user 
COPY --chown=node:node . ./

# Expose the port Next.js runs on during development
EXPOSE 3000

# Command to run the Next.js app in development mode
# This command should correspond to the "dev" script in your package.json
CMD ["npm", "run", "next-dev"]

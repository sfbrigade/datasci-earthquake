# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:24-alpine

# Install curl
RUN apk add --no-cache curl

# Create a non-privileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy package.json, install dependencies, fix ownership
COPY ./package*.json ./
RUN npm install
 
RUN echo 'listing 1...' && ls -l 
RUN chown -R appuser:appgroup /app

RUN echo 'listing 2...' && ls -l 
# Copy the rest of the application 
COPY . .

# Ensure writable build dirs
RUN mkdir -p .next 
RUN echo 'listing 3...' && ls -l 
RUN chown -R appuser:appgroup /app
RUN echo 'listing 4...' && ls -l 

# Switch to the non-privileged user
USER appuser

EXPOSE 3000

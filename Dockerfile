# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:18-alpine

# Install curl
RUN apk add --no-cache curl

# Create a non-privileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy package.json, install dependencies, fix ownership
COPY ./package*.json ./
RUN npm install && chown -R appuser:appgroup /app

# Copy the rest of the application code and fix ownership
COPY --chown=appuser:appgroup . .

# Ensure writable build dirs
RUN mkdir -p .next && chown -R appuser:appgroup /app

# Switch to the non-privileged user
USER appuser

EXPOSE 3000

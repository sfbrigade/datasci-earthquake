# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:18-alpine

# Install curl
RUN apk add --no-cache curl

# Create a non-privileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy package.json and install dependencies
COPY ./package*.json ./
RUN npm install

# Copy the rest of the application code
COPY --chown=appuser:appgroup . .
RUN mkdir -p .next && chmod -R 777 .next
# Switch to the non-privileged user
USER appuser

EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "next-dev"]

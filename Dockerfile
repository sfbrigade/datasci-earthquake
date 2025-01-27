# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:22-alpine

WORKDIR /app

# Create a non-privileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json and install dependencies
COPY ./package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .


# Change ownership of the app files
RUN chown -R appuser:appgroup /app

# Switch to the non-privileged user
USER appuser

EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]   

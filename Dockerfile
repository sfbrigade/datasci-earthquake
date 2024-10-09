# syntax=docker/dockerfile:1

#Dockerfile for next.js

FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

WORKDIR /

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]
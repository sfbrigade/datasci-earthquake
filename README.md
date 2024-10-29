### This is a project of SF Civic Tech [https://www.sfcivictech.org/](https://www.sfcivictech.org/)


<p align="center">
  <a href="https://nextjs-fastapi-starter.vercel.app/">
    <img src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" height="96">
    <h3 align="center">Next.js FastAPI Starter</h3>
  </a>
</p>

<p align="center">Simple Next.js boilerplate that uses <a href="https://fastapi.tiangolo.com/">FastAPI</a> as the API backend.</p>

<br/>

## Introduction

This is a hybrid Next.js + Python app that uses Next.js as the frontend and FastAPI as the API backend. One great use case of this is to write Next.js apps that use Python AI libraries on the backend.

## How It Works

The Python/FastAPI server is mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/digitros/nextjs-fastapi/blob/main/next.config.js) to map any request to `/api/:path*` to the FastAPI API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:8000` port, which is where the FastAPI server is running.

In production, the FastAPI server is hosted as [Python serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python) on Vercel.

## Demo

https://nextjs-fastapi-starter.vercel.app/

## Deploy Your Own

You can clone & deploy it to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdigitros%2Fnextjs-fastapi%2Ftree%2Fmain)

## Developing Locally

You can clone & create this repo with the following command

```bash
npx create-next-app nextjs-fastapi --example "https://github.com/digitros/nextjs-fastapi"
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

***
# Docker
This project uses Docker and Docker Compose to run the application, which includes the frontend, backend, and postgres database.

## Prerequisites

- **Docker**: Make sure Docker is installed on your machine. [Get Docker](https://docs.docker.com/get-docker/).
- **Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop). 

## Starting the Application

1. **Run Docker Compose**: From the project root directory (where the docker-compose.yml file is located), run:
   ```docker-compose up -d```
This will:
- Build the necessary Docker images (if not already built).
- Start all services defined in the docker-compose.yml file (e.g., frontend, backend, database).

2.  **Access the Application**:
    - The app is running at http://localhost:3000.
    - The API is accessible at http://localhost:8000.
    - The Postgres instance is accessible at http://localhost:5432.

## Shutting Down the Application
To stop and shut down the application:

1.  **Stop Docker Compose**: In the same directory where the `docker-compose.yml` file is located, press `Ctrl + C` in the terminal where the app is running.

2.  **Bring Down the Containers**: If you want to stop and remove the containers completely, run:
    ```docker-compose down```
    This will:
    -   Stop all services.
    -   Remove the containers, but it will **not** delete volumes (so the database data will persist).

***
# Configuration of environment variables 
The ```.env.local``` file contains environment variables used in the application to configure settings for both the backend and frontend components. If it contains sensitive information, ```.env.local``` should not be checked into version control for security reasons. Right now there is no sensitive information but later secret management tools will be introduced. 
The file is organized into three main sections:
  - **Postgres Environment Variables**. This section contains the credentials to connect to the PostgreSQL database, such as the username, password, and the name of the database.  
  - **Backend Environment Variables**. These variables are used by the backend (e.g., FastAPI) to configure its behavior and to connect to the database and the frontend application.
  - **Frontend Environment Variables**. This section contains the base URL for API calls to the backend and ```NODE_ENV``` variable that determines in which environment the Node.js application is running. 

***
# Disclaimer
#### Some versions of this code contain a streamlit app that uses an imprecise measure which may introduce errors in the output. The streamlit app should not be relied upon to determine any property’s safety or compliance with the soft story program. Please consult DataSF for most up to date information.
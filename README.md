### This is a project of SF Civic Tech [https://www.sfcivictech.org/](https://www.sfcivictech.org/)

## Introduction

This is a hybrid Next.js + Python app that uses Next.js as the frontend and FastAPI as the API backend. 

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
# Black Linter with Pre-Commit Hook
This repository uses Black, the Python code formatter, to enforce code style standards. The pre-commit hook ensures that Black formats Python code before each commit, helping maintain code consistency across the project.

## Prerequisites

- If you haven't already, install pre-commit:
 ```pip install pre-commit```
- Run the following command to install the pre-commit hooks defined in the configuration file ```.pre-commit-config.yaml```:
  ```pre-commit install```
  This command sets up pre-commit to automatically run Black before each commit.

## Usage
- **Running Black Automatically**: After setup, every time you attempt to commit code, Black will check the staged files and apply formatting if necessary. If files are reformatted, the commit will be stopped, and you’ll need to review the changes before committing again.  
- **Bypassing the Hook**: If you want to skip the Black pre-commit hook for a specific commit, use the --no-verify flag with your commit command:
```git commit -m "your commit message" --no-verify```

  **Note**: The ```--no-verify``` flag is helpful in cases where you need to make a quick commit without running the pre-commit   
  checks,   but it should be used sparingly to maintain code quality. CI pipeline will fail during ```push``` and ```pull request``` actions if the code is not formatted. 
- **Running Black Manually**: If you want to check or format files without committing, you can run:
```black <your-python-file-or-directory>```
- **Running Pre-commit on All Files**: If you want to format all files in the repository, use:
```pre-commit run --all-files```

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
  - **Backend Environment Variables**. These variables are used by the backend (i.e., FastAPI) to configure its behavior and to connect to the database and the frontend application.
  - **Frontend Environment Variables**. This section contains the base URL for API calls to the backend and ```NODE_ENV``` variable that determines in which environment the Node.js application is running. 

***
# Disclaimer
#### Some versions of this code contain a streamlit app that uses an imprecise measure which may introduce errors in the output. The streamlit app should not be relied upon to determine any property’s safety or compliance with the soft story program. Please consult DataSF for most up to date information.
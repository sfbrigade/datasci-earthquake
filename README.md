### This is a project of SF Civic Tech [https://www.sfcivictech.org/](https://www.sfcivictech.org/)

# Introduction

This is a hybrid Next.js + Python app that uses Next.js as the frontend and FastAPI as the API backend. It also uses PostgreSQL as the database.

# Getting Started

You can work on this app [locally](#local-development), [using Docker](#development-with-docker), or a [combination of the two](#hybrid-development).

---

## Local development

### Prerequisites

- **PostgreSQL**: Ensure PostgreSQL is installed if you want to run the database locally (instead of in a Docker container).

### Starting the Application

If you choose to work locally, do the following:

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

The FastAPI server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

---

## Development with Docker

This project uses Docker and Docker Compose to run the application, which includes the frontend, backend, and postgres database.

### Prerequisites

- **Docker**: Make sure Docker is installed on your machine. [Get Docker](https://docs.docker.com/get-docker/).
- **Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop).

### Starting the Application

1. **Run Docker Compose**: From the project root directory (where the docker-compose.yml file is located), run:
   `docker compose up -d`
   This will:

- Build the necessary Docker images (if not already built).
- Start all services defined in the docker-compose.yml file (e.g., frontend, backend, database).

2.  **Access the Application**:

    - The app is running at http://localhost:3000. Note that this may conflict with your local dev server. If so, one will be running on port 3000 and the other on port 3001.
    - The API is accessible at http://localhost:8000.
    - The Postgres instance with PostGIS extension is accessible at http://localhost:5432.
    - To interact with a running container, use `docker exec [OPTIONS] CONTAINER COMMAND [ARG...]`
      - To run a database query, run `docker exec -it my_postgis_db psql -U postgres -d qsdatabase`
      - To execute a python script, run `docker exec -it datasci-earthquake-backend-1 python <path/to/script>`

    **Note:** If you modify the `Dockerfile` or other build contexts (e.g., `.env`, `requirements.txt`, `package.json`), you should run `docker compose up -d --build` to rebuild the images and apply the changes! You do not need to restart `npm run fast-api dev` when doing so.

### Shutting Down the Application

To stop and shut down the application:

1.  **Stop Docker Compose**: Type `docker compose stop`.

2.  **Bring Down the Containers**: If you want to stop and remove the containers completely, run:
    `docker compose down`
    This will:

    - Stop all services.
    - Remove the containers, but it will **not** delete volumes (so the database data will persist).

    **Note:** If you want to start with a clean slate and remove all data inside the containers, run `docker compose down -v`.

### Troubleshooting

1. You can find the list of running containers (their ids, names, status and ports) by running `docker ps -a`.
2. If a container failed, start troublshooting by inspecting logs with `docker logs <container-id>`.
3. Containers fail when their build contexts were modified but the containers weren't rebuilt. If logs show that some dependencies are missing, this can be likely solved by rebuilding the containers.
4. Many problems are caused by disk usage issues. Run `docker system df` to show disk usage. Use pruning commands such as `docker system prune`to clean up unused resources.
5. `Error response from daemon: network not found` occurs when Docker tries to use a network that has already been deleted or is dangling (not associated with any container). Prune unused networks to resolve this issue: `docker network prune -f`. If this doesn't help, run `docker system prune`.

### Running unit tests with Docker

#### Backend

1. First update code and/or rebuild any containers as necessary. Otherwise you may get false results.
2. Run the containers (`docker compose up -d)`
3. Run pytest: `docker compose run backend pytest backend`
   - Alternatively, run pytest with container cleanup: `docker compose run --remove-orphans backend pytest backend`
4. To get code coverage, run `docker exec -w /backend datasci-earthquake-backend-1 pytest --cov=backend`

---

## Hybrid development

If you will be working exclusively on the front end or back end, you can run the Docker containers for the part of the stack you won't be doing development on. A handful of NPM scripts have been provided to make this a bit easier.

### Prerequisites

- **Docker**: Make sure Docker is installed on your machine. [Get Docker](https://docs.docker.com/get-docker/).
- **Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop).
- **PostgreSQL** (optional for back end development): Ensure PostgreSQL is installed if you want to run the database locally (instead of in a Docker container).

### Front end

For front end development, first run `npm install`, and then you can run `npm run dev-front`, which will:

- install dependencies and start up your Next.js development server locally
- build and restart your backend (and database) Docker containers

If you need to rebuild the containers, run `npm run docker-back`.

#### Troubleshooting polygon rendering

If there are issues with layers showing data, you can add the following snippet in `map.tsx` under the other `addLayer()` calls to see outlines of each MultiPolygon:

```js
map.addLayer({
  id: "tsunamiLayerOutline",
  source: "tsunami",
  type: "line",
  paint: {
    "line-color": "rgba(255, 0, 0, 1)",
    "line-width": 4,
  },
});
```

#### Debugging map movement

There is currently a debug flag that can be turned on via query parameter. For now, this flag allows you to play around with map movement. To enable it, simply add `?debug=true` after the URL. This pattern can be used elsewhere too. We could also possibly filter the code out of production builds or use Storybook to get similar functionality in a more methodical way.

### Back end

For back end development, you can run `npm run dev-back`, which will:

- install dependencies and start up your FastAPI server locally
- build and restart your frontend Docker containers

If you need to rebuild the container, run `npm run docker-front`.

NOTE: You will need to run PostgreSQL locally or in a Docker container as well.

### Servers

- The app is running at http://localhost:3000.
- The API is accessible at http://localhost:8000.

---

# Formatting with a Pre-Commit Hook

This repository uses `Black` for Python and `ESLint` for JS/TS to enforce code style standards. We also use `MyPy` to perform static type checking on Python code. The pre-commit hook runs the formatters automatically before each commit, helping maintain code consistency across the project. It works for _only_ the staged files. If you have edited unstaged files in your repository and want to make them comply with the CI pipeline, then run `black .` `mypy .` for Python code and `npm run lint .` for Javascript code.

## Prerequisites

- If you haven't already, install pre-commit:
  `pip install pre-commit`
- Run the following command to install the pre-commit hooks defined in the configuration file `.pre-commit-config.yaml`:
  `pre-commit install`
  This command sets up pre-commit to automatically run ESLint, Black, and MyPy before each commit.

## Usage

- **Running Black Automatically**: After setup, every time you attempt to commit code, Black will check the staged files and apply formatting if necessary. If files are reformatted, the commit will be stopped, and you’ll need to review the changes before committing again.
- **Bypassing the Hook**: If you want to skip the pre-commit hook for a specific commit, use the --no-verify flag with your commit command:
  `git commit -m "your commit message" --no-verify`.

  **Note**: The `--no-verify` flag is helpful in cases where you need to make a quick commit without running the pre-commit checks, but it should be used sparingly to maintain code quality. CI pipeline will fail during the `pull request` action if the code is not formatted.

- **Running Pre-commit on All Files**: If you want to format all files in the repository, use:
  `pre-commit run --all-files`

---

# Configuration of environment variables

We use GitHub Secrets to store sensitive environment variables. To be able to run the app, users will need **write** access to the repository to manually trigger the `Generate .env File` workflow, which creates and uploads an **encrypted** `.env` file as an artifact.

**Note**: Before starting work on the project, make sure to:

1. Get **write** access to the repository.
2. Get the **decryption passphrase** from other devs or in the Slack Engineering channel.
3. Trigger the `Generate .env File` workflow [on the repository's Actions page](https://github.com/sfbrigade/datasci-earthquake/actions) download the artifact. You can trigger the workflow with the `Run workflow` button, navigate to the workflow run page, and find the artifact at the bottom.
4. Decrypt the env file using OpenSSL. In the folder with the artifact, run `openssl aes-256-cbc -d -salt -pbkdf2 -k <YOUR_PASSPHRASE> -in .env.enc -out env` in the terminal. This creates a decrypted file named `env`.
5. Place the decrypted file in the root folder of the project and rename it to `.env`.

The file is organized into three main sections:

- **Postgres Environment Variables**. This section contains the credentials to connect to the PostgreSQL database, such as the username, password, and the name of the database.
- **Backend Environment Variables**. These variables are used by the backend (i.e., FastAPI) to configure its behavior and to connect to the database and the frontend application.
- **Frontend Environment Variables**. This section contains the base URL for API calls to the backend, `NODE_ENV` variable that determines in which environment the Node.js application is running, and the token needed to access Mapbox APIs.

---

# Migrating the Database

If you have changed the models in backend/api/models, then you must migrate the database from its current models to the new ones with the following two commands:

`docker exec -it BACKEND_CONTAINER_NAME bash -c "cd backend && alembic revision --autogenerate -m 'MIGRATION NAME'"`

and

`docker exec -it CONTAINER_NAME bash -c "cd backend && alembic upgrade head"`

where `BACKEND_CONTAINER_NAME` may change with the project and perhaps its deployment but, for local Docker development is `datasci-earthquake-backend-1` and `MIGRATION NAME` is your choice and should describe the migration.

The former command generates a migration script in `backend/alembic/versions`, and the second command runs it.

---

# Git Workflow

## General

Developers should only branch from `develop`, pull updates to `develop`, and ensure their work is merged into `develop` via Pull Requests. `main` is the safe production branch.

## Pull Requests

When opening a pull request, please:

- aim the pull request at the `develop` branch rather than `main`
- add reviewers
- use draft/WIP if it turns out to be not ready for review

Ideally, we maintain a readable, clean, and linear commit history. To that end, when merging a pull request, please use `Squash and Merge`¹.

> ¹ you can optionally use `Rebase and Merge` _if and only if_ the following conditions are met on your branch:
>
> - commits are atomic, no WIP
> - there is more than one commit
> - ideally, there are no more than 3 commits
> - commit messages are useful
>
> NOTE: An interactive rebase (e.g., `git rebase -i`) can help you rewrite your branch's _local_ history to meet the criteria above

# Other resources

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/).

# Disclaimer

#### Some versions of this code contain a streamlit app that uses an imprecise measure which may introduce errors in the output. The streamlit app should not be relied upon to determine any property’s safety or compliance with the soft story program. Please consult DataSF for most up to date information.

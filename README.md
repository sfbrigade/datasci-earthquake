### This is a project of SF Civic Tech [https://www.sfcivictech.org/](https://www.sfcivictech.org/)

# Introduction

This is a hybrid Next.js + Python app that uses Next.js as the frontend and FastAPI as the API backend. It also uses PostgreSQL as the database.

# Getting Started

You can work on this app entirely [locally](#local-development), entirely [using Docker](#development-with-docker), or--if you prefer to focus on front end or back end--a [combination of the two](#hybrid-development).

---

# Setting Up and Using Environments

## Configuration of environment variables for all environments

We use GitHub Secrets to store sensitive environment variables. To be able to run the app with all features enabled, users will need **write** access to the repository to manually trigger the `Generate .env File` workflow, which creates and uploads an **encrypted** `.env` file as an artifact. You can ask a lead or fellow team member for both write access and the decryption passphrase [as described here](#core-contributors).

For additional environment variables just for your local machine, please create a `.env.local` file in the root folder and add the variables there. Note that these will override any variables in `.env` of the same name. An example of an additional environment variable you may need to configure is `BROWSER` [for Storybook](#starting-storybook-component-workshop).

### Contributors working from forks

- If you are contributing from a fork, you do not need to follow the workflow below for core contributors.
- The CI pipeline for forked PRs will automatically use the provided `.env.example`.
- If you don't have `.env`, `.env.example` will be automatically used instead. This allows you to run the app, but with limited functionality (since the real secrets are not included).

### Core contributors

Before starting work on the project, make sure to:

1. Get **write** access to the repository. Accept invitation after you have been invited.
2. Get the **decryption passphrase** from other devs or in the Slack Engineering channel.
3. Navigate to workflow [on the repository's Actions page](https://github.com/sfbrigade/datasci-earthquake/actions)
4. Click on `Generate .env File` workflow
5. Trigger the workflow with the `Run workflow` button.
6. Click on the job to navigate to the workflow run page.
7. Download the artifact at the bottom of the page and unzip.
8. Decrypt the env file using OpenSSL. In the folder with the artifact, run `openssl aes-256-cbc -d -salt -pbkdf2 -k <YOUR_PASSPHRASE> -in .env.enc -out env` in the terminal. This creates a decrypted file named `env`.
9. Place the decrypted file in the root folder of the project and rename it to `.env`.

The file is organized into four main sections:

- **Postgres Environment Variables**. This section contains the credentials to connect to the PostgreSQL database, such as the username, password, and the name of the database.
- **Backend Environment Variables**. These variables are used by the backend (i.e., FastAPI) to configure its behavior and to connect to the database and the frontend application.
- **Frontend Environment Variables**. This section contains the base URL for API calls to the backend, `NODE_ENV` variable that determines in which environment the Node.js application is running, and the token needed to access Mapbox APIs.
- **Monitoring and Analytics Variables**. This section contains variables for Sentry and Posthog.

#### ⚠️ If you add a new variable to the Settings class in the backend, you must also add a dummy value for it in .env.example. Otherwise, PRs from forks will fail, since the CI depends on .env.example when secrets are unavailable.`

---

## Development with Docker

This project uses Docker and Docker Compose to run the application, which includes the frontend, backend, and postgres database.

### Changing code

Docker is configured so that any changes you make should trigger re-compiling by the appropriate service. If the change is not taking, you may need to restart the server, but you do not have to rebuild everything.

### Changing configuration files

This includes `pyproject.toml` and `.env`, and `package.json`. You will need to restart the individual server, but should not have to rebuild everything.

### Prerequisites

- **Docker**: Make sure Docker is installed and running on your machine. [Get Docker](https://docs.docker.com/get-docker/).
- **Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop).

### Starting the application

1. **Build images if not yet created**: From the project root directory (where the compose.yaml file is located), run:
   `docker compose build`

2. **Run Docker Compose**: From the project root directory (where the compose.yaml file is located), run:
   `docker compose up`

   or

   `docker compose up -d`

   This will:

- Start all services defined in the compose.yaml file (e.g., frontend, backend, database)

3. **Access the Application**:
   - The app is running at http://localhost:3000. Note that this may conflict with your local dev server. If so, one will be running on port 3000 and the other on port 3001.
   - The API is accessible at http://localhost:8000.
   - The Postgres instance with PostGIS extension is accessible at http://localhost:5432.
   - To interact with a running container, use `docker exec [OPTIONS] CONTAINER COMMAND [ARG...]`
     - To run a database query, run `docker exec -it my_postgis_db psql -U postgres -d qsdatabase`
     - To execute a python script, run `docker exec -it datasci-earthquake-backend-1 python <path/to/script>`

   **Note:** If you modify the `Dockerfile` or other build contexts (e.g., `.env`, `package.json`), you should run `docker compose up -d --build` to rebuild the images and apply the changes! You do not need to restart `npm run fast-api dev` when doing so.

### Shutting Down the Application

To stop and shut down the application:

1.  **Stop Docker Compose**: Type `docker compose stop`.

2.  **Bring Down the Containers**: If you want to stop and remove the containers completely, run:
    `docker compose down`
    This will:
    - Stop all services.
    - Remove the containers, but it will **not** delete volumes (so the database data will persist).

    **Note:** If you want to start with a clean slate and remove all data inside the containers, run `docker compose down -v`.

### Rebuilding individual servers

Replace <image name> with `datasci-earthquake-frontend`, `datasci-earthquake-backend`, `datasci-earthquake-db` or `datasci-earthquake-db_test`:

`docker compose build <service_name>`

### Starting/stopping individual servers

Replace <service name> with frontend, backend, db, or db_test:

`docker compose up -d <service_name>`
`docker compose stop <service_name>`

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
3. Run pytest to test the docker container: `docker exec -it datasci-earthquake-backend-1 pytest backend` or `docker compose exec backend pytest backend`
4. To get code coverage, run `docker exec -w /backend datasci-earthquake-backend-1 pytest --cov=backend`

---

## Local development

Docker development is recommended as the configuration is more guaranteed.

### Prerequisites

**uv**: Install the uv package manager:

**On macOS/Linux:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**On Windows:**

```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Alternative (all platforms):**

```bash
pip install uv
```

**PostgreSQL**:

1. [Install](https://adoptium.net/) Java 1.8 or later if your PostgreSQL installer requires it (e.g., the EDB installer).
2. [Install](https://www.postgresql.org/download/) PostgreSQL locally with the PostGIS extension, select the PostGIS extension when prompted by the installer.
3. If PostgreSQL was already installed, add the PostGIS extension if not already included

### Starting the Application

#### Backend Setup

**Note**: The backend dependencies are installed automatically when you run the development server (`npm run fastapi-dev`). If you need to run backend commands manually (e.g., running `pytest`), run:

```bash
(cd backend && uv sync --extra dev)
```

To manually activate the virtual environment from the project root, run:

**On macOS/Linux:**

```bash
source backend/.venv/bin/activate
```

**On Windows:**

```cmd
backend\.venv\Scripts\activate
```

#### Frontend Setup

1. Set nvm version:

   ```shell
   nvm use 18
   ```

2. Install the front end dependencies:

   ```shell
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Run the development server:

   ```shell
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastAPI server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

### Troubleshooting

Please refer to [Troubleshooting front end](#troubleshooting-front-end).

---

## Hybrid development

If you will be working exclusively on the front end or back end, you can run the Docker containers for the part of the stack you won't be doing development on, and then run the rest of the stack locally. A handful of NPM scripts have been provided to make this a bit easier (`npm run dev-*` and `npm run docker-*`, described below).

### Accessing the application and API servers

After going through the steps below for either front end-focused or back end-focused development, you should be able to access the servers at the following URLs:

- The app is running at http://localhost:3000, which you can open in your browser.
- The API is accessible at http://localhost:8000.

### Front end-focused development

#### Prerequisites

- **Docker**: Make sure Docker is installed and running on your machine. [Get Docker](https://docs.docker.com/get-docker/).
- **Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop).

#### Starting the app

For front end-focused development, first run `npm install`, and then you can run `npm run dev-front`, which will:

- build and restart your backend (and database) Docker containers
- install dependencies
- start up your Next.js development server locally (on port 3000 by default)
- [start up Storybook](#starting-storybook-component-workshop) locally (on port 6006 in Chrome by default)

If you need to rebuild the containers, run `npm run docker-back`.

If you would prefer to skip starting Storybook, run `npm run dev-front-no-storybook' instead.

#### Starting Storybook (component workshop)

To start up our Storybook component workshop, run `npm run storybook`. This will:

- start up an instance of Storybook in Google Chrome (on port 6006 by default)

If you would like to [use a different browser than Chrome](https://storybook.js.org/docs/configure/environment-variables#using-environment-variables-to-choose-the-browser), then edit your `.env.local` file to include this line where "firefox" is the name of the browser you are targeting:

```env
BROWSER="firefox"
```

For context, when we work on components, we also write [Storybook](https://storybook.js.org) Stories for them so that we can more easily create and document each component in isolation. If you create or edit a component or part of our theme, you will need to create one or more Stories for it if they don't yet exist, or update them if they do.

#### Working with Chakra UI

For UI components, styling, and theming, most initial setup is done via Chakra UI v3 within `theme.ts`. Docs are located at https://chakra-ui.com/. For default theme values, which are automatically used by Chakra along with the overrides in `theme.ts`, you can refer to https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/theme (note that `sizing` is a **superset** of `spacing`). Be aware that there are a lot of out-of-date resources and articles online for Chakra UI v2 that you should ignore in favor of v3.

While doing development, note that style prop autocompletion relies on theme typings generated from [styles/theme.ts], which is where SafeHome's Chakra theme overrides are defined. The overrides are merged with Chakra's default theme to give us the final SafeHome theme. To see a full list of theme values and tokens, check your browser console.

#### Upgrading Node

To upgrade required version of Node, you will need to make edits in the following places as of this writing:

- `.nvmrc`
  - this is used by `.github/actions/setup-node-using-nvmrc/action.yml` which is, in turn, used by the GitHub workflows in `.github/workflows`
- `package.json` (and the resulting `package-lock.json`)
  - `engines`
  - `dependencies`: Change the version for `@types/node` so that its major version matches the version of Node you are upgrading to; minor version and patch version seem to not track exactly
- `Dockerfile`
  - `FROM node:{NODE_MAJOR_VERSION}-alpine` (e.g., `FROM node:24-alpine`)

##### CHAKRA TIP: ACCESSING THEME VALUES

It's not obvious how to see a theme's tokens and values for reference during development. To make this easier and improve the experience, there are two ways you can currently view the theme:

1. Browser console log: While running `npm run dev-front`, on page load, we log the theme as an object to the browser console
2. ~~`theme` folder in your local filesystem: If you run `npm run gen:tokens`, the theme will be outputted to a temporary `theme` folder~~ WARNING: the `gen:tokens` npm script that creates a `theme` folder does not currently work as expected; see related comment in [package.json](package.json)

For autocompletion of theme tokens in JSX, make sure you are running `npm run dev-front`. With this npm script running, theme typings will be regenerated whenever `theme.ts` is modified.

There are plans to introduce a third way of viewing our theme: via Storybook!

##### CHAKRA TIP: STRINGS AS PROP VALUES

Chakra prefers strings as prop values as opposed to numbers.

Instead of:

```
gap={1.5}
```

Use:

```
gap="1.5"
```

##### CHAKRA TIP: SHORTHAND NOTATION

As for shorthand notation (e.g., `"{spacing.4} {spacing.2}"`); see: Chakra's [token reference syntax](https://chakra-ui.com/docs/theming/tokens#token-reference-syntax)), it doesn’t quite work, unfortunately. Although it works in development mode, when `strictTokens` is set to “true” in `theme.ts`, red squiggly lines will appear in the editor and the TypeScript build will fail. The alternative is to not use shorthand at all.

For shorthand notation, (e.g., `"{spacing.4} {spacing.2}"`) appears to trip up the theme typings (seen as red squiggly lines in Visual Studio Code), so please use the array syntax instead:

Instead of this shorthand:

```
// works in dev mode, but build will fail
p="{spacing.8} {spacing.16} {spacing.8} {spacing.16}"
```

Use individual props and single values:

```
// works
py="8"
px="16"
```

---

For responsive props, instead of the aforementioned token reference syntax:

```
// works in dev mode, but build will fail
p={{
  base: "{spacing.6}",
  md: "{spacing.7}",
  lg: "{spacing.7} {spacing.8} {spacing.7} {spacing.8}",
  xl: "{spacing.7} {spacing.9} {spacing.7} {spacing.9]",
}}
```

And instead of trying to convert the shorthand string into an array (will NOT work … only the last value is utilized):

```
// doesn't work at all (only last value of array is used)
p={{
  base: "6",
  md: "7",
  lg: ["7", "8", "7", "8"],
  xl: ["7", "9", "7", "9"],
}}
```

Use individual props combined with prop-based object syntax:

```
// works
pt={{ base: "6", md: "7", lg: "7", xl: "7" }}
pr={{ base: "6", md: "7", lg: "8", xl: "9" }}
pb={{ base: "6", md: "7", lg: "7", xl: "7" }}
pl={{ base: "6", md: "7", lg: "8", xl: "9" }}
```

Which can be simplified to:

```
// works
pt={{ base: "6", md: "7" }}
pr={{ base: "6", md: "7", lg: "8", xl: "9" }}
pb={{ base: "6", md: "7" }}
pl={{ base: "6", md: "7", lg: "8", xl: "9" }}
```

And further simplified to:

```
// works
py={{ base: "6", md: "7" }}
px={{ base: "6", md: "7", lg: "8", xl: "9" }}
```

#### Troubleshooting front end

##### ⚠️ Please do NOT delete `package-lock.json`

The `package-lock.json` file plays a crucial role in ensuring that the exact versions of dependencies installed in `node_modules` remain consistent across different environments.

Deleting this file can lead to unintended side effects, especially when both `package-lock.json` and the `node_modules` folder are removed and then `npm install` is run. In such cases, a new `package-lock.json` will be generated based solely on `package.json`, which might diverge significantly from the committed lock file and cause unexpected behavior or bugs.

In the event of merge conflicts involving `package-lock.json`, please **do not manually fix or delete the file**. Instead, run `npm install` to automatically resolve and repair the lock file.

If you are experimenting locally, you may delete `package-lock.json`, but **make sure not to commit the regenerated file to the repository** to avoid affecting others.

Because `package-lock.json` changes are sometimes overlooked during code reviews, it’s important to pay close attention and avoid accidentally committing problematic versions.

If you face any issues related to `package-lock.json`, please raise them with the team before making changes.

Thank you for helping keep the project stable!

##### Suspense boundary missing around `useSearchParams()`, causing entire page to deopt into client-side rendering (CSR)

You may run into the following NextJS error when you run `npm run build`[^1]:

```shell
useSearchParams() should be wrapped in a suspense boundary at page "/<PAGE_NAME>". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

> [!INFORMATION] > `<PAGE_NAME>` refers to a `page.tsx` file in the app, either the root page at `app/page.tsx` or a non-root page at, for example, `app/<PAGE_NAME>/page.tsx`.

The fix is to wrap any component that references `useSearchParams()` with React's `<Suspense>`. Read further to understand why.

This error message can be highly misleading because it refers directly to `<PAGE_NAME>` even though it's more likely that its `page.tsx` file contains zero usages of `useSearchParams()`[^2]. This can make debugging difficult.

The error doesn't make a distinction between `<PAGE_NAME>` and its descendant components, unfortunately, which is what causes the confusion. If you can't find usages of `useSearchParams()` directly in `page.tsx`, then you can search for usages in its descendant components instead. Once you find a component with a usage, you can [fix the error](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout) by wrapping any references to the component with `<Suspense>` (and, ideally, providing a fallback) and `npm run build` again. More details can be found at https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout.

There may be some instances where a usage of `useSearchParams()` does not appear even in a descendant component, but rather in, say, a provider. And, anecdotally, there may be other hooks that trigger a similar error message. Extensive discussion about several variants of this error message and workarounds can be found in this Github Issue: https://github.com/vercel/next.js/discussions/61654.

[^1]: Note that this error message may be accompanied by the more generic error:

```shell
Error occurred prerendering page "/<PAGE_NAME>". Read more: https://nextjs.org/docs/messages/prerender-error"
```

[^2]: Since most pages will be Server Components, which do not contain a `"use client"` directive, `useSearchParams()` usages are not even allowed

##### MapBox polygon rendering

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

### Back end-focused development (WIP)

> [!CAUTION]
> This section is currently undergoing review and correction. Do not use this method. Instead, please [develop using Docker](#development-with-docker).

#### ~~Prerequisites~~

- ~~**Docker**: Make sure Docker is installed and running on your machine. [Get Docker](https://docs.docker.com/get-docker/).~~
- ~~**Docker Compose**: Ensure Docker Compose is installed (usually included with Docker Desktop).~~
- ~~**PostgreSQL**: Ensure PostgreSQL is installed to run the database locally (instead of in a Docker container).~~

#### ~~Starting the app~~

~~For back end-focused development, you can run `npm run dev-back`, which will:~~

- ~~install dependencies and start up your FastAPI server locally~~
- ~~build and restart your frontend Docker containers~~

~~If you need to rebuild the container, run `npm run docker-front`.~~

~~NOTE: You will need to run PostgreSQL locally or in a Docker container as well.~~

---

# Development Guidelines

## Formatting with a Pre-Commit Hook

This repository uses `Black` for Python and `ESLint` for JS/TS to enforce code style standards. We also use `MyPy` to perform static type checking on Python code. The pre-commit hook runs the formatters automatically before each commit, helping maintain code consistency across the project. It works for _only_ the staged files. If you have edited unstaged files in your repository and want to make them comply with the CI pipeline, then run `black .` `mypy .` for Python code and `npm run lint .` for Javascript code.

### Prerequisites

- Pre-commit is included in the project dependencies and will be installed with `uv sync --extra dev`
- Run the following command to install the pre-commit hooks defined in the configuration file `.pre-commit-config.yaml`:
  ```bash
  pre-commit install
  ```
  This command sets up pre-commit to automatically run ESLint, Black, and MyPy before each commit.

### Usage

- **Running Black Automatically**: After setup, every time you attempt to commit code, Black will check the staged files and apply formatting if necessary. If files are reformatted, the commit will be stopped, and you’ll need to review the changes before committing again.
- **Bypassing the Hook**: If you want to skip the pre-commit hook for a specific commit, use the --no-verify flag with your commit command:
  `git commit -m "your commit message" --no-verify`.

  **Note**: The `--no-verify` flag is helpful in cases where you need to make a quick commit without running the pre-commit checks, but it should be used sparingly to maintain code quality. CI pipeline will fail during the `pull request` action if the code is not formatted.

- **Running Pre-commit on All Files**: If you want to format all files in the repository, use:
  `pre-commit run --all-files`

---

## Migrating the Database

If you have changed the models in backend/api/models, then you must migrate the database from its current models to the new ones with the following two commands:

`docker exec -it BACKEND_CONTAINER_NAME bash -c "cd backend && alembic revision --autogenerate -m 'MIGRATION NAME'"`

and

`docker exec -it CONTAINER_NAME bash -c "cd backend && alembic upgrade head"`

where `BACKEND_CONTAINER_NAME` may change with the project and perhaps its deployment but, for local Docker development is `datasci-earthquake-backend-1` and `MIGRATION NAME` is your choice and should describe the migration.

The former command generates a migration script in `backend/alembic/versions`, and the second command runs it.

---

## Git Workflow

### General

Developers should only branch from `develop`, pull updates from `develop`, and ensure their work is merged into `develop` via Pull Requests. `main` is the safe production branch. Note that both of these "core" branches have [production deployments](#production-deployments) associated with them.

### Branching

#### Branch Names

Branches should follow this format:
```
<type>/<issue-number>-<short-dash-case-issue-title>
```
Where `<type>` is one of: `bugfix`, `feature`, `chore`

Example:
```
chore/54321-example-issue-branching-readme
```
Summarizing longer issue titles is acceptable. 

#### Branch Deletion

Branches are deleted automatically when merged. 
If you have an unmerged branch you do not plan to return to, please delete it to reduce clutter.

### Pull Requests

When opening a pull request, please:

- aim the pull request at the `develop` branch rather than `main`
- optionally, add "Closes `<issue_number>`" in the pull request description to automatically close that issue when the PR is merged
- if you have changed any frontend code or dependencies, run `npm run build` locally to catch potential build errors rather than waiting for CI
- if your changes may affect app behavior, then please test your PR's [preview deployment](#preview-deployments); optionally, you may also want to test the subsequent [production deployment for the `develop` branch](#developsafehomereport) to be thorough, although this is not needed in most cases
- request reviewers

> [!TIP]
> Convert your pull requests to draft status as needed. You can signal to potential reviewers to pause or limit their activity by creating your pull request as a draft (WIP) or converting it to a draft when called for. This can be useful if it turns out your pull request isn't actually ready for review. Examples of relevant scenarios include:
>
> - failed checks
> - a blocking bug that will take extra time to fix
> - you would like eyes on your PR even though it is WIP
>   You can later mark your PR as "Ready for review"

#### Keep your commit history clean

Ideally, we maintain a readable, clean, and linear commit history for easier debugging
and exploration. To that end, when merging a pull request, please use `Squash and Merge`¹.

> ¹ you can optionally use `Rebase and Merge` _if and only if_ the following conditions are met on your branch:
>
> - commits are atomic, no WIP
> - there is more than one commit and none of them are extraneous
> - commit messages are useful
>
> [!NOTE]
> An interactive rebase (e.g., `git rebase -i`) can help you rewrite your branch's _local_ history to meet the criteria above; note that you will then have to force push over your original branch on the remote

<!-- TODO: content above is tailored for authors; consider adding a section for reviewers too -->

### Creating Issues

New issues can be created in the Issues tab using the `New issue` button.

When creating an issue, please:

- use the correct template (default, feature request, bug, etc...)
- add the `SafeHome Project` as a project to the issue. If this is your first issue you will likely need to request access to be added to the project and have write access. You can ask in Slack.
- add the relevant label (front end, back end, etc...) so it can easily be filtered by team

## Deploying the app

### Preview deployments

Preview deployments are temporary sites deployed for pre-merge testing. A preview deployment is based on the source branch within a pull request.

Upon creation of a pull request, the Vercel Github integration will automatically attempt a preview deployment of the source branch. If the preview deployment succeeds, a "View deployment" button will appear directly in the comments and also under "Show environments" at the bottom of the PR's page. Interacting with this button will navigate you to the unique URL for the preview deployment.

### Production deployments

Production deployments are persistent sites deployed when a core branch is updated. The designated "core" branches are `develop` and `main`.

Once a core branch is updated (due to a merge or otherwise), the Vercel Github integration will automatically attempt a production deployment of it. If the production deployment succeeds, its status in Vercel will be updated accordingly and you can navigate to its URL:

- `develop` --> `https://develop.safehome.report` (dev testing)
- `main` --> `https://safehome.report` (user-facing)

Note that these sites also have their own dedicated Vercel URLs in addition to the dedicated domain names above.

#### develop.safehome.report

This production deployment is primarily used for testing integrated code.

To update https://develop.safehome.report, the preferred method is to merge a PR into the `develop` branch to kick off its production deployment. Modifying `develop` directly is not advised and may be blocked as a protected branch.

#### safehome.report

This production deployment is the actual release to the end users.

To update https://safehome.report, the preferred method is to merge a PR from `develop` into `main`. Do not modify `main` directly. It is also a protected branch.

Prior to merging this PR, the `develop` branch is temporarily frozen by an admin while `https://develop.safehome.report` is being tested¹. As soon as testing is done, the PR is approved and the code freeze is lifted.

> ¹ In the future, we may add dedicated release branches into this process to avoid or mitigate code freezes

<!-- TODO: look into adding other deployments like test, prerelease, staging -->

## Releasing the app

To release the app to end users, a pull request with `main` as the target branch is opened. Merging happens after thorough testing by both engineers and non-engineers at which point the app is deployed to https://safehome.report.

For more technical details, refer to the [production deployment notes above](#safehomereport).

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/).

# Disclaimer

#### Some versions of this code contain a streamlit app that uses an imprecise measure which may introduce errors in the output. The streamlit app should not be relied upon to determine any property’s safety or compliance with the soft story program. Please consult DataSF for most up to date information.

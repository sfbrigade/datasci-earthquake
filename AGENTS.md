# SafeHome Agent Guide

This file is the shared baseline for AI coding agents in this repository.

## Project Overview

- Monorepo-style app with a Next.js frontend and FastAPI backend.
- Frontend code lives in `app/`, `components/`, `hooks/`, and `styles/`.
- Backend code lives in `backend/` and root-level `api/`.
- Local orchestration uses npm scripts plus Docker Compose.

## Setup And Run

- Node: 24.13.1 or newer.
- Install frontend dependencies: `npm install`.
- Frontend only: `npm run next-dev`.
- Hybrid frontend workflow (backend in Docker): `npm run dev-front`.
- Full local dev (Next.js + FastAPI): `npm run dev`.
- Backend in Docker: `npm run docker-back`.

## Test And Quality Checks

- Frontend lint: `npm run lint`.
- Frontend tests (Jest): `npm test`.
- Storybook: `npm run storybook`.
- Backend tests (if backend container is running):
  `docker compose exec backend pytest backend`

## Code Change Rules

- Keep edits minimal and scoped to the request.
- Do not reformat unrelated files.
- Preserve existing architecture and naming unless the task requires change.
- Update tests when behavior changes.
- Prefer small, reviewable patches.

## Frontend Conventions

- Use existing Chakra UI v3 patterns and tokens from `styles/theme.ts`.
- Avoid introducing new styling systems unless requested.
- Keep components focused and composable.

## Backend Conventions

- Follow existing FastAPI router/schema/model separation.
- Keep endpoint contracts explicit and typed.
- Prefer clear errors over silent failures.

## Environment Notes

- `.env` is expected for full local functionality.
- `.env.example` is fallback for limited fork-based workflows.

## Agent Behavior

- Before large edits, inspect nearby files for local patterns.
- After edits, run the smallest relevant verification command.
- If a command fails due to missing local prerequisites, report the blocker and next best command.

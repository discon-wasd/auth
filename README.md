## Discon Auth

A lightweight REST api built with [Hono](https://hono.dev). Handles auth and lets servers verify user identity.

## Endpoints

- `POST /auth/login` - registers or logs in the user via Google, Github or Email

- `GET /user/me`
- `PATCH /user/me`
- `DELETE /user/me`

- `GET /user/token/:token`

- `GET /user/[handle]`

- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionToken`

- `GET /server`
- `POST /server`
- `GET /server/[id]`
- `GET /server/[id]/refresh-token`

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

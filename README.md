## Discon Auth

A lightweight REST api built with [Hono](https://hono.dev). Handles auth and lets servers verify user identity.

## Endpoints

- `POST /auth/login` - registers or logs in the user via Google, Github or Email

- `GET /user/me`
- `PATCH /user/me`
- `DELETE /user/me`

- `GET /user/[handle]`

- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionToken`

- `GET /token/verify/:ip/:token` - verify a token and return the user payload
- `POST /token/create` - creates an access token based on a random string sent by the server and it's IP

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

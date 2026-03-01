## Discon Auth

A REST auth service built with [Hono](https://hono.dev). Handles login and lets servers verify user identity.

## Endpoints

- `POST /login` - registers or logs in the user via Google(not implemented), Github(not implemented) or Email(not implemented)
- `GET /verify/:token` - verify a token and return the user payload
- `POST /create-token` - creates an access token based on a random string sent by the server and it's IP

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

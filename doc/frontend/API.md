# Frontend API and Integrations

## Overview
The frontend is a Next.js web app that calls three backend services:
- AgriSense Node/Express API (auth, posts, soil data, fertilizer, uploads, chat history)
- Cotton leaf disease detection API (FastAPI)
- RAG assistant API (FastAPI)

There is no server-side API implemented inside the frontend. This document covers the client integrations and required environment variables.

## Environment variables
Create a .env.local file in the frontend/ folder:

```
NEXT_PUBLIC_APP_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DISEASE_API_URL=http://localhost:8000
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
```

## Service dependencies

### Backend API (Node/Express)
Base URL from NEXT_PUBLIC_APP_API_URL.

Auth header for protected routes:

```
Authorization: Bearer <jwt_token>
```

Core routes used by the UI:
- POST /auth/signup
- POST /auth/login
- GET /auth/me
- GET /posts
- POST /posts
- DELETE /posts/:id
- POST /posts/like
- POST /posts/comment
- GET /soil-data
- POST /soil-data
- POST /fertilizer/recommend
- POST /upload
- GET /chat-history
- GET /chat-history/:id
- POST /chat-history
- DELETE /chat-history/:id

### Disease detection API (FastAPI)
Base URL from NEXT_PUBLIC_DISEASE_API_URL.

Core routes used by the UI:
- GET /health
- GET /classes
- POST /predict
- POST /predict/batch
- GET /disease-info/{disease_name}

### RAG assistant API (FastAPI)
Base URL from NEXT_PUBLIC_RAG_API_URL.

Core routes used by the UI:
- GET /health
- POST /ask
- POST /translate
- POST /speak

## Example client call (fetch)

```
const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
```

## Error handling guidance
- Always check HTTP status codes before using the JSON body.
- For protected routes, handle 401 by redirecting to login.
- For AI services, handle 503 as a temporary initialization error (model still loading).

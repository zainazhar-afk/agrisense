# Frontend Setup

## Prerequisites
- Node.js 18+ recommended
- npm, pnpm, or yarn

## Install dependencies

```
cd frontend
npm install
```

## Configure environment variables
Create frontend/.env.local:

```
NEXT_PUBLIC_APP_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DISEASE_API_URL=http://localhost:8000
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
```

## Run the development server

```
npm run dev
```

Open http://localhost:3000

## Lint

```
npm run lint
```

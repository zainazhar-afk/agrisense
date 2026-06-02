# Frontend Deployment

## Build for production

```
cd frontend
npm run build
```

## Start the production server

```
npm run start
```

The app will serve on http://localhost:3000 by default.

## Vercel deployment
1. Push the repository to GitHub.
2. Import the frontend project in Vercel.
3. Set environment variables:
   - NEXT_PUBLIC_APP_API_URL
   - NEXT_PUBLIC_DISEASE_API_URL
   - NEXT_PUBLIC_RAG_API_URL
4. Deploy.

## Reverse proxy
If you deploy behind a proxy, ensure the proxy forwards all requests and WebSocket upgrades to the Next.js server.

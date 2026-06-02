# Backend Operations Manual

## Start and stop
- Start development server: npm run dev
- Start production server: npm start
- Health check: GET /health

## Authentication flow
1. Create a user via POST /api/auth/signup.
2. Login via POST /api/auth/login and save the JWT.
3. Use the JWT in Authorization: Bearer <token> for protected routes.

## Common tasks
- Verify database connectivity in logs on startup.
- Check CORS settings when the frontend origin changes.
- Inspect MongoDB collections: users, posts, soilData, chatSessions.

## Troubleshooting
- 401 errors: token missing or expired.
- 503 errors on chat history: database not available.
- Upload failures: check Cloudinary credentials and image size (5 MB limit).

# Backend Architecture

## Stack
- Node.js + Express
- MongoDB via Mongoose
- JWT authentication
- Cloudinary for image uploads

## Request flow
1. Request hits Express server.
2. CORS middleware validates origin.
3. JSON body parser runs.
4. auth middleware validates JWT for protected routes.
5. Route handler reads or writes data in MongoDB.
6. JSON response returned to the client.

## Key modules
- src/server.js: application bootstrap and route registration
- src/config/database.js: MongoDB connection and database access
- src/middleware/auth.js: JWT verification and auth guard
- src/routes/auth.js: signup, login, profile
- src/routes/posts.js: social feed
- src/routes/soilData.js: soil monitoring data
- src/routes/fertilizer.js: fertilizer recommendations
- src/routes/upload.js: Cloudinary uploads
- src/routes/chatHistory.js: assistant chat storage

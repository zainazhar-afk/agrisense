# Backend Setup

## Prerequisites
- Node.js 18+ recommended
- MongoDB Atlas or local MongoDB instance

## Install dependencies

```
cd backend
npm install
```

## Configure environment variables
Create backend/.env:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
ALLOW_START_WITHOUT_DB=false
```

## Start the server

```
# Development
npm run dev

# Production
npm start
```

The API runs on http://localhost:5000 by default.

## Notes
- The server loads environment variables from backend/.env.
- If MongoDB is temporarily unavailable, set ALLOW_START_WITHOUT_DB=true to allow the server to boot (some routes will fail).

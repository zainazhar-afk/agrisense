# Backend API

## Base URL
Default local base URL: http://localhost:5000/api

## Authentication
All protected routes require a JWT in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### POST /auth/signup
Create a new user.

Request body:

```
{
  "name": "Ayesha",
  "email": "ayesha@example.com",
  "password": "secret123"
}
```

Response (201):

```
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Ayesha", "email": "ayesha@example.com", "avatar": "..." }
}
```

### POST /auth/login
Request body:

```
{
  "email": "ayesha@example.com",
  "password": "secret123"
}
```

Response (200):

```
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Ayesha", "email": "ayesha@example.com", "avatar": "..." }
}
```

### GET /auth/me
Protected. Returns the current user profile.

## Social posts

### GET /posts
Returns all posts with user and comment metadata.

Response (200):

```
{
  "success": true,
  "posts": [
    {
      "id": "...",
      "userId": "...",
      "content": "...",
      "mediaUrl": null,
      "mediaType": null,
      "likes": [],
      "comments": [],
      "createdAt": "2026-01-01T12:00:00.000Z",
      "user": { "name": "Ayesha", "avatar": "..." }
    }
  ]
}
```

### POST /posts
Protected. Create a post.

Request body:

```
{
  "content": "My cotton field update",
  "mediaUrl": "https://...",
  "mediaType": "image"
}
```

### DELETE /posts/:id
Protected. Delete a post you own.

### POST /posts/like
Protected. Like or unlike a post.

Request body:

```
{ "postId": "..." }
```

Response:

```
{ "success": true, "liked": true, "likesCount": 5 }
```

### POST /posts/comment
Protected. Add a comment.

Request body:

```
{ "postId": "...", "text": "Great update" }
```

## Soil data

### GET /soil-data
Protected. List soil readings for the current user.

### POST /soil-data
Protected. Add a soil reading.

Request body:

```
{
  "nitrogen": 12,
  "phosphorus": 8,
  "potassium": 20,
  "ph": 6.5,
  "moisture": 32,
  "temperature": 28
}
```

## Fertilizer

### POST /fertilizer/recommend
Protected. Get fertilizer guidance based on NPK values.

Request body:

```
{ "nitrogen": 12, "phosphorus": 8, "potassium": 20, "cropType": "cotton" }
```

Response:

```
{
  "success": true,
  "soilValues": { "nitrogen": 12, "phosphorus": 8, "potassium": 20 },
  "recommendations": [ { "type": "Nitrogen", "severity": "high", "message": "...", "suggestions": ["..."] } ]
}
```

## Uploads

### POST /upload
Protected. Upload an image to Cloudinary.

Request (multipart/form-data):
- image: file

Response:

```
{ "success": true, "message": "Image uploaded successfully", "url": "...", "publicId": "..." }
```

## Assistant chat history

### GET /chat-history
Protected. List chat sessions (recent messages only).

### GET /chat-history/:id
Protected. Get a full chat session.

### POST /chat-history
Protected. Create or update a session.

Request body:

```
{
  "sessionId": "optional",
  "title": "optional",
  "language": "ur",
  "messages": [
    { "sender": "user", "text": "...", "language": "ur" },
    { "sender": "assistant", "text": "...", "language": "ur", "sources": [] }
  ]
}
```

### DELETE /chat-history/:id
Protected. Delete a chat session.

## Health

### GET /health
Returns API health status.

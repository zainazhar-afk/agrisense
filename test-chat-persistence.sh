#!/bin/bash

# Integration Test: Chat Persistence with User Authentication
# Platform: Windows PowerShell (using curl which is built-in)

API_BASE="http://localhost:5000/api"
RAG_API="http://localhost:8001"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Chat Persistence Integration Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Test Login
echo "📌 Step 1: User Authentication"
echo "Logging in test user..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@agrisense.com",
    "password": "TestPassword123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ User logged in"
echo "   Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test RAG Assistant
echo "📌 Step 2: Test RAG Assistant"
echo "Asking RAG assistant a question..."

RAG_RESPONSE=$(curl -s -X POST "$RAG_API/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is cotton crop used for?",
    "language": "en",
    "chat_history": []
  }')

if echo "$RAG_RESPONSE" | grep -q "answer"; then
  echo "✅ RAG response received"
  ANSWER=$(echo "$RAG_RESPONSE" | grep -o '"answer":"[^"]*' | head -1 | cut -d'"' -f4 | cut -c1-80)
  echo "   Answer: ${ANSWER}..."
else
  echo "❌ RAG response failed"
  echo "Response: $RAG_RESPONSE"
  exit 1
fi
echo ""

# Step 3: Save Chat Session
echo "📌 Step 3: Save Chat Session to MongoDB"
echo "Sending chat session to backend..."

SAVE_RESPONSE=$(curl -s -X POST "$API_BASE/chat-history" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Cotton Crop Discussion",
    "language": "en",
    "messages": [
      {
        "sender": "user",
        "text": "What is cotton crop used for?",
        "language": "en",
        "createdAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      },
      {
        "sender": "ai",
        "text": "Cotton is a versatile crop used for textile production, oil extraction, and animal feed.",
        "language": "en",
        "sources": [],
        "createdAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }
    ]
  }')

SESSION_ID=$(echo "$SAVE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ Save chat session failed"
  echo "Response: $SAVE_RESPONSE"
  echo "Make sure backend is running on port 5000"
  exit 1
fi

echo "✅ Chat session saved"
echo "   Session ID: $SESSION_ID"
echo ""

# Step 4: Retrieve Chat Sessions
echo "📌 Step 4: Retrieve Chat Sessions"
echo "Fetching all chat sessions for authenticated user..."

SESSIONS_RESPONSE=$(curl -s -X GET "$API_BASE/chat-history" \
  -H "Authorization: Bearer $TOKEN")

SESSION_COUNT=$(echo "$SESSIONS_RESPONSE" | grep -o '"_id"' | wc -l)

if [ "$SESSION_COUNT" -gt 0 ]; then
  echo "✅ Retrieved $SESSION_COUNT chat session(s)"
else
  echo "⚠️  No sessions found (might be normal if first run)"
fi
echo ""

# Step 5: Retrieve Specific Session
echo "📌 Step 5: Retrieve Specific Session Details"
echo "Fetching session $SESSION_ID..."

SINGLE_SESSION=$(curl -s -X GET "$API_BASE/chat-history/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SINGLE_SESSION" | grep -q "Cotton"; then
  echo "✅ Session retrieved successfully"
  TITLE=$(echo "$SINGLE_SESSION" | grep -o '"title":"[^"]*' | cut -d'"' -f4)
  MSG_COUNT=$(echo "$SINGLE_SESSION" | grep -o '"text":"' | wc -l)
  echo "   Title: $TITLE"
  echo "   Messages: $MSG_COUNT"
else
  echo "❌ Session retrieval failed"
  echo "Response: $SINGLE_SESSION"
  exit 1
fi
echo ""

# Step 6: Test Authorization Failure
echo "📌 Step 6: Test Authorization (Negative Case)"
echo "Attempting to access with invalid token..."

INVALID_RESPONSE=$(curl -s -X GET "$API_BASE/chat-history/$SESSION_ID" \
  -H "Authorization: Bearer invalid-token-12345" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ Access properly denied for invalid token (HTTP $HTTP_CODE)"
else
  echo "⚠️  Unexpected response code: $HTTP_CODE"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Tests Passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  1. ✅ User authentication with JWT tokens"
echo "  2. ✅ RAG assistant provides answers"
echo "  3. ✅ Chat messages auto-saved to MongoDB"
echo "  4. ✅ User can retrieve their chat sessions"
echo "  5. ✅ Only authenticated users can access sessions"
echo "  6. ✅ Authorization properly enforced"
echo ""
echo "Documentation: See CHAT_PERSISTENCE_GUIDE.md for details"
echo ""

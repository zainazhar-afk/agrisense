# RAG Assistant API

## Base URL
Default local base URL: http://localhost:8001

## Endpoints

### GET /health
Returns readiness and model status.

### POST /ask
Ask an agriculture question using the OCR knowledge base.

Request body:

```
{
  "question": "How to treat cotton leaf blight?",
  "language": "ur",
  "chat_history": [
    { "sender": "user", "text": "..." },
    { "sender": "assistant", "text": "..." }
  ]
}
```

Response:

```
{
  "success": true,
  "answer": "...",
  "language": "ur",
  "sources": [ { "source": "file.pdf", "page": 2, "chunk": 5 } ]
}
```

### POST /translate
Translate text. Recommended request body:

```
{ "text": "Hello", "language": "ur" }
```

Response:

```
{ "success": true, "language": "ur", "text": "..." }
```

### POST /speak
Text-to-speech output. Returns audio/mpeg or audio/wav.

Request body:

```
{ "text": "Hello", "language": "en" }
```

## Language codes
- en: English
- ur: Urdu
- pa: Punjabi Shahmukhi

## Errors
- 503: index not loaded or LLM not ready
- 422: required field missing
- 500: translation or text-to-speech failure

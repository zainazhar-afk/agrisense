# RAG System Deployment

## Production run (Uvicorn)

```
cd rag_system
.venv\Scripts\activate
uvicorn app:app --host 0.0.0.0 --port 8001
```

## Required artifacts
- storage/faiss_index must exist on the server
- storage/ocr_pages.jsonl is required if you plan to rebuild the index

## Environment variables
Set these in your hosting provider:
- OPENAI_API_KEY
- ELEVENLABS_API_KEY (optional)
- RAG_DATA_DIR (if PDFs are available on the server)

## Notes
- The service can run without PDFs if the FAISS index is already present.
- Restrict CORS origins in production.

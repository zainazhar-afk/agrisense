# RAG System Architecture

## Stack
- FastAPI
- EasyOCR + PyMuPDF for OCR
- LangChain + FAISS for retrieval
- OpenAI for embeddings and response generation
- googletrans + LLM for translation
- ElevenLabs or pyttsx3 for speech

## Data flow
1. ingest.py OCRs PDF pages and writes JSONL.
2. Text is chunked and embedded using OpenAI embeddings.
3. FAISS index is saved to storage/faiss_index.
4. app.py loads FAISS and the LLM at startup.
5. /ask retrieves top-k chunks, formats a prompt, and returns an answer with sources.

## Key files
- app.py: API endpoints and runtime initialization
- ingest.py: OCR and FAISS build pipeline
- config.py: environment-driven paths and constants
- storage/: OCR output and FAISS index

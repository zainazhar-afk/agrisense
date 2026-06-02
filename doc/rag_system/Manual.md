# RAG System Manual

## Purpose
The RAG service OCRs Urdu agricultural PDFs, builds a FAISS vector index, and answers questions using an LLM.

## Typical workflow
1. Place PDF files in the RAG data folder (default E:\rag data).
2. Run python ingest.py to OCR and build the vector index.
3. Start the API with python app.py.
4. Use POST /ask from the frontend or API client.

## Notes
- If the index is missing, /ask returns 503 until ingestion completes.
- Translation uses googletrans with LLM fallback.
- Text-to-speech uses ElevenLabs when configured, with pyttsx3 fallback.

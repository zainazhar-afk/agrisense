# AgriSense RAG System

This service OCRs the Urdu PDF files in `E:\rag data`, builds a FAISS vector database with OpenAI embeddings, and serves a multilingual agriculture assistant with OpenAI responses.

## Setup

Use Python 3.10 or 3.11 for EasyOCR/PyTorch compatibility on Windows.

```bash
cd rag_system
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Add your OpenAI key to `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

## Build The Index

```bash
python ingest.py --data-dir "E:\rag data" --force-ocr
```

The first run can take a while because each PDF page is rendered and OCRed with EasyOCR. The output is saved to:

- `storage/ocr_pages.jsonl`
- `storage/faiss_index/`

After OCR exists, rebuild only the FAISS index with:

```bash
python ingest.py
```

If `storage/ocr_pages.jsonl` already exists, `python ingest.py` rebuilds the FAISS index without re-running OCR.

## Run The API

```bash
python app.py
```

The API runs on `http://localhost:8001`.

Endpoints:

- `GET /health`
- `POST /ask`
- `POST /translate`

Supported response languages:

- `en` English
- `ur` Urdu
- `pa` Punjabi Shahmukhi

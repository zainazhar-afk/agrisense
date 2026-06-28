# RAG System Setup

## Prerequisites
- Python 3.10 or 3.11 recommended (Windows)
- pip

## Install dependencies

```
cd rag_system
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Configure environment variables
Create rag_system/.env:

```
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=optional
RAG_DATA_DIR=E:\rag data
```

## Build the index

```
python ingest.py --data-dir "E:\rag data" --force-ocr
```

The output is stored in:
- storage/ocr_pages.jsonl
- storage/faiss_index/

## Run the API

```
python app.py
```

The API runs on http://localhost:8001

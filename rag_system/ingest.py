"""
OCR Urdu agricultural PDFs and build a FAISS vector index.

Usage:
    python ingest.py
    python ingest.py --data-dir "E:\\rag data" --force-ocr
"""
import argparse
import json
from pathlib import Path
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

import config


def render_page(page, zoom=2.0):
    import fitz
    import numpy as np
    from PIL import Image

    matrix = fitz.Matrix(zoom, zoom)
    pixmap = page.get_pixmap(matrix=matrix, alpha=False)
    image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
    return np.array(image)


def ocr_pdf(pdf_path: Path, reader, zoom: float):
    import fitz

    records = []
    with fitz.open(pdf_path) as doc:
        for page_index, page in enumerate(doc, start=1):
            image = render_page(page, zoom=zoom)
            text = "\n".join(reader.readtext(image, detail=0, paragraph=True))
            if text.strip():
                records.append({
                    "source": pdf_path.name,
                    "path": str(pdf_path),
                    "page": page_index,
                    "text": text.strip(),
                })
            print(f"OCR {pdf_path.name} page {page_index}/{len(doc)}")
    return records


def write_jsonl(records, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_jsonl(input_path: Path):
    records = []
    with input_path.open("r", encoding="utf-8-sig") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))
    return records


def patch_bidi_for_easyocr():
    try:
        from bidi import get_display  # noqa: F401
        return
    except ImportError:
        from bidi.algorithm import get_display
        import bidi

        bidi.get_display = get_display


def records_to_documents(records):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        separators=["\n\n", "\n", "”", "…", "!", ".", "•", " ", ""],
    )

    def normalize_metadata(record, chunk_index):
        metadata = {
            "source": record.get("source"),
            "path": record.get("path"),
            "page": record.get("page", 0),
            "chunk": chunk_index,
        }

        extra_fields = [
            "lang",
            "topic",
            "crop",
            "season",
            "region",
            "soil_zone",
            "intent",
            "question_type",
            "farmer_type",
            "response_style",
            "farmer_profile",
            "query_type",
            "audience",
            "text_hash_sha256",
            "record_id",
        ]
        for field in extra_fields:
            value = record.get(field)
            if value is not None:
                metadata[field] = value

        return metadata

    docs = []
    for record in records:
        chunks = splitter.split_text(record["text"])
        for chunk_index, chunk in enumerate(chunks):
            docs.append(Document(
                page_content=chunk,
                metadata=normalize_metadata(record, chunk_index),
            ))
    return docs


def build_vectorstore(records):
    docs = records_to_documents(records)
    if not docs:
        raise RuntimeError("No OCR text found. Check the PDF folder and OCR settings.")

    if not config.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is required to build the FAISS index.")

    embeddings = OpenAIEmbeddings(
        api_key=config.OPENAI_API_KEY,
        model=config.OPENAI_EMBEDDING_MODEL,
    )
    vectorstore = FAISS.from_documents(docs, embeddings)
    config.VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(config.VECTORSTORE_DIR))
    print(f"Saved FAISS index to {config.VECTORSTORE_DIR}")
    print(f"Indexed {len(docs)} chunks from {len(records)} OCR pages")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default=str(config.DATA_DIR))
    parser.add_argument("--ocr-output", default=str(config.OCR_OUTPUT_PATH))
    parser.add_argument("--force-ocr", action="store_true")
    parser.add_argument("--zoom", type=float, default=2.0)
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    ocr_output = Path(args.ocr_output)

    if args.force_ocr or not ocr_output.exists():
        if not data_dir.exists():
            raise FileNotFoundError(f"RAG data folder not found: {data_dir}")

        pdfs = sorted(data_dir.glob("*.pdf"))
        if not pdfs:
            raise FileNotFoundError(f"No PDF files found in {data_dir}")

        patch_bidi_for_easyocr()
        import easyocr

        reader = easyocr.Reader(["ur", "en"], gpu=False)
        records = []
        for pdf in pdfs:
            records.extend(ocr_pdf(pdf, reader, zoom=args.zoom))
        write_jsonl(records, ocr_output)
        print(f"Saved OCR output to {ocr_output}")
    else:
        records = read_jsonl(ocr_output)
        print(f"Loaded existing OCR output from {ocr_output}")

    build_vectorstore(records)


if __name__ == "__main__":
    main()

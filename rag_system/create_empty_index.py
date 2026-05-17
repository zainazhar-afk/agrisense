"""Create a minimal FAISS index for development."""
from pathlib import Path
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import config

# Create a single dummy document
dummy_doc = Document(
    page_content="This is a placeholder document. Load real PDFs with: python ingest.py",
    metadata={
        "source": "placeholder.pdf",
        "path": "placeholder.pdf",
        "page": 1,
        "chunk": 0,
    }
)

# Build vectorstore
embeddings = HuggingFaceEmbeddings(
    model_name=config.EMBEDDING_MODEL_NAME,
    encode_kwargs={"normalize_embeddings": True},
)
vectorstore = FAISS.from_documents([dummy_doc], embeddings)
config.VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
vectorstore.save_local(str(config.VECTORSTORE_DIR))
print(f"✅ Created minimal FAISS index at {config.VECTORSTORE_DIR}")

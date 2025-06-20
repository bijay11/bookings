from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
from dotenv import load_dotenv
import os
import json
import sys

load_dotenv()

CHROMA_PERSIST_DIR = "./chroma_store"

def load_reviews(json_path: str) -> list[Document]:
    with open(json_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    documents = []
    for listing in raw:
        listing_id = listing["listing_id"]
        reviews = listing["content"]  # list of {reviewer_id, content}

        # Combine all review texts into one string separated by newlines
        combined_reviews = "\n".join(review["content"] for review in reviews)

        # Create a single Document per listing with combined content
        documents.append(Document(page_content=combined_reviews, metadata={"listing_id": listing_id}))

    return documents

def ingest(json_path: str):
    print("Loading reviews...")
    documents = load_reviews(json_path)

    print("Generating embeddings...")
    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Storing to Chroma...")
    Chroma.from_documents(
        documents=documents,
        embedding=embedding,
        persist_directory=CHROMA_PERSIST_DIR
    )

    print("✅ Ingestion complete!")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python ingest.py <path_to_reviews_json>")
    else:
        ingest(sys.argv[1])

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain.chains import RetrievalQA
from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Load embedding and LLM
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
ollama_url = os.getenv("OLLAMA_BASE_URL")
llm = OllamaLLM(model="mistral", base_url=ollama_url)

# Matches Go's JSON field names exactly (no aliasing needed now)
class Review(BaseModel):
    reviewer_id: str
    reviewer: str
    comment: str
    rating: int
    date: str
    avatar_url: str
    trip_type: str
    location: str

class AskPayload(BaseModel):
    listing_id: str
    question: str
    reviews: List[Review]

@app.post("/ask")
async def ask(payload: AskPayload):
    content_parts = [
        f"{r.reviewer} from {r.location} ({r.trip_type}, {r.date}): {r.comment} [Rating: {r.rating}/5]"
        for r in payload.reviews
    ]
    full_content = "\n".join(content_parts)

    doc = Document(page_content=full_content, metadata={"listing_id": payload.listing_id})
    vectorstore = FAISS.from_documents([doc], embedding=embedding)
    retriever = vectorstore.as_retriever()
    qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

    result = qa.run(f"Question: {payload.question}")
    return {"answer": result}

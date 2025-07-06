from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
ollama_url = os.getenv("OLLAMA_BASE_URL")
llm = OllamaLLM(model="mistral", base_url=ollama_url, temperature=0.0)

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
    print(f"[ask endpoint] Number of reviews received: {len(payload.reviews)}")

    docs = [
        Document(
            page_content=f"{r.reviewer} from {r.location} ({r.trip_type}, {r.date}): {r.comment} [Rating: {r.rating}/5]",
            metadata={"listing_id": payload.listing_id}
        )
        for r in payload.reviews
    ]

    vectorstore = FAISS.from_documents(docs, embedding=embedding)
    retriever = vectorstore.as_retriever(search_kwargs={"k": len(docs)})
    retrieved_docs = retriever.get_relevant_documents(payload.question)
    print(f"[ask endpoint] Number of docs retrieved for LLM: {len(retrieved_docs)}")

    # Build fully structured reviews text
    structured_reviews = []
    for i, r in enumerate(payload.reviews):
        structured_reviews.append(
            f"Review {i+1}:\n"
            f"Reviewer: {r.reviewer}\n"
            f"Location: {r.location}\n"
            f"Trip type: {r.trip_type}\n"
            f"Date: {r.date}\n"
            f"Rating: {r.rating}\n"
            f"Comment: {r.comment}\n"
        )
    reviews_text = "\n".join(structured_reviews)

    few_shot_example = """
Example:

Question: How many reviews have rating below 4?
Answer: There are 7 reviews with ratings below 4.

---

Now answer the user's question below.
"""

    prompt = f"""
You are an assistant answering questions about property reviews. Use only the review data below to answer questions.

{few_shot_example}

Reviews:
{reviews_text}

Question:
{payload.question}

Answer (show reasoning step by step, or say "I don't know" if answer not found):
""".strip()

    print(f"[ask endpoint] Prompt (truncated):\n{prompt[:600]}{'...' if len(prompt) > 600 else ''}")

    result = llm.invoke(prompt)
    print(f"[ask endpoint] LLM answer: {result}")

    return {"answer": result}

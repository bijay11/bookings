from fastapi import FastAPI, Query
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import OllamaLLM
from langchain.chains import RetrievalQA
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = Chroma(persist_directory="./chroma_store", embedding_function=embedding)

ollama_url = os.getenv("OLLAMA_BASE_URL")
llm = OllamaLLM(model="mistral", base_url=ollama_url)

qa = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

@app.get("/ask")
def ask(listing_id: str = Query(...), question: str = Query(...)):
    prompt = f"Listing ID: {listing_id}. Question: {question}"
    result = qa.run(prompt)
    return {"answer": result}

from fastapi import FastAPI, Query
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaLLM
from langchain.chains import RetrievalQA
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Load the embedding model
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize Chroma vector store with embeddings
vectorstore = Chroma(persist_directory="./chroma_store", embedding_function=embedding)

# Load Ollama LLM
ollama_url = os.getenv("OLLAMA_BASE_URL")
llm = OllamaLLM(model="mistral", base_url=ollama_url)
# llm = OllamaLLM(model="mistral:7b-q4", base_url=ollama_url)


@app.get("/ask")
def ask(listing_id: str = Query(...), question: str = Query(...)):
    # Filter the retriever to only get documents for the specified listing_id
    retriever = vectorstore.as_retriever(search_kwargs={"filter": {"listing_id": listing_id}})

    # Build the RetrievalQA chain with the filtered retriever
    qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

    # Generate the answer
    prompt = f"Question: {question}"
    result = qa.run(prompt)

    return {"answer": result}

# 🧠 Review Analysis Microservice

This microservice uses a local LLM (via Ollama) and FastAPI to answer questions about product or listing reviews. It’s designed to be used as part of a larger application architecture (e.g., Next.js frontend → Go backend → Python microservice).

## 🚀 Setup Instructions

### 1. Activate the Virtual Environment

* **Windows**

  ```bash
  venv\Scripts\activate
  ```

* **macOS / Linux / WSL**

  ```bash
  source venv/bin/activate
  ```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start Ollama

```bash
ollama serve
```

> ⚠️ **Note:** On Windows, Ollama may leave port `11434` reserved even after being stopped, which can cause `bind` errors the next time you run `ollama serve`.

To fix this:

#### a. Find the Owning Process

```powershell
Get-NetTCPConnection -LocalPort 11434 | Select-Object OwningProcess -Unique
```

#### b. Kill the Process by PID

```powershell
Stop-Process -Id <PID> -Force
```

Replace `<PID>` with the number from the previous step (e.g., `7016`).

#### c. Confirm the Port is Free

```powershell
Get-NetTCPConnection -LocalPort 11434
```

### 4. Ingest Review Data

Once Ollama is running, ingest your dataset:

```bash
python ingest.py sample_reviews.json
```

### 5. Start the API Server

Run the FastAPI app:

```bash
uvicorn main:app --reload
```

The server will be available at:
[http://localhost:8000](http://localhost:8000)

---

## 📦 Project Structure

```
.
├── ingest.py             # Loads and indexes review data for semantic search
├── main.py               # FastAPI app exposing /ask endpoint
├── sample_reviews.json   # Sample dataset
├── requirements.txt      # Python dependencies
├── venv/                 # Virtual environment (optional in .gitignore)
└── README.md
```

---

## 🔗 Example Request

Test the microservice:

```bash
curl "http://localhost:8000/ask?listing_id=house-001&question=Is%20there%20a%20bug"
```

Expected JSON response:

```json
{
  "answer": "Yes, based on the context provided, it appears that bugs or pests are present in..."
}
```

---

## ✅ Done

Your microservice is now live and ready to receive requests from your backend app.

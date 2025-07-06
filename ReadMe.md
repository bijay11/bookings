# Bookings Project - Docker Compose Setup

This project uses Docker Compose to orchestrate all services required for local development and testing. The main services are:

- **db**: PostgreSQL database
- **server**: Go backend API
- **llm-service**: Python LLM microservice
- **client**: Next.js frontend

## Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/) installed
- `.env` file with required environment variables (see below)

## Environment Variables
Create a `.env` file in the project root with the following variables:

```
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_HOST=db
DB_PORT=5432
DB_SSL=disable
PRODUCTION=false
CACHE=false
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Starting the Application

1. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```
   This will build and start the database, backend server, LLM service, and frontend client.

2. **Access the services:**
   - **Frontend (Next.js):** http://localhost:3000
   - **Backend API (Go):** http://localhost:8080
   - **LLM Service (Python):** http://localhost:8000
   - **Postgres DB:** localhost:5432 (use credentials from `.env`)

3. **Stopping the application:**
   ```sh
   docker-compose down
   ```

## Notes
- The LLM service expects an Ollama server running on your host at port 11434. Make sure Ollama is running locally if you use the LLM features.
- Database data is persisted in a Docker volume (`pgdata`).
- If you change dependencies or code in the backend, frontend, or LLM service, you may need to rebuild:
  ```sh
  docker-compose build
  ```

## Troubleshooting
- If you encounter issues with ports already in use, make sure nothing else is running on 3000, 8000, 8080, or 5432.
- For database connection issues, check your `.env` values and ensure the `db` service is healthy.

---

For more details, see the individual `ReadMe.md` files in each service directory.

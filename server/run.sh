#!/bin/bash

# Set required environment variables here or export them outside
export DB_NAME=bookings
export DB_USER=postgres
export DB_PASS=secret
export DB_HOST=localhost
export DB_PORT=5432
export PRODUCTION=false
export CACHE=false

go build -o bookings cmd/web/*.go
./bookings

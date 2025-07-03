# Use explicit, pinned Go version for reproducibility
FROM golang:1.23.1-alpine

# Install git (needed for 'go mod download')
RUN apk add --no-cache git

# Set environment variables for static build
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

# Set working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the Go binary
RUN go build -o bookings ./cmd/web

# Expose the port the app listens on
EXPOSE 8080

# Run the built binary
CMD ["./bookings"]

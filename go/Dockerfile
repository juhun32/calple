FROM golang:1.24.3-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd

FROM alpine:3.18
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /app
COPY --from=builder /app/server /app/server
COPY .env /app/.env
COPY client_secret.json /app/client_secret.json
COPY firebase_credentials.json /app/firebase_credentials.json
EXPOSE 5000
CMD ["/app/server"]
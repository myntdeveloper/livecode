FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main cmd/executor/main.go

FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY --from=builder /app/main .
EXPOSE 8001
CMD ["./main"]
.PHONY: run build test lint migrate sqlc

run:
	go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

test:
	go test ./... -race -count=1

lint:
	golangci-lint run ./...

sqlc:
	sqlc generate

migrate:
	migrate -path db/migrations -database "$(DATABASE_URL)" up

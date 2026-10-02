package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/acme/billing-api/internal/users"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("db pool: %v", err)
	}
	defer pool.Close()

	r := chi.NewRouter()
	users.Mount(r, pool)

	log.Println("listening on :8080")
	http.ListenAndServe(":8080", r)
}

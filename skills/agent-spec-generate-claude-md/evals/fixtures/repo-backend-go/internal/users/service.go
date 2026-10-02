package users

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	q *Queries // gerado por sqlc — NÃO editar à mão
}

func NewService(pool *pgxpool.Pool) *Service {
	return &Service{q: New(pool)}
}

type CreateUserInput struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (s *Service) Create(ctx context.Context, in CreateUserInput) (User, error) {
	// Soft delete: nunca DELETE físico. Linhas têm deleted_at.
	return s.q.InsertUser(ctx, InsertUserParams{Email: in.Email, Name: in.Name})
}

func (s *Service) Get(ctx context.Context, id string) (User, error) {
	return s.q.GetActiveUser(ctx, id)
}

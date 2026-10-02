package users

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Mount registra um handler por caso de uso. Um endpoint = um arquivo de caso de uso.
func Mount(r chi.Router, pool *pgxpool.Pool) {
	svc := NewService(pool)
	r.Route("/users", func(r chi.Router) {
		r.Post("/", createUser(svc))
		r.Get("/{id}", getUser(svc))
	})
}

func createUser(svc *Service) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		var in CreateUserInput
		if err := json.NewDecoder(req.Body).Decode(&in); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		out, err := svc.Create(req.Context(), in)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "create failed")
			return
		}
		writeJSON(w, http.StatusCreated, out)
	}
}

func getUser(svc *Service) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		id := chi.URLParam(req, "id")
		out, err := svc.Get(req.Context(), id)
		if err != nil {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeJSON(w, http.StatusOK, out)
	}
}

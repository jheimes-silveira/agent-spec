-- name: InsertUser :one
INSERT INTO users (email, name) VALUES ($1, $2)
RETURNING id, email, name, created_at;

-- name: GetActiveUser :one
SELECT id, email, name, created_at FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: SoftDeleteUser :exec
UPDATE users SET deleted_at = now() WHERE id = $1;

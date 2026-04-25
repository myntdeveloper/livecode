package repo

import (
	"database/sql"

	"github.com/myntdeveloper/livecode/internal/github"
	"github.com/myntdeveloper/livecode/internal/model"
	"github.com/myntdeveloper/livecode/internal/utils"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Upsert(u *github.GithubUser) (*model.User, error) {
	query := `
	INSERT INTO users (id, github_id, login, avatar_url)
	VALUES ($1,$2,$3,$4)
	ON CONFLICT (github_id)
	DO UPDATE SET
	login = EXCLUDED.login,
	avatar_url = EXCLUDED.avatar_url
	RETURNING id, github_id, login, avatar_url, created_at
	`

	var user model.User
	err := r.db.QueryRow(query, utils.GenerateUserID(), u.ID, u.Login, u.Avatar).
		Scan(&user.ID, &user.GithubID, &user.Login, &user.AvatarURL, &user.CreatedAt)

	return &user, err
}

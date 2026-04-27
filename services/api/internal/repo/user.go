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
	INSERT INTO users (id, github_id, login, avatar_url, name, surname)
	VALUES ($1,$2,$3,$4,$5,$6)
	ON CONFLICT (github_id)
	DO UPDATE SET
	login = EXCLUDED.login,
	avatar_url = EXCLUDED.avatar_url
	RETURNING id, github_id, login, name, surname, avatar_url, created_at
	`

	var user model.User
	err := r.db.QueryRow(query, utils.GenerateUserID(), u.ID, u.Login, u.Avatar, "", "").
		Scan(&user.ID, &user.GithubID, &user.Login, &user.Name, &user.Surname, &user.AvatarURL, &user.CreatedAt)

	return &user, err
}

func (r *UserRepo) UpdateNameAndSurname(userID string, name string, surname string) (*model.User, error) {
	query := `
		UPDATE users 
		SET name = $1, surname = $2 
		WHERE id = $3
		RETURNING id, github_id, login, name, surname, avatar_url, created_at
	`

	var user model.User
	err := r.db.QueryRow(query, name, surname, userID).
		Scan(&user.ID, &user.GithubID, &user.Login, &user.Name, &user.Surname, &user.AvatarURL, &user.CreatedAt)

	return &user, err
}

func (r *UserRepo) GetByID(userID string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(
		"SELECT id, github_id, login, name, surname, avatar_url, created_at FROM users WHERE id = $1", userID).
		Scan(&user.ID, &user.GithubID, &user.Login, &user.Name, &user.Surname, &user.AvatarURL, &user.CreatedAt)
		
	return user, err
}

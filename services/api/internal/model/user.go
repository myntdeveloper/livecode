package model

type User struct {
	ID        string `json:"id"` // UUID as string
	Name      string `json:"name"`
	Surname   string `json:"surname"`
	GithubID  int64  `json:"github_id"` // BIGINT
	Login     string `json:"login"`     // login
	AvatarURL string `json:"avatar_url"`
	CreatedAt string `json:"created_at"` // TIMESTAMP as string, adjust type if needed
}

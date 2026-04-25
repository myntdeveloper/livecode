package github

type GithubUser struct {
	ID     int    `json:"id"`
	Login  string `json:"login"`
	Avatar string `json:"avatar_url"`
}

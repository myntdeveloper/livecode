package model

type Room struct {
	ID        string `json:"id"`
	OwnerID   string `json:"owner_id"`
	Code      string `json:"code"`
	Language  string `json:"language"`
	CreatedAt string `json:"created_at"`
}

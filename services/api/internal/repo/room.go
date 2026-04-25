package repo

import (
	"database/sql"

	"github.com/myntdeveloper/livecode/internal/model"
)

type RoomRepo struct {
	db *sql.DB
}

func NewRoomRepo(db *sql.DB) *RoomRepo {
	return &RoomRepo{db: db}
}

func (r *RoomRepo) Create(roomID string, ownerID string, code string, language string) (*model.Room, error) {
	room := &model.Room{}
	err := r.db.QueryRow(
		`INSERT INTO rooms (id, owner_id, code, language) VALUES ($1, $2, $3, $4) 
		 RETURNING id, owner_id, code, language, created_at`,
		roomID, ownerID, code, language,
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt)
	return room, err
}

func (r *RoomRepo) GetByID(id string) (*model.Room, error) {
	room := &model.Room{}
	err := r.db.QueryRow(
		"SELECT id, owner_id, code, language, created_at FROM rooms WHERE id = $1", id,
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt)
	return room, err
}

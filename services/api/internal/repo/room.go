package repo

import (
	"database/sql"
	"errors"

	"github.com/myntdeveloper/livecode/internal/model"
)

var ErrRoomForbidden = errors.New("room forbidden")

type RoomRepo struct {
	db *sql.DB
}

func NewRoomRepo(db *sql.DB) *RoomRepo {
	return &RoomRepo{db: db}
}

func (r *RoomRepo) Create(roomID string, ownerID string, code string, language string) (*model.Room, error) {
	room := &model.Room{}
	err := r.db.QueryRow(
		`INSERT INTO rooms (id, owner_id, code, language, status) VALUES ($1, $2, $3, $4, $5) 
		 RETURNING id, owner_id, code, language, created_at, status`,
		roomID, ownerID, code, language, "active",
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt, &room.Status)
	return room, err
}

func (r *RoomRepo) GetByID(id string) (*model.Room, error) {
	room := &model.Room{}
	err := r.db.QueryRow(
		"SELECT id, owner_id, code, language, created_at, status FROM rooms WHERE id = $1", id,
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt, &room.Status)
	return room, err
}

func (r *RoomRepo) Close(id string, ownerID string) (*model.Room, error) {
	currentRoom, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}
	if currentRoom.OwnerID != ownerID {
		return nil, ErrRoomForbidden
	}

	_, err = r.db.Exec(
		"UPDATE rooms SET status = $1 WHERE id = $2", "closed", id,
	)
	if err != nil {
		return nil, err
	}

	room := &model.Room{}
	scanErr := r.db.QueryRow(
		"SELECT id, owner_id, code, language, created_at, status FROM rooms WHERE id = $1", id,
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt, &room.Status)
	if scanErr != nil {
		return nil, scanErr
	}
	return room, nil
}

func (r *RoomRepo) ChangeLanguage(id string, ownerID string, language string) (*model.Room, error) {
	currentRoom, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}
	if currentRoom.OwnerID != ownerID {
		return nil, ErrRoomForbidden
	}

	_, err = r.db.Exec(
		"UPDATE rooms SET language = $1 WHERE id = $2", language, id,
	)
	if err != nil {
		return nil, err
	}

	room := &model.Room{}
	scanErr := r.db.QueryRow(
		"SELECT id, owner_id, code, language, created_at, status FROM rooms WHERE id = $1", id,
	).Scan(&room.ID, &room.OwnerID, &room.Code, &room.Language, &room.CreatedAt, &room.Status)
	if scanErr != nil {
		return nil, scanErr
	}
	return room, nil
}

package service

import (
	"database/sql"
	"errors"

	"github.com/myntdeveloper/livecode/internal/model"
	"github.com/myntdeveloper/livecode/internal/repo"
	"github.com/myntdeveloper/livecode/internal/utils"
)

type RoomService struct {
	roomRepo *repo.RoomRepo
}

func NewRoomService(roomRepo *repo.RoomRepo) *RoomService {
	return &RoomService{roomRepo: roomRepo}
}

func (s *RoomService) CreateRoom(ownerID string) (*model.Room, error) {
	return s.roomRepo.Create(utils.GenerateID(), ownerID, "print(\"Hello world!\")", "python")
}

func (s *RoomService) GetByID(id string) (*model.Room, error) {
	room, err := s.roomRepo.GetByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("room not found")
		}
		return nil, err
	}
	return room, nil
}

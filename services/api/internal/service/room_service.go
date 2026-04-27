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

var (
	ErrRoomNotFound  = errors.New("room not found")
	ErrRoomForbidden = errors.New("room forbidden")
)

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
			return nil, ErrRoomNotFound
		}
		return nil, err
	}
	return room, nil
}

func (s *RoomService) CloseRoom(id string, ownerID string) (*model.Room, error) {
	room, err := s.roomRepo.Close(id, ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrRoomNotFound
		}
		if errors.Is(err, repo.ErrRoomForbidden) {
			return nil, ErrRoomForbidden
		}
		return nil, err
	}
	return room, nil
}

func (s *RoomService) ChangeLanguage(id string, ownerID string, language string) (*model.Room, error) {
	// TODO: Check language for valid
	room, err := s.roomRepo.ChangeLanguage(id, ownerID, language)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrRoomNotFound
		}
		if errors.Is(err, repo.ErrRoomForbidden) {
			return nil, ErrRoomForbidden
		}
		return nil, err
	}
	return room, nil
}

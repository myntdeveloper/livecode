package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/myntdeveloper/livecode/internal/service"
)

type RoomHandler struct {
	roomService *service.RoomService
}

func NewRoomHandler(roomService *service.RoomService) *RoomHandler {
	return &RoomHandler{roomService: roomService}
}

// @Security BearerAuth
// CreateRoom godoc
// @Summary Creating Room
// @Tags room
// @Accept json
// @Produce json
// @Success 201 {object} model.Room
// @Failure 400 {object} map[string]string
// @Router /api/rooms [post]
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in context"})
		return
	}
	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user_id invalid"})
		return
	}
	room, err := h.roomService.CreateRoom(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, room)
}

// @Security BearerAuth
// GetRoomById godoc
// @Summary Get Room By Id
// @Tags room
// @Accept json
// @Produce json
// @Param room_id query string true "Room ID"
// @Success 200 {object} model.Room
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/rooms [get]
func (h *RoomHandler) GetRoomById(c *gin.Context) {
	roomID := c.Query("room_id")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

	room, err := h.roomService.GetByID(roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

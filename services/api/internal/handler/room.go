package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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
	roomID := c.Param("roomID")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

	room, err := h.roomService.GetByID(roomID)
	if err != nil {
		if errors.Is(err, service.ErrRoomNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// @Security BearerAuth
// CloseRoom godoc
// @Summary Close Room By id
// @Tags room
// @Accept json
// @Produce json
// @Param room_id body string true "Room ID"
// @Success 200 {object} model.Room
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/rooms [post]
func (h *RoomHandler) CloseRoom(c *gin.Context) {
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

	roomID := c.Param("roomID")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

	room, err := h.roomService.CloseRoom(roomID, userID)
	if err != nil {
		if errors.Is(err, service.ErrRoomNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		if errors.Is(err, service.ErrRoomForbidden) {
			c.JSON(http.StatusForbidden, gin.H{"error": "only room owner can close room"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
	service.CloseRoomHub(room.ID)
}

// @Security BearerAuth
// ChangeLanguageRoom godoc
// @Summary Change Language
// @Tags room
// @Accept json
// @Produce json
// @Param room_id body string true "Room ID"
// @Param language body string true "Language"
// @Success 200 {object} model.Room
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/rooms [post]
func (h *RoomHandler) ChangeLanguageRoom(c *gin.Context) {
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

	var req struct {
		Language string `json:"language" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "language is required"})
		return
	}

	roomID := c.Param("roomID")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

	room, err := h.roomService.ChangeLanguage(roomID, userID, req.Language)
	if err != nil {
		if errors.Is(err, service.ErrRoomNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		if errors.Is(err, service.ErrRoomForbidden) {
			c.JSON(http.StatusForbidden, gin.H{"error": "only room owner can change language"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

func (h *RoomHandler) UpdateCodeRoom(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	roomID := c.Param("roomID")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

	room, err := h.roomService.UpdateCode(roomID, req.Code)
	if err != nil {
		if errors.Is(err, service.ErrRoomNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

var roomUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *RoomHandler) RoomWS(c *gin.Context) {
	roomID := c.Param("roomID")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required"})
		return
	}

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

	room, err := h.roomService.GetByID(roomID)
	if err != nil {
		if errors.Is(err, service.ErrRoomNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if room.Status == "closed" {
		c.JSON(http.StatusGone, gin.H{"error": "room closed"})
		return
	}

	conn, err := roomUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	service.JoinRoomHub(roomID, room.OwnerID, userID, conn)
}

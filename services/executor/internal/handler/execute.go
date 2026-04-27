package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/myntdeveloper/executor/internal/service"
)

type ExecuteHandler struct {
	executeService *service.ExecuteService
}

func NewExecuteHandler(executeService *service.ExecuteService) *ExecuteHandler {
	return &ExecuteHandler{
		executeService: executeService,
	}
}

// Execute godoc
// @Summary Execute code
// @Description Execute code Testing
// @Tags execute
// @Accept json
// @Produce json
// @Param request body models.ExecuteRequest true "Request body"
// @Router /api/execute [post]
func (h *ExecuteHandler) Execute(c *gin.Context) {
	var req struct {
		Language string `json:"language"`
		Code     string `json:"code"`
		Input    string `json:"input"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if req.Language == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "incorrect language"})
		return
	}
	if req.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty code"})
		return
	}
	response, err := h.executeService.Execute(req.Language, req.Code, req.Input)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, response)
}

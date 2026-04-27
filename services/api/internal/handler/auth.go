package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/myntdeveloper/livecode/internal/config"
	"github.com/myntdeveloper/livecode/internal/model"
	"github.com/myntdeveloper/livecode/internal/service"
)

type AuthHandler struct {
	service *service.AuthService
	conf    *config.Config
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{
		service: s,
		conf:    config.Load(),
	}
}

var conf = config.Load()

func (h *AuthHandler) GithubLogin(c *gin.Context) {
	url := "https://github.com/login/oauth/authorize" +
		"?client_id=" + h.conf.GithubClientID +
		"&scope=read:user user:email"

	c.Redirect(302, url)
}
func (h *AuthHandler) GithubCallback(c *gin.Context) {
	code := c.Query("code")

	if code == "" {
		c.JSON(400, gin.H{"error": "no code"})
		return
	}

	token, err := h.service.ExchangeCode(code)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	githubUser, err := h.service.GetGithubUser(token)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.UpsertUser(githubUser)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	jwtToken, _ := h.service.CreateJWT(user.ID)

	c.SetCookie(
		"token",
		jwtToken,
		3600*24*7,
		"/",
		"",
		false,
		true,
	)

	c.Redirect(302, "/auth/callback?login="+user.Login+"&avatar_url="+user.AvatarURL)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie(
		"token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	c.JSON(200, gin.H{"ok": true})
}

func (h *AuthHandler) UpdateNameAndSurname(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "user_id not found in context"})
		return
	}
	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(500, gin.H{"error": "user_id invalid"})
		return
	}

	var req struct {
		Name    string `json:"name" binding:"required"`
		Surname string `json:"surname" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	user := &model.User{
		ID:      userID,
		Name:    req.Name,
		Surname: req.Surname,
	}

	updatedUser, err := h.service.UpdateNameAndSurnameUser(user)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"user": updatedUser})
}

func (h *AuthHandler) GetUserById(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "user_id not found in context"})
		return
	}
	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(500, gin.H{"error": "user_id invalid"})
		return
	}
	updatedUser, err := h.service.GetUserById(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"user": updatedUser})
}

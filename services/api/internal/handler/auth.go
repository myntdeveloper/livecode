package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/myntdeveloper/livecode/internal/config"
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

	c.JSON(200, user)
}

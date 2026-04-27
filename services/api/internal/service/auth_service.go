package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/myntdeveloper/livecode/internal/config"
	"github.com/myntdeveloper/livecode/internal/github"
	"github.com/myntdeveloper/livecode/internal/model"
	"github.com/myntdeveloper/livecode/internal/repo"
)

type AuthService struct {
	userRepo  *repo.UserRepo
	jwtSecret string
}

var conf = config.Load()

func NewAuthService(userRepo *repo.UserRepo) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: conf.JWTSecret,
	}
}

func (s *AuthService) ExchangeCode(code string) (string, error) {
	data := url.Values{}
	data.Set("client_id", conf.GithubClientID)
	data.Set("client_secret", conf.GithubClientSecret)
	data.Set("code", code)

	req, err := http.NewRequest(
		"POST",
		"https://github.com/login/oauth/access_token",
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		return "", err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	var res struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}

	json.Unmarshal(bodyBytes, &res)

	if res.Error != "" {
		return "", fmt.Errorf("github error: %s - %s", res.Error, res.ErrorDesc)
	}

	return res.AccessToken, nil
}

func (s *AuthService) GetGithubUser(token string) (*github.GithubUser, error) {
	req, _ := http.NewRequest(
		"GET",
		"https://api.github.com/user",
		nil,
	)

	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user github.GithubUser
	json.NewDecoder(resp.Body).Decode(&user)

	return &user, nil
}

func (s *AuthService) CreateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) UpsertUser(g *github.GithubUser) (*model.User, error) {
	return s.userRepo.Upsert(g)
}

func (s *AuthService) GetUserById(userID string) (*model.User, error) {
	return s.userRepo.GetByID(userID)
}

func (s *AuthService) UpdateNameAndSurnameUser(u *model.User) (*model.User, error) {
	// Updates the user name and surname using the userRepo
	return s.userRepo.UpdateNameAndSurname(u.ID, u.Name, u.Surname)
}

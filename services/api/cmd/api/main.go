package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/myntdeveloper/livecode/docs"
	"github.com/myntdeveloper/livecode/internal/config"
	"github.com/myntdeveloper/livecode/internal/handler"
	"github.com/myntdeveloper/livecode/internal/middleware"
	"github.com/myntdeveloper/livecode/internal/repo"
	"github.com/myntdeveloper/livecode/internal/service"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title LiveCode API
// @version 1.0
// @description LiveCode REST api
// @host localhost:8000
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	conf := config.Load()
	db := repo.NewDB()
	defer db.Close()

	if err := repo.Migrate(db); err != nil {
		log.Fatal("Migration Error:", err)
	}

	roomRepo := repo.NewRoomRepo(db)
	roomService := service.NewRoomService(roomRepo)
	roomHandler := handler.NewRoomHandler(roomService)
	userRepo := repo.NewUserRepo(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	api.GET("/auth/github", authHandler.GithubLogin)
	api.GET("/auth/github/callback", authHandler.GithubCallback)
	api.POST("/auth/logout", authHandler.Logout)

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/user/me", authHandler.GetUserById)
	protected.PUT("/user/name", authHandler.UpdateNameAndSurname)
	protected.POST("/rooms", roomHandler.CreateRoom)
	protected.GET("/rooms/:roomID", roomHandler.GetRoomById)
	protected.POST("/rooms/:roomID/close", roomHandler.CloseRoom)
	protected.POST("/rooms/:roomID/language", roomHandler.ChangeLanguageRoom)
	protected.GET("/ws/rooms/:roomID", roomHandler.RoomWS)

	log.Println("Server is started")
	if err := r.Run(":" + conf.Port); err != nil {
		log.Fatal(err)
	}
}

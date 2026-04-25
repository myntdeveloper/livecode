package main

import (
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/myntdeveloper/executor/docs"
	"github.com/myntdeveloper/executor/internal/config"
	"github.com/myntdeveloper/executor/internal/handler"
	"github.com/myntdeveloper/executor/internal/service"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Executor API
// @version 1.0
// @description Executor Rest Api
// @host localhost:8001
// @BasePath /
func main() {
	conf := config.Load()
	r := gin.Default()

	roomService := service.NewExecuteService()
	roomHandler := handler.NewExecuteHandler(roomService)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	api.POST("/execute", roomHandler.Execute)

	log.Println("Server is started")
	if err := r.Run(":" + conf.Port); err != nil {
		log.Fatal(err)
	}
}

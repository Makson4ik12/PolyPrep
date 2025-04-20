package main

import (
	"polyprep/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://90.156.170.153:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/check", handlers.CheckAuth)
			auth.POST("/logout", handlers.Logout)
			auth.GET("/callback", handlers.AuthCallback)
			auth.POST("/logout/callback", handlers.LogoutCallback)
		}
	}

	r.Run(":8081")
}

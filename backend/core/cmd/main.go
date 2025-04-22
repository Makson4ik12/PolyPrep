package main

import (
	"polyprep/config"
	"polyprep/handlers"
	"polyprep/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	cfg := config.LoadConfig()

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

		api.Use(middleware.AuthMiddleware())
		{
			api.GET("/post", handlers.GetPost)
			api.POST("/post", handlers.CreatePost)
			api.PUT("/post", handlers.UpdatePost)
			api.DELETE("/post", handlers.DeletePost)
			api.GET("/post/search", handlers.SearchPosts)
			api.GET("/post/random", handlers.GetRandomPosts)

			api.GET("/comment", handlers.GetComments)
			api.POST("/comment", handlers.CreateComment)
			api.PUT("/comment", handlers.UpdateComment)
			api.DELETE("/comment", handlers.DeleteComment)

			api.GET("/like", handlers.GetLikes)
			api.POST("/like", handlers.LikePost)
			api.DELETE("/like", handlers.DeleteLike)

			api.GET("/user", handlers.GetUser)
			api.GET("/user/posts", handlers.GetAllUserPosts)
		}
	}

	r.Run(":" + cfg.ServerPort)
}

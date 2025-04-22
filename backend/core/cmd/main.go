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
		AllowOrigins:     []string{cfg.RedirectURL, "http://localhost:3000", "http://127.0.0.1:3000"},
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
			auth.POST("/refresh", handlers.RefreshToken)
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

			api.GET("/includes", handlers.GetIncludes)
			api.POST("/includes", handlers.LoadIncludes)
			api.DELETE("/includes", handlers.DeleteIncludes)

			api.GET("/includes", handlers.GetFavorite)
			api.POST("/includes", handlers.MakeFavorite)
			api.DELETE("/includes", handlers.DeleteFromFavorite)
		}
	}

	r.Run(":" + cfg.ServerPort)
}

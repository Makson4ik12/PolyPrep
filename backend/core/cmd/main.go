package main

import (
	"polyprep/config"
	"polyprep/database"
	"polyprep/handlers"
	"polyprep/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	database.ConnectDB()
	cfg := config.LoadConfig()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
			"Accept",
			"X-Requested-With",
		},
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

		// это публичные запросы, тут не нужны токены
		api.GET("/post/search", handlers.SearchPosts)
		api.GET("/post/random", handlers.GetRandomPosts)
		api.GET("/user", handlers.GetUser)

		// это вариативные запросы - те мы можем их отправлять например к открытым постам, или к закрытыми (токен можно илфи отправить или не отправлять)
		// смысл в том, что если токен не отправляется - значит эндпоинты вернут тока данные открытых постов
		// если отпавляется - то открытые посты тоже вернутся, но при этом публичные посты будут 404 посколько нельзя узнать кто автор запроса
		api.Use(middleware.VariableAuthMiddleware())
		{
			api.GET("/post", handlers.GetPost)
			api.GET("/comment", handlers.GetComments)
			api.GET("/like", handlers.GetLikes)
			api.GET("/includes", handlers.GetIncludes)
		}

		api.Use(middleware.AuthMiddleware())
		{

			api.POST("/post", handlers.CreatePost)
			api.PUT("/post", handlers.UpdatePost)
			api.DELETE("/post", handlers.DeletePost)

			api.POST("/comment", handlers.CreateComment)
			api.PUT("/comment", handlers.UpdateComment)
			api.DELETE("/comment", handlers.DeleteComment)

			api.POST("/like", handlers.LikePost)
			api.DELETE("/like", handlers.DeleteLike)

			api.GET("/user/posts", handlers.GetAllUserPosts)

			api.POST("/includes", handlers.LoadIncludes)
			api.DELETE("/includes", handlers.DeleteIncludes)

			api.GET("/favourite", handlers.GetFavourites)
			api.POST("/favourite", handlers.AddFavourites)
			api.DELETE("/favourite", handlers.DeleteFromFavourites)
			api.GET("/favourite/check", handlers.CheckFavourite)
		}
	}

	r.Run(":" + cfg.ServerPort)
}

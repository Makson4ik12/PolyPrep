package middleware

import (
	"net/http"
	"strings"

	"polyprep/config"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	cfg := config.LoadConfig()
	keycloakClient := gocloak.NewClient(cfg.KeycloakURL)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization header is required",
			})
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization header must start with 'Bearer '",
			})
			return
		}

		accessToken := strings.TrimPrefix(authHeader, "Bearer ")
		if accessToken == "" || accessToken == "*" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token format",
			})
			return
		}

		token, _, err := keycloakClient.DecodeAccessToken(
			c.Request.Context(),
			accessToken,
			cfg.Realm,
		)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid or expired token",
				"error":   err.Error(),
			})
			return
		}

		if token == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Token is invalid",
			})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token claims",
			})
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "User ID not found in token",
			})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

func VariableAuthMiddleware() gin.HandlerFunc {
	cfg := config.LoadConfig()
	keycloakClient := gocloak.NewClient(cfg.KeycloakURL)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.Next()
			return
		}

		accessToken := strings.TrimPrefix(authHeader, "Bearer ")
		if accessToken == "" || accessToken == "*" || accessToken == "null" {
			c.Next()
			return
		}

		token, _, err := keycloakClient.DecodeAccessToken(
			c.Request.Context(),
			accessToken,
			cfg.Realm,
		)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid or expired token",
				"error":   err.Error(),
			})
			return
		}

		if token == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Token is invalid",
			})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token claims",
			})
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "User ID not found in token",
			})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

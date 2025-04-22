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

		accessToken := strings.TrimPrefix(authHeader, "Bearer ")
		if accessToken == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Bearer token not found in Authorization header",
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
				"message": "Invalid or expired access token",
				"error":   err.Error(),
			})
			return
		}

		if token == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Token is nil",
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

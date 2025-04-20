package middleware

import (
	"net/http"
	"polyprep/config"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

type TokenRequest struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func AuthMiddleware(keycloakClient *gocloak.GoCloak, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {

		var tokenReq TokenRequest

		if err := c.ShouldBindJSON(&tokenReq); err != nil {

			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				tokenReq.AccessToken = strings.TrimPrefix(authHeader, "Bearer ")
			}
			tokenReq.RefreshToken = c.GetHeader("X-Refresh-Token")
		}

		if tokenReq.AccessToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"details": "Missing access token",
			})
			return
		}

		token, claims, err := keycloakClient.DecodeAccessToken(c.Request.Context(), tokenReq.AccessToken, cfg.Realm)
		if err != nil || token == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid token",
				"details": err.Error(),
			})
			return
		}

		if tokenReq.RefreshToken != "" {
			_, err := keycloakClient.RefreshToken(c.Request.Context(),
				tokenReq.RefreshToken,
				cfg.ClientID,
				cfg.ClientSecret,
				cfg.Realm)

			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error":   "Invalid refresh token",
					"details": err.Error(),
				})
				return
			}
		}

		userID, ok := (*claims)["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in token",
			})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

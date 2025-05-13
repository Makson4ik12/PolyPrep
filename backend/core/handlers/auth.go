package handlers

import (
	"log"
	"net/http"

	// "net/url"
	"polyprep/config"
	"polyprep/database"
	models "polyprep/model"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

var keycloakClient *gocloak.GoCloak

func init() {
	cfg := config.LoadConfig()
	keycloakClient = gocloak.NewClient(cfg.KeycloakURL)
}

func LogoutCallback(c *gin.Context) {
	log.Println("Received logout callback from Keycloak")
	c.Status(http.StatusOK)
}

type AuthRequest struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	NextPage     string `json:"next_page"`
}

func CheckAuth(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	cfg := config.LoadConfig()

	if req.AccessToken == "" {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(cfg, req.NextPage),
			"redirect": true,
		})
		return
	}

	token, _, err := keycloakClient.DecodeAccessToken(c.Request.Context(), req.AccessToken, cfg.Realm)
	if err != nil || token == nil {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(cfg, req.NextPage),
			"redirect": true,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      "",
		"redirect": false,
	})
}

func Logout(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.RefreshToken != "" {
		cfg := config.LoadConfig()
		err := keycloakClient.Logout(c.Request.Context(), cfg.ClientID, cfg.ClientSecret, cfg.Realm, req.RefreshToken)
		if err != nil {
			log.Printf("Keycloak logout error: %v", err)
		}
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.JSON(http.StatusOK, gin.H{})
}

func AuthCallback(c *gin.Context) {
	code := c.Query("code")
	nextPage := c.Query("next_page")

	if code == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	cfg := config.LoadConfig()
	token, err := keycloakClient.GetToken(c.Request.Context(), cfg.Realm, gocloak.TokenOptions{
		GrantType:    gocloak.StringP("authorization_code"),
		Code:         &code,
		ClientID:     &cfg.ClientID,
		ClientSecret: &cfg.ClientSecret,
		RedirectURI:  gocloak.StringP(cfg.RedirectURL + nextPage),
	})

	if err != nil {
		log.Printf("Failed to get token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	userInfo, err := keycloakClient.GetUserInfo(c, token.AccessToken, cfg.Realm)
	if err != nil {
		log.Printf("Failed to get user info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}

	user := models.User{
		UUID:     *userInfo.Sub,
		Username: *userInfo.PreferredUsername,
		Email:    *userInfo.Email,
	}

	if err := database.DB.Where("uuid = ?", user.UUID).FirstOrCreate(&user).Error; err != nil {
		log.Printf("Failed to save user: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
	})
}

func getAuthURL(cfg *config.Config, nextPage string) string {
	baseURL := strings.TrimSuffix(cfg.KeycloakURL, "/")
	return baseURL + "/realms/" + cfg.Realm + "/protocol/openid-connect/auth" +
		"?client_id=" + cfg.ClientID +
		"&response_type=code" +
		"&scope=openid profile" +
		"&redirect_uri=" + cfg.RedirectURL + nextPage
}

func getAuthMobileURL(cfg *config.Config, nextPage string) string {
	baseURL := strings.TrimSuffix(cfg.KeycloakURL, "/")
	return baseURL + "/realms/" + cfg.Realm + "/protocol/openid-connect/auth" +
		"?client_id=" + cfg.ClientID +
		"&response_type=code" +
		"&scope=openid profile" +
		"&redirect_uri=" + cfg.MobileRedirectURL + nextPage
}

func RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	cfg := config.LoadConfig()
	tokens, err := keycloakClient.RefreshToken(
		c.Request.Context(),
		req.RefreshToken,
		cfg.ClientID,
		cfg.ClientSecret,
		cfg.Realm,
	)

	if err != nil {
		log.Printf("Token refresh failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Failed to refresh tokens",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"expires_in":    tokens.ExpiresIn,
	})
}

// ------------------------------GET/auth/mobile/callback------------------------------//

func MobileAuthCallback(c *gin.Context) {

	code := c.Query("code")
	nextView := c.Query("next_page")

	if code == "" || nextView == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Parameters 'code' and 'next_page' are required",
		})
		return
	}

	cfg := config.LoadConfig()

	token, err := keycloakClient.GetToken(c.Request.Context(), cfg.Realm, gocloak.TokenOptions{
		GrantType:    gocloak.StringP("authorization_code"),
		Code:         &code,
		ClientID:     &cfg.ClientID,
		ClientSecret: &cfg.ClientSecret,
		RedirectURI:  gocloak.StringP(cfg.MobileRedirectURL),
	})

	if err != nil {
		log.Printf("Mobile auth callback failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Failed to authenticate",
		})
		return
	}

	userInfo, err := keycloakClient.GetUserInfo(c.Request.Context(), token.AccessToken, cfg.Realm)
	if err != nil {
		log.Printf("Failed to get user info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get user information",
		})
		return
	}

	user := models.User{
		UUID:     *userInfo.Sub,
		Username: *userInfo.PreferredUsername,
		Email:    *userInfo.Email,
	}

	if err := database.DB.Where("uuid = ?", user.UUID).FirstOrCreate(&user).Error; err != nil {
		log.Printf("Failed to save user: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
	})
}

type AuthRequestIOS struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	NextPage     string `json:"next_page"`
}

// ------------------------------POST/auth/mobile/check------------------------------//

func MobileAuthCheck(c *gin.Context) {

	var req AuthRequestIOS

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
		return
	}

	cfg := config.LoadConfig()

	if req.AccessToken == "" {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthMobileURL(cfg, req.NextPage),
			"redirect": true,
		})
		return
	}

	token, _, err := keycloakClient.DecodeAccessToken(c.Request.Context(), req.AccessToken, cfg.Realm)
	if err != nil || token == nil {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthMobileURL(cfg, req.NextPage),
			"redirect": true,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      getAuthMobileURL(cfg, req.NextPage),
		"redirect": false,
	})
}

package handlers

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

type Config struct {
	KeycloakURL  string
	Realm        string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

var (
	keycloakClient *gocloak.GoCloak
	config         Config
)

func LogoutCallback(c *gin.Context) {

	log.Println("Received logout callback from Keycloak")
	c.Status(http.StatusOK)
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func init() {
	config = Config{
		KeycloakURL:  getEnv("KEYCLOAK_URL", "http://90.156.170.153:8091"),
		Realm:        getEnv("REALM", "master"),
		ClientID:     getEnv("CLIENT_ID", "polyclient"),
		ClientSecret: getEnv("CLIENT_SECRET", "WYB2ObPJDY2xBDjpus9wQiWPo96b4Gcs"),
		RedirectURL:  getEnv("REDIRECT_URL", "http://90.156.170.153:3001/"),
	}

	keycloakClient = gocloak.NewClient(config.KeycloakURL)
}

type bodyreq struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	NextPage     string `json:"next_page"`
}

func CheckAuth(c *gin.Context) {
	var br bodyreq

	if err := c.ShouldBindJSON(&br); err != nil {
		log.Println("Bind error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if br.AccessToken == "" {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(br.NextPage),
			"redirect": true,
		})
		return
	}

	token, _, err := keycloakClient.DecodeAccessToken(c.Request.Context(), br.AccessToken, config.Realm)
	if err != nil || token == nil {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(br.NextPage),
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
	var br bodyreq

	if err := c.ShouldBindJSON(&br); err != nil {
		log.Println("Bind error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if br.AccessToken != "" {
		err := keycloakClient.Logout(c.Request.Context(), config.ClientID, config.ClientSecret, config.Realm, br.RefreshToken)
		if err != nil {
			log.Printf("Keycloak logout error: %v", err)
		}
	}

	c.SetSameSite(http.SameSiteLaxMode)

	c.JSON(http.StatusOK, gin.H{})
}

func AuthCallback(c *gin.Context) {
	code := c.Query("code")
	next_page := c.Query("next_page")

	if code == "" {
		return
	}

	token, err := keycloakClient.GetToken(c.Request.Context(), config.Realm, gocloak.TokenOptions{
		GrantType:    gocloak.StringP("authorization_code"),
		Code:         &code,
		ClientID:     &config.ClientID,
		ClientSecret: &config.ClientSecret,
		RedirectURI:  gocloak.StringP(config.RedirectURL + next_page),
	})
	if err != nil {
		log.Printf("Failed to get token: %v", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
	})
}

func getAuthURL(next_page string) string {

	baseURL := strings.TrimSuffix(config.KeycloakURL, "/")
	return baseURL + "/realms/" + config.Realm + "/protocol/openid-connect/auth" +
		"?client_id=" + config.ClientID +
		"&response_type=code" +
		"&scope=openid profile" +
		"&redirect_uri=" + config.RedirectURL + next_page
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func RefreshTokenHandler(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	cfg := config.LoadConfig()
	keycloakClient := gocloak.NewClient(cfg.KeycloakURL)

	tokens, err := keycloakClient.RefreshToken(
		c.Request.Context(),
		req.RefreshToken,
		cfg.ClientID,
		cfg.ClientSecret,
		cfg.Realm,
	)

	if err != nil {
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

package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-contrib/cors"
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

func init() {
	config = Config{
		KeycloakURL:  getEnv("KEYCLOAK_URL", "http://localhost:8091"),
		Realm:        getEnv("REALM", "master"),
		ClientID:     getEnv("CLIENT_ID", "polyclient"),
		ClientSecret: getEnv("CLIENT_SECRET", "opab4laUFRhlvPQgwp8DgSjGYV4kvPdp"),
		RedirectURL:  getEnv("REDIRECT_URL", "http://localhost:3001/login"),
	}

	keycloakClient = gocloak.NewClient(config.KeycloakURL)
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3001"}, // Укажите ваш фронтенд-адрес
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.GET("/check", checkAuth)
			auth.GET("/logout", logout)
			auth.GET("/callback", authCallback)
			auth.POST("/logout/callback", logoutCallback)
		}
	}

	r.Run(":8081")
}

func logoutCallback(c *gin.Context) {

	log.Println("Received logout callback from Keycloak")
	c.Status(http.StatusOK)
}

func checkAuth(c *gin.Context) {
	accessToken := c.Query("access_token")

	log.Println(accessToken)

	if accessToken == "" {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(),
			"redirect": true,
		})
		return
	}

	// Проверяем токен в Keycloak
	token, _, err := keycloakClient.DecodeAccessToken(c.Request.Context(), accessToken, config.Realm)
	if err != nil || token == nil {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(),
			"redirect": true,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      "",
		"redirect": false,
	})
}

func logout(c *gin.Context) {

	refreshToken, _ := c.Cookie("refresh_token")
	log.Println(refreshToken)

	if refreshToken != "" {
		err := keycloakClient.Logout(c.Request.Context(), config.ClientID, config.ClientSecret, config.Realm, refreshToken)
		if err != nil {
			log.Printf("Keycloak logout error: %v", err)
		}
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", "", -1, "/", "", true, true)
	c.SetCookie("refresh_token", "", -1, "/", "", true, true)

	c.Redirect(http.StatusFound, "/auth/check")
}

func authCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusFound, "/")
		return
	}

	token, err := keycloakClient.GetToken(c.Request.Context(), config.Realm, gocloak.TokenOptions{
		GrantType:    gocloak.StringP("authorization_code"),
		Code:         &code,
		ClientID:     &config.ClientID,
		ClientSecret: &config.ClientSecret,
		RedirectURI:  &config.RedirectURL,
	})
	if err != nil {
		log.Printf("Failed to get token: %v", err)
		c.Redirect(http.StatusFound, "/")
		return
	}

	c.SetCookie("access_token", token.AccessToken, int(token.ExpiresIn), "/", "", false, true)
	c.SetCookie("refresh_token", token.RefreshToken, int(token.RefreshExpiresIn), "/", "", false, true)

	c.Redirect(http.StatusFound, "/")
}

func getAuthURL() string {

	baseURL := strings.TrimSuffix(config.KeycloakURL, "/")
	return baseURL + "/realms/" + config.Realm + "/protocol/openid-connect/auth" +
		"?client_id=" + config.ClientID +
		"&response_type=code" +
		"&scope=openid profile" +
		"&redirect_uri=" + config.RedirectURL
}

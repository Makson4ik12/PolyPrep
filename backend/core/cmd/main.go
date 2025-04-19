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
		KeycloakURL:  getEnv("KEYCLOAK_URL", "http://90.156.170.153:8091"),
		Realm:        getEnv("REALM", "master"),
		ClientID:     getEnv("CLIENT_ID", "polyclient"),
		ClientSecret: getEnv("CLIENT_SECRET", "WYB2ObPJDY2xBDjpus9wQiWPo96b4Gcs"),
		RedirectURL:  getEnv("REDIRECT_URL", "http://90.156.170.153:3001/"),
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
			auth.POST("/check", checkAuth)
			auth.POST("/logout", logout)
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

type bodyreq struct {
	access_token  string
	refresh_token string
}

func checkAuth(c *gin.Context) {

	var br bodyreq

	c.ShouldBindJSON(&br)

	log.Println(br.access_token)

	if br.access_token == "" {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(br.next_page),
			"redirect": true,
		})
		return
	}

	token, _, err := keycloakClient.DecodeAccessToken(c.Request.Context(), br.access_token, config.Realm)
	if err != nil || token == nil {
		c.JSON(http.StatusOK, gin.H{
			"url":      getAuthURL(br.next_page),
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

	var br bodyreq

	c.BindJSON(br)

	log.Println(br.access_token)

	if br.access_token != "" {
		err := keycloakClient.Logout(c.Request.Context(), config.ClientID, config.ClientSecret, config.Realm, br.refresh_token)
		if err != nil {
			log.Printf("Keycloak logout error: %v", err)
		}
	}

	c.SetSameSite(http.SameSiteLaxMode)

	c.JSON(http.StatusOK, gin.H{})
}

func authCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
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

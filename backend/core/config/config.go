package config

/*
import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort   string
	KeycloakURL  string
	ClientID     string
	ClientSecret string
	Realm        string
	RedirectURI  string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		ServerPort:   getEnv("SERVER_PORT", "8081"),
		KeycloakURL:  getEnv("KEYCLOAK_URL", "http://localhost:8080"),
		ClientID:     getEnv("CLIENT_ID", "your-client-id"),
		ClientSecret: getEnv("CLIENT_SECRET", "your-client-secret"),
		Realm:        getEnv("REALM", "your-realm"),
		RedirectURI:  getEnv("REDIRECT_URI", "http://localhost:8081/auth/callback"),
	}
}

func getEnv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}
*/

package config

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

func init() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
}

func LoadConfig() *Config {

	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, using environment variables")
	}

	return &Config{
		ServerPort:   GetEnv("SERVER_PORT"),
		KeycloakURL:  GetEnv("KEYCLOAK_URL"),
		ClientID:     GetEnv("CLIENT_ID"),
		ClientSecret: GetEnv("CLIENT_SECRET"),
		Realm:        GetEnv("REALM"),
		RedirectURI:  GetEnv("REDIRECT_URI"),
	}
}
func GetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Critical: Environment variable %s is not set", key)
	}
	return value
}

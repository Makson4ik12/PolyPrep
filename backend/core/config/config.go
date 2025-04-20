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

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		ServerPort:   getEnv("SERVER_PORT", "8081"),
		KeycloakURL:  getEnv("KEYCLOAK_URL", "http://90.156.170.153:8091"),
		ClientID:     getEnv("CLIENT_ID", "polyclient"),
		ClientSecret: getEnv("CLIENT_SECRET", "WYB2ObPJDY2xBDjpus9wQiWPo96b4Gcs"),
		Realm:        getEnv("REALM", "master"),
		RedirectURI:  getEnv("REDIRECT_URI", "http://90.156.170.153:3001/login"),
	}
}

func getEnv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}

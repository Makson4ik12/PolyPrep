package config

type Config struct {
	ServerPort        string
	KeycloakURL       string
	ClientID          string
	ClientSecret      string
	Realm             string
	RedirectURL       string
	MobileRedirectURL string
}

func LoadConfig() *Config {

	return &Config{
		ServerPort:        "8081",
		KeycloakURL:       "http://90.156.170.153:8091",
		ClientID:          "polyclient",
		ClientSecret:      "WYB2ObPJDY2xBDjpus9wQiWPo96b4Gcs",
		Realm:             "master",
		RedirectURL:       "http://90.156.170.153:3001/",
		MobileRedirectURL: "yourapp://oauth-callback",
	}
}

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

type BegetS3Config struct {
	Endpoint        string `json:"endpoint"`
	Bucket          string `json:"bucket"`
	AccessKeyID     string `json:"accessKeyId"`
	SecretAccessKey string `json:"secretAccessKey"`
	Region          string `json:"region"`
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

func LoadBegetS3Config() *BegetS3Config {
	return &BegetS3Config{
		Endpoint:        "https://s3.ru1.storage.beget.cloud",
		Bucket:          "b8b5832ca931-polypreps3",
		AccessKeyID:     "96GQ5LN6LFGCJAGDYPLD",
		SecretAccessKey: "2PRY2BwDghCYkUflnSSljBkP5mqfVovCI0b4Yqf8",
		Region:          "ru1",
	}
}

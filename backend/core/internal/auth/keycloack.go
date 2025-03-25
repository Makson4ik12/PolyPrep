package auth

/*
import (
	"context"
	"net/http"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

type KeycloakClient struct {
	client      *gocloak.GoCloak
	clientID    string
	secret      string
	realm       string
	publicKey   string
	redirectURI string
}

var keycloak *KeycloakClient

func InitKeycloak(clientID, secret, realm, keycloakURL, redirectURI string) {
	keycloak = &KeycloakClient{
		client:      gocloak.NewClient(keycloakURL),
		clientID:    clientID,
		secret:      secret,
		realm:       realm,
		redirectURI: redirectURI,
	}

	// Получаем публичный ключ
	ctx := context.Background()
	cert, err := keycloak.client.GetCerts(ctx, realm)
	if err != nil {
		panic("Failed to get Keycloak certs: " + err.Error())
	}
	if cert.Keys != nil && len(*cert.Keys) > 0 {
		keycloak.publicKey = "-----BEGIN PUBLIC KEY-----\n" + (*cert.Keys)[0].Key + "\n-----END PUBLIC KEY-----"
	}
}

func CheckAuthHandler(c *gin.Context) {
	accessToken, err := c.Cookie("access_token")
	response := gin.H{"redirect": true}

	if err == nil && accessToken != "" {
		_, _, err := keycloak.client.DecodeAccessToken(
			context.Background(),
			accessToken,
			keycloak.realm,
		)
		if err == nil {
			response["redirect"] = false
		}
	}

	if response["redirect"].(bool) {
		response["url"] = keycloak.client.GetRealmLoginURL(
			context.Background(),
			keycloak.realm,
			gocloak.StringP(keycloak.redirectURI),
		)
	}

	c.JSON(http.StatusOK, response)
}

func LogoutHandler(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err == nil && refreshToken != "" {
		err := keycloak.client.Logout(
			context.Background(),
			keycloak.clientID,
			keycloak.secret,
			keycloak.realm,
			refreshToken,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"status": "logged out"})
}

func CallbackHandler(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code parameter is required"})
		return
	}

	token, err := keycloak.client.GetToken(
		context.Background(),
		keycloak.realm,
		gocloak.TokenOptions{
			ClientID:     &keycloak.clientID,
			ClientSecret: &keycloak.secret,
			Code:         &code,
			RedirectURI:  &keycloak.redirectURI,
			GrantType:    gocloak.StringP("authorization_code"),
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("access_token", token.AccessToken, int(token.ExpiresIn), "/", "", false, true)
	c.SetCookie("refresh_token", token.RefreshToken, int(token.RefreshExpiresIn), "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"status": "authenticated"})
}
*/

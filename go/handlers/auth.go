package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

var oauthConfig *oauth2.Config

func InitOAuth() {
	clientID := os.Getenv("OAUTH2_CLIENT_ID")
	clientSecret := os.Getenv("OAUTH2_CLIENT_SECRET")
	env := os.Getenv("ENV")

	fmt.Printf("Initializing OAuth with client ID")

	var redirectURL string
	if env == "development" {
		redirectURL = "http://localhost:5000/google/oauth/callback"
	} else {
		redirectURL = "https://api.calple.date/google/oauth/callback"
	}

	fmt.Printf("Using redirect URL: %s\n", redirectURL)

	oauthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"openid",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

// init OAuth2 configuration
func Login(c *gin.Context) {
	fmt.Printf("Using Redirect URI: %s\n", oauthConfig.RedirectURL)

	state := fmt.Sprintf("%d", time.Now().UnixNano())
	session := sessions.Default(c)
	session.Set("state", state)
	session.Save()
	authURL := oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusFound, authURL)
}

// callback
func Callback(c *gin.Context) {
	// callback route debugging
	fmt.Printf("OAuth callback received with state: %s and code: %s\n",
		c.Query("state"),
		c.Query("code"))

	if c.Query("error") != "" {
		fmt.Printf("OAuth Error: %s, Description: %s\n",
			c.Query("error"),
			c.Query("error_description"))
		c.String(http.StatusBadRequest, "OAuth Error: %s", c.Query("error"))
		return
	}

	// validate state
	session := sessions.Default(c)
	storedState := session.Get("state")
	if storedState == nil || c.Query("state") != storedState {
		c.String(http.StatusBadRequest, "Invalid OAuth state")
		return
	}

	// exchange code for token
	token, err := oauthConfig.Exchange(context.Background(), c.Query("code"))
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Token exchange error: %v", err))
		return
	}

	// fetch user info
	svc, err := oauth2api.NewService(context.Background(), option.WithTokenSource(oauthConfig.TokenSource(context.Background(), token)))
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Failed to create OAuth2 service: %v", err))
		return
	}
	userinfo, err := svc.Userinfo.Get().Do()
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Failed to fetch user info: %v", err))
		return
	}

	// firestore upsert user data after auth
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDocRef := fsClient.Collection("users").Doc(userinfo.Id)
	// check if user already exists
	doc, err := userDocRef.Get(context.Background())
	isReturningUser := false
	if err == nil && doc.Exists() {
		isReturningUser = true
	}

	userData := map[string]interface{}{
		"email": userinfo.Email,
		"name":  userinfo.Name,
		"sex":   "female", // Default sex field to female for new users
		"tokens": map[string]interface{}{
			"access_token":  token.AccessToken,
			"refresh_token": token.RefreshToken,
			"expiry":        token.Expiry,
		},
		"returning_user": isReturningUser,
		"last_login_at":  time.Now(),
	}

	if !isReturningUser {
		userData["created_at"] = time.Now()
	}

	_, err = userDocRef.Set(context.Background(), userData, firestore.MergeAll)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Firestore upsert error: %v", err))
		return
	}

	// set user_id in session
	session.Set("user_id", userinfo.Id)
	session.Save()

	var frontendURL = os.Getenv("FRONTEND_URL")
	c.Redirect(http.StatusFound, frontendURL+"/calendar")
}

// auth status returns whether the user is authenticated
// and user data if authenticated
func AuthStatus(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	doc, err := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	if err != nil || !doc.Exists() {
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}
	data := doc.Data()
	delete(data, "tokens")
	c.JSON(http.StatusOK, gin.H{"authenticated": true, "user": data})
}

// clear session and redirect to frontend
func Logout(c *gin.Context) {
	sessions.Default(c).Clear()
	sessions.Default(c).Save()
	c.Redirect(http.StatusFound, os.Getenv("FRONTEND_URL"))
}

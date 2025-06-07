package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"calple/firebase"
	"calple/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
	}
	fmt.Println("ENV:", os.Getenv("ENV"))

	// initialize OAuth configuration
	handlers.InitOAuth()
	// create context
	ctx := context.Background()

	// initialize firestore client
	fsClient, err := firebase.InitFirebase(ctx)
	if err != nil {
		panic(err)
	}
	defer fsClient.Close()

	r := gin.Default()

	// trusted proxies for prod environment
	if os.Getenv("ENV") != "development" {
		r.SetTrustedProxies([]string{"0.0.0.0/0"})
	}

	// set gin mode for prod
	// in development mode, gin will log requests and errors
	// in production avoid logging requests for performance and security
	if os.Getenv("ENV") != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	// session
	store := cookie.NewStore([]byte(os.Getenv("SECRET_KEY")))
	store.Options(sessions.Options{
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("ENV") != "development",
		SameSite: http.SameSiteLaxMode,
		Domain: func() string {
			if os.Getenv("ENV") == "development" {
				return ""
			}
			return ".calple.date"
		}(),
	})
	r.Use(sessions.Sessions("calple_session", store))

	// CORS
	corsConfig := cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL"), "https://www.calple.date", "https://calple.date"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	// firestore into context
	// this middleware sets the firestore client in the context for use in handlers
	r.Use(func(c *gin.Context) {
		c.Set("firestore", fsClient)
		c.Next()
	})

	// auth routes
	r.GET("/google/oauth/login", handlers.Login)
	r.GET("/google/oauth/callback", handlers.Callback)
	r.GET("/api/auth/status", handlers.AuthStatus)
	r.GET("/google/oauth/logout", handlers.Logout)

	// dday event routes
	api := r.Group("/api")
	{
		api.GET("/ddays", handlers.GetDDays)
		api.POST("/ddays", handlers.CreateDDay)
		api.PUT("/ddays/:id", handlers.UpdateDDay)
		api.DELETE("/ddays/:id", handlers.DeleteDDay)

		api.GET("/connection", handlers.GetConnection)
		api.POST("/connection/invite", handlers.InviteConnection)
		api.GET("/connection/pending", handlers.GetPendingInvitations)
		api.POST("/connection/:id/accept", handlers.AcceptInvitation)
		api.POST("/connection/:id/reject", handlers.RejectInvitation)
	}

	// run server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	r.Run(":" + port)
}

package handlers

import (
	"context"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func DeleteUser(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// get client from context
	fsClient, ok := c.MustGet("firestore").(*firestore.Client)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get Firestore client"})
		return
	}

	ctx := context.Background()
	uidStr := uid.(string)

	// delete user document from users collection
	_, err := fsClient.Collection("users").Doc(uidStr).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user document from database"})
		return
	}

	// clear session
	session.Clear()
	session.Save()

	// clear cookie
	c.SetCookie("session", "", -1, "/", "", true, true)

	c.JSON(http.StatusOK, gin.H{"message": "User account deleted successfully"})
}

package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"

	"calple/util"
)

type Invitation struct {
	ID        string    `json:"id"`
	FromEmail string    `json:"from_email"`
	FromName  string    `json:"from_name"`
	CreatedAt time.Time `json:"createdAt"`
}

// get active connection for current user
func GetConnection(c *gin.Context) {
	// check session for user ID
	// to check if user is logged in
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// get firestore client from context
	// this should be set in main.go when initializing the app
	// before calling this handler
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	// find active connection
	// check if user is user1 or user2 in active connections
	conns, _ := fsClient.Collection("connections").Where("status", "==", "active").Where("user1", "==", userEmail).Documents(context.Background()).GetAll()

	// if no connections found, check the other direction
	if len(conns) == 0 {
		conns, _ = fsClient.Collection("connections").Where("status", "==", "active").Where("user2", "==", userEmail).Documents(context.Background()).GetAll()
	}

	// if still no connections found, return false
	if len(conns) == 0 {
		c.JSON(http.StatusOK, gin.H{"connected": false})
		return
	}

	// if there are multiple connections, return the first one
	conn := conns[0]
	data := conn.Data()

	// if user is user1, partner is user2, and vice versa
	partner := data["user1"].(string)
	if partner == userEmail {
		partner = data["user2"].(string)
	}

	// fetch partner info
	partnerDocs, _ := fsClient.Collection("users").Where("email", "==", partner).Documents(context.Background()).GetAll()
	var partnerInfo map[string]interface{}
	if len(partnerDocs) > 0 {
		partnerInfo = partnerDocs[0].Data()
		// removing sensitive data
		delete(partnerInfo, "passwordHash")
	}

	c.JSON(http.StatusOK, gin.H{
		"connected":    true,
		"connectionId": conn.Ref.ID,
		"partner":      partnerInfo,
	})
}

// invite a connection by user email
// this creates a pending connection that the other user can accept
// if the connection already exists, return an error
func InviteConnection(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	// parse request body
	// expecting JSON body with email field
	var body struct {
		Email string `json:"email" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// validate email format
	if !util.IsValidEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	// normalize email to lowercase and trim whitespace
	// to avoid case sensitivity issues
	target := strings.ToLower(strings.TrimSpace(body.Email))
	if target == userEmail {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot connect to yourself"})
		return
	}

	// check if target user exists
	targets, _ := fsClient.Collection("users").Where("email", "==", target).Documents(context.Background()).GetAll()
	if len(targets) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if connection already exists
	// check both directions: user1 -> user2 and user2 -> user1
	existing, _ := fsClient.Collection("connections").Where("user1", "==", userEmail).Where("user2", "==", target).Documents(context.Background()).GetAll()
	if len(existing) == 0 {
		existing, _ = fsClient.Collection("connections").Where("user1", "==", target).Where("user2", "==", userEmail).Documents(context.Background()).GetAll()
	}
	if len(existing) > 0 {
		status := existing[0].Data()["status"].(string)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Connection %s already", status)})
		return
	}

	// create a new connection document
	// with status "pending"
	now := time.Now()
	connRef := fsClient.Collection("connections").NewDoc()
	connRef.Set(context.Background(), map[string]interface{}{
		"user1":     userEmail,
		"user2":     target,
		"status":    "pending",
		"createdAt": now,
		"updatedAt": now,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Invitation sent", "connectionId": connRef.ID})
}

// list invitation for current user
// this returns all pending invitations where the user is user2
func GetPendingInvitations(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	// find all pending connections where user2 is the current user
	// this means the other user has invited the current user
	pending, _ := fsClient.Collection("connections").Where("status", "==", "pending").Where("user2", "==", userEmail).Documents(context.Background()).GetAll()
	invites := []Invitation{}

	// iterate over pending connections and build the response
	for _, doc := range pending {
		data := doc.Data()
		inviter := data["user1"].(string)
		userDocs, _ := fsClient.Collection("users").Where("email", "==", inviter).Documents(context.Background()).GetAll()
		inviterName := ""
		if len(userDocs) > 0 {
			inviterName = userDocs[0].Data()["name"].(string)
		}
		invites = append(invites, Invitation{
			ID:        doc.Ref.ID,
			FromEmail: inviter,
			FromName:  inviterName,
			CreatedAt: data["createdAt"].(time.Time),
		})
	}
	c.JSON(http.StatusOK, gin.H{"invitations": invites})
}

// accpet invitation and activate the connection
// this updates the connection status to "active"
// access to each others events as well
func AcceptInvitation(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	// check if user is user2 in the connection
	// this means the user has been invited by user1
	connID := c.Param("id")
	connRef := fsClient.Collection("connections").Doc(connID)
	connSnap, err := connRef.Get(context.Background())
	// check if connection exists
	if err != nil || !connSnap.Exists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}

	data := connSnap.Data()
	if data["user2"].(string) != userEmail {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	// update the connection status to "active"
	connRef.Update(context.Background(), []firestore.Update{
		{Path: "status", Value: "active"},
		{Path: "updatedAt", Value: time.Now()},
	})

	inviter := data["user1"].(string)
	// give access to each others events
	// = add the userEmail to the connectedUsers array in each others events
	// inviters events
	it1, _ := fsClient.Collection("ddays").Where("createdBy", "==", inviter).Documents(context.Background()).GetAll()
	for _, doc := range it1 {
		d := doc.Data()
		users := util.ToStringSlice(d["connectedUsers"])
		if !util.Contains(users, userEmail) {
			users = append(users, userEmail)
			fsClient.Collection("ddays").Doc(doc.Ref.ID).Update(context.Background(), []firestore.Update{{Path: "connectedUsers", Value: users}})
		}
	}

	// invitees events
	it2, _ := fsClient.Collection("ddays").Where("createdBy", "==", userEmail).Documents(context.Background()).GetAll()
	for _, doc := range it2 {
		d := doc.Data()
		users := util.ToStringSlice(d["connectedUsers"])
		if !util.Contains(users, inviter) {
			users = append(users, inviter)
			fsClient.Collection("ddays").Doc(doc.Ref.ID).Update(context.Background(), []firestore.Update{{Path: "connectedUsers", Value: users}})
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Invitation accepted"})
}

// reject/remote the invitation
// delete the connection document
// and remove access from each others events
func RejectInvitation(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)
	if userEmail == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	connID := c.Param("id")
	connRef := fsClient.Collection("connections").Doc(connID)
	connSnap, err := connRef.Get(context.Background())
	if err != nil || !connSnap.Exists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}
	data := connSnap.Data()
	user1 := data["user1"].(string)
	user2 := data["user2"].(string)

	// remove access from each others events
	// remove userEmail from connectedUsers array in each other's events
	removeFromEvents := func(owner, target string) {
		docs, _ := fsClient.Collection("ddays").Where("createdBy", "==", owner).Documents(context.Background()).GetAll()
		for _, doc := range docs {
			d := doc.Data()
			users := util.ToStringSlice(d["connectedUsers"])
			if util.Contains(users, target) {
				users = util.Remove(users, target)
				fsClient.Collection("ddays").Doc(doc.Ref.ID).Update(context.Background(), []firestore.Update{{Path: "connectedUsers", Value: users}})
			}
		}
	}
	removeFromEvents(user1, user2)
	removeFromEvents(user2, user1)

	// delete the connection document
	connRef.Delete(context.Background())
	c.JSON(http.StatusOK, gin.H{"message": "Connection removed"})
}

package handlers

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"

	"calple/util"
)

// countdown event structure for DDay
type DDay struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Date           time.Time `json:"date"`
	IsAnnual       bool      `json:"isAnnual"`
	CreatedBy      string    `json:"createdBy"`
	ConnectedUsers []string  `json:"connectedUsers"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// fetch all events for the current user
func GetDDays(c *gin.Context) {
	// et user ID from session
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// get firestore client from context
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	seen := map[string]bool{}
	events := []DDay{}
	queries := [][]*firestore.DocumentSnapshot{}

	// events user is connected or created
	q1, _ := fsClient.Collection("ddays").Where("connectedUsers", "array-contains", userEmail).Documents(context.Background()).GetAll()
	q2, _ := fsClient.Collection("ddays").Where("createdBy", "==", userEmail).Documents(context.Background()).GetAll()
	queries = append(queries, q1, q2)

	// events user is connected to via active connection
	for _, docs := range queries {
		for _, doc := range docs {
			if seen[doc.Ref.ID] {
				continue
			}
			seen[doc.Ref.ID] = true
			data := doc.Data()
			events = append(events, DDay{
				ID:             doc.Ref.ID,
				Title:          data["title"].(string),
				Description:    data["description"].(string),
				Date:           data["date"].(time.Time),
				IsAnnual:       data["isAnnual"].(bool),
				CreatedBy:      data["createdBy"].(string),
				ConnectedUsers: util.ToStringSlice(data["connectedUsers"]),
				CreatedAt:      data["createdAt"].(time.Time),
				UpdatedAt:      data["updatedAt"].(time.Time),
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"ddays": events})
}

// create new event
func CreateDDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	// validate request payload
	var payload struct {
		Title          string   `json:"title" binding:"required"`
		Date           string   `json:"date" binding:"required"`
		IsAnnual       bool     `json:"isAnnual"`
		Description    string   `json:"description"`
		ConnectedUsers []string `json:"connectedUsers"`
	}
	// bind JSON payload to struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// parse date from string to time.Time
	dateParsed, err := time.Parse(time.RFC3339, payload.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// include partner if active connection exists
	connections, _ := fsClient.Collection("connections").Where("status", "==", "active").Where("user1", "==", userEmail).Documents(context.Background()).GetAll()
	if len(connections) == 0 {
		connections, _ = fsClient.Collection("connections").Where("status", "==", "active").Where("user2", "==", userEmail).Documents(context.Background()).GetAll()
	}
	// if an active connection exists, add partner to connected users
	// if partner is not already in connected users
	// this assumes that the connection has a "user1" and "user2" field
	if len(connections) > 0 {
		connData := connections[0].Data()
		partner := connData["user1"].(string)
		if partner == userEmail {
			partner = connData["user2"].(string)
		}
		exists := false
		for _, u := range payload.ConnectedUsers {
			if u == partner {
				exists = true
			}
		}
		if !exists {
			payload.ConnectedUsers = append(payload.ConnectedUsers, partner)
		}
	}

	// create new event document in firestore
	newDoc := fsClient.Collection("ddays").NewDoc()
	now := time.Now()
	docData := map[string]interface{}{
		"title":          payload.Title,
		"description":    payload.Description,
		"date":           dateParsed,
		"isAnnual":       payload.IsAnnual,
		"createdBy":      userEmail,
		"connectedUsers": payload.ConnectedUsers,
		"createdAt":      now,
		"updatedAt":      now,
	}
	// set the document data in firestore
	if _, err := newDoc.Set(context.Background(), docData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// return the created event as response
	response := DDay{
		ID:             newDoc.ID,
		Title:          payload.Title,
		Description:    payload.Description,
		Date:           dateParsed,
		IsAnnual:       payload.IsAnnual,
		CreatedBy:      userEmail,
		ConnectedUsers: payload.ConnectedUsers,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	c.JSON(http.StatusCreated, gin.H{"dday": response})
}

// update existing event
func UpdateDDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fsClient := c.MustGet("firestore").(*firestore.Client)
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	id := c.Param("id")
	ddayRef := fsClient.Collection("ddays").Doc(id)
	docSnap, err := ddayRef.Get(context.Background())
	if err != nil || !docSnap.Exists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "D-Day not found"})
		return
	}

	// check if user is creator of the event
	// or if userEmail is in connectedUsers
	// IMPORTANT: we are allowing connected users to update the event
	data := docSnap.Data()
	if data["createdBy"].(string) != userEmail {
		connectedUsers := util.ToStringSlice(data["connectedUsers"])
		if !util.Contains(connectedUsers, userEmail) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			return
		}
	}

	// validate request payload
	var payload struct {
		Title          *string   `json:"title"`
		Date           *string   `json:"date"`
		IsAnnual       *bool     `json:"isAnnual"`
		Description    *string   `json:"description"`
		ConnectedUsers *[]string `json:"connectedUsers"`
	}
	// bind JSON payload to struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// if date is provided, parse it from string to time.Time
	updates := make([]firestore.Update, 0)
	if payload.Title != nil {
		updates = append(updates, firestore.Update{Path: "title", Value: *payload.Title})
	}
	if payload.Description != nil {
		updates = append(updates, firestore.Update{Path: "description", Value: *payload.Description})
	}
	if payload.Date != nil {
		dt, err := time.Parse(time.RFC3339, *payload.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		updates = append(updates, firestore.Update{Path: "date", Value: dt})
	}
	if payload.IsAnnual != nil {
		updates = append(updates, firestore.Update{Path: "isAnnual", Value: *payload.IsAnnual})
	}
	if payload.ConnectedUsers != nil {
		updates = append(updates, firestore.Update{Path: "connectedUsers", Value: *payload.ConnectedUsers})
	}
	updates = append(updates, firestore.Update{Path: "updatedAt", Value: time.Now()})

	// update the document in firestore
	if _, err := ddayRef.Update(context.Background(), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// fetch the updated document and retur
	updatedSnap, _ := ddayRef.Get(context.Background())
	updated := updatedSnap.Data()
	resp := DDay{
		ID:             id,
		Title:          updated["title"].(string),
		Description:    updated["description"].(string),
		Date:           updated["date"].(time.Time),
		IsAnnual:       updated["isAnnual"].(bool),
		CreatedBy:      updated["createdBy"].(string),
		ConnectedUsers: util.ToStringSlice(updated["connectedUsers"]),
		CreatedAt:      updated["createdAt"].(time.Time),
		UpdatedAt:      updated["updatedAt"].(time.Time),
	}
	c.JSON(http.StatusOK, gin.H{"dday": resp})
}

// delete existing event
func DeleteDDay(c *gin.Context) {
	// get user ID from session
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// get firestore client from context
	fsClient := c.MustGet("firestore").(*firestore.Client)
	// get user email from firestore
	userDoc, _ := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	userEmail := userDoc.Data()["email"].(string)

	id := c.Param("id")
	ddayRef := fsClient.Collection("ddays").Doc(id)
	docSnap, err := ddayRef.Get(context.Background())
	if err != nil || !docSnap.Exists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "D-Day not found"})
		return
	}
	if docSnap.Data()["createdBy"].(string) != userEmail {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only creator can delete"})
		return
	}
	if _, err := ddayRef.Delete(context.Background()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "D-Day deleted"})
}

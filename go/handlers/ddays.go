package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
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
	Group          string    `json:"group"`
	Description    string    `json:"description"`
	Date           string    `json:"date"`
	IsAnnual       bool      `json:"isAnnual"`
	CreatedBy      string    `json:"createdBy"`
	ConnectedUsers []string  `json:"connectedUsers"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// fetch all events for the current user
func GetDDays(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// firestore client from context
	fsClient := c.MustGet("firestore").(*firestore.Client)

	// user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// parse view date from query params
	viewDate := c.Query("view")

	if viewDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing view date parameter"})
		return
	}

	// validate view date format
	// expected format: YYYYMM (6 characters)
	// example: "202510" for October 2025
	if len(viewDate) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYYMM"})
		return
	}

	// get events created by the user
	q1, err := fsClient.Collection("ddays").Where("createdBy", "==", userEmail).Documents(context.Background()).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events: " + err.Error()})
		return
	}

	// get events where user is connected
	q2, err := fsClient.Collection("ddays").Where("connectedUsers", "array-contains", userEmail).Documents(context.Background()).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connected events: " + err.Error()})
		return
	}

	// combine results and remove duplicates
	events := []DDay{}
	seen := make(map[string]bool)

	// iterate through both query results
	// and collect unique events based on document ID
	for _, docs := range [][]*firestore.DocumentSnapshot{q1, q2} {
		for _, doc := range docs {
			if seen[doc.Ref.ID] {
				// skip if already seen
				continue
			}

			data := doc.Data()
			seen[doc.Ref.ID] = true

			// make sure date field exists and is a string
			dateStr, ok := data["date"].(string)
			if !ok {
				fmt.Printf("Warning: Invalid date format for document %s\n", doc.Ref.ID)
				continue
			}

			// check if date string is in the expected format
			// expected format: YYYYMMDD (8 characters) (different from viewDate @getDDays)
			if len(dateStr) != 8 {
				fmt.Printf("Warning: Invalid date string length for document %s: %s\n", doc.Ref.ID, dateStr)
				continue
			}

			// extract year and month from the event date
			eventYearMonth := dateStr[0:6]

			// check if event is annual
			isAnnual, okIsAnnual := data["isAnnual"].(bool)
			if !okIsAnnual {
				fmt.Printf("Warning: Invalid or missing isAnnual field for document %s\n", doc.Ref.ID)
				isAnnual = false
			}

			if !isAnnual {
				if eventYearMonth != viewDate {
					continue
				}
			} else {
				// annual events; only compare the month portion
				viewMonth := viewDate[4:6]
				eventMonth := dateStr[4:6]

				if eventMonth != viewMonth {
					continue
				}
			}

			title, _ := data["title"].(string)

			group := ""
			if grpVal, ok := data["group"]; ok {
				if grpStr, okStr := grpVal.(string); okStr {
					group = grpStr
				}
			}

			description := ""
			if descVal, ok := data["description"]; ok {
				if descStr, okStr := descVal.(string); okStr {
					description = descStr
				}
			}

			createdBy, _ := data["createdBy"].(string)

			var createdAt, updatedAt time.Time
			if ct, ok := data["createdAt"].(time.Time); ok {
				createdAt = ct
			} else {
				// error handling ex) log, set to zero value, or skip doc
				fmt.Printf("Warning: Missing or invalid createdAt for document %s\n", doc.Ref.ID)
			}
			if ut, ok := data["updatedAt"].(time.Time); ok {
				updatedAt = ut
			} else {
				// missing or invalid updatedAt handling
				fmt.Printf("Warning: Missing or invalid updatedAt for document %s\n", doc.Ref.ID)
			}

			events = append(events, DDay{
				ID:             doc.Ref.ID,
				Title:          title,
				Group:          group,
				Description:    description,
				Date:           dateStr,
				IsAnnual:       isAnnual,
				CreatedBy:      createdBy,
				ConnectedUsers: util.ToStringSlice(data["connectedUsers"]),
				CreatedAt:      createdAt,
				UpdatedAt:      updatedAt,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"ddays": events,
		"date":  viewDate,
	})
}

// create new event
func CreateDDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// get firestore client from context
	fsClient := c.MustGet("firestore").(*firestore.Client)

	// get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// parse request body
	var dday DDay
	if err := c.ShouldBindJSON(&dday); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate date format
	if len(dday.Date) != 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYYMMDD"})
		return
	}

	// validate title
	if dday.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
		return
	}

	// Validate date values
	_, err1 := strconv.Atoi(dday.Date[0:4])
	month, err2 := strconv.Atoi(dday.Date[4:6])
	day, err3 := strconv.Atoi(dday.Date[6:8])

	if err1 != nil || err2 != nil || err3 != nil || month < 1 || month > 12 || day < 1 || day > 31 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date values"})
		return
	}

	// Set current time for timestamps
	now := time.Now()

	// Create a new document in the ddays collection
	newDDay := map[string]interface{}{
		"title":          dday.Title,
		"group":          dday.Group,
		"description":    dday.Description,
		"date":           dday.Date,
		"isAnnual":       dday.IsAnnual,
		"createdBy":      userEmail,
		"connectedUsers": dday.ConnectedUsers,
		"createdAt":      now,
		"updatedAt":      now,
	}

	// Add the document to Firestore
	newDoc, _, err := fsClient.Collection("ddays").Add(context.Background(), newDDay)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event: " + err.Error()})
		return
	}

	// Return the created event
	dday.ID = newDoc.ID
	dday.CreatedBy = userEmail
	dday.CreatedAt = now
	dday.UpdatedAt = now

	c.JSON(http.StatusCreated, gin.H{"dday": dday})
}

// update existing event
func UpdateDDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// get firestore client from context
	fsClient := c.MustGet("firestore").(*firestore.Client)

	// get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// parse request body
	var dday DDay
	if err := c.ShouldBindJSON(&dday); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate date format
	if len(dday.Date) != 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYYMMDD"})
		return
	}

	// validate title
	if dday.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
		return
	}

	// Validate date values
	_, err1 := strconv.Atoi(dday.Date[0:4])
	month, err2 := strconv.Atoi(dday.Date[4:6])
	day, err3 := strconv.Atoi(dday.Date[6:8])
	if err1 != nil || err2 != nil || err3 != nil || month < 1 || month > 12 || day < 1 || day > 31 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date values"})
		return
	}

	// get event ID from URL
	id := c.Param("id")
	ddayRef := fsClient.Collection("ddays").Doc(id)
	docSnap, err := ddayRef.Get(context.Background())
	if err != nil || !docSnap.Exists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "D-Day not found"})
		return
	}
	if docSnap.Data()["createdBy"].(string) != userEmail {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only creator can update"})
		return
	}

	// Update the document in Firestore
	updatedDDay := map[string]interface{}{
		"title":          dday.Title,
		"group":          dday.Group,
		"description":    dday.Description,
		"date":           dday.Date,
		"isAnnual":       dday.IsAnnual,
		"connectedUsers": dday.ConnectedUsers,
		"updatedAt":      time.Now(),
	}
	if _, err := ddayRef.Set(context.Background(), updatedDDay, firestore.MergeAll); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event: " + err.Error()})
		return
	}

	// Return the updated event
	dday.ID = id
	dday.CreatedBy = userEmail
	dday.UpdatedAt = time.Now()
	c.JSON(http.StatusOK, gin.H{"dday": dday})

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

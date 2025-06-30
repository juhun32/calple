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
	Date           string    `json:"date,omitempty"`
	EndDate        string    `json:"endDate,omitempty"`
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
	// ex) "202507"

	if viewDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing view date parameter"})
		return
	}

	ctx := context.Background()
	events := []DDay{}
	seen := make(map[string]bool)

	// To find all events that overlap with the current month, we need multiple queries.
	// An event overlaps if its start date is before the month's end AND its end date is after the month's start.
	// Since Firestore can only have one range filter per query, we split this into two main scenarios:
	// 1. Events that START within the current month.
	// 2. Events that START BEFORE the current month but END in or after it.

	viewMonthStart := viewDate + "01"
	viewMonthEnd := viewDate + "31" // Using "31" is safe for YYYYMMDD string comparison.

	// --- Define the queries ---
	queries := []firestore.Query{
		// Query 1: Events created by user that START in the current month.
		fsClient.Collection("ddays").
			Where("createdBy", "==", userEmail).
			Where("date", ">=", viewMonthStart).
			Where("date", "<=", viewMonthEnd),

		// Query 2: Events user is connected to that START in the current month.
		fsClient.Collection("ddays").
			Where("connectedUsers", "array-contains", userEmail).
			Where("date", ">=", viewMonthStart).
			Where("date", "<=", viewMonthEnd),

		// Query 3: Events created by user that START BEFORE the month but are still ongoing.
		fsClient.Collection("ddays").
			Where("createdBy", "==", userEmail).
			Where("date", "<", viewMonthStart).
			Where("endDate", ">=", viewMonthStart),

		// Query 4: Events user is connected to that START BEFORE the month but are still ongoing.
		fsClient.Collection("ddays").
			Where("connectedUsers", "array-contains", userEmail).
			Where("date", "<", viewMonthStart).
			Where("endDate", ">=", viewMonthStart),
	}

	// --- Process results from all queries ---
	for _, q := range queries {
		docs, err := q.Documents(ctx).GetAll()
		if err != nil {
			// Log the error but continue processing other results to show partial data if possible.
			fmt.Printf("Warning: Firestore query failed: %v\n", err)
			continue
		}

		for _, doc := range docs {
			if seen[doc.Ref.ID] {
				continue
			}
			seen[doc.Ref.ID] = true

			data := doc.Data()
			var isAnnual bool
			if val, ok := data["isAnnual"].(bool); ok {
				isAnnual = val
			}

			// For annual events, we still need to check if the month matches,
			// as the main query doesn't handle the year-agnostic nature of these.
			dateStr, _ := data["date"].(string)
			if isAnnual {
				if len(dateStr) >= 6 && dateStr[4:6] != viewDate[4:6] {
					continue // Skip annual events that are not in the current month.
				}
			}

			endDateStr, _ := data["endDate"].(string)
			if endDateStr == "" {
				endDateStr = dateStr
			}

			title, _ := data["title"].(string)
			group, _ := data["group"].(string)
			description, _ := data["description"].(string)
			createdBy, _ := data["createdBy"].(string)
			var createdAt, updatedAt time.Time
			if ct, ok := data["createdAt"].(time.Time); ok {
				createdAt = ct
			}
			if ut, ok := data["updatedAt"].(time.Time); ok {
				updatedAt = ut
			}

			events = append(events, DDay{
				ID:             doc.Ref.ID,
				Title:          title,
				Group:          group,
				Description:    description,
				Date:           dateStr,
				EndDate:        endDateStr,
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

	if dday.Date != "" {
		// validate date format
		// expected format: YYYYMMDD
		if len(dday.Date) != 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYYMMDD"})
			fmt.Println("Invalid date format:", dday.Date)
			return
		}
		_, err1 := strconv.Atoi(dday.Date[0:4])
		month, err2 := strconv.Atoi(dday.Date[4:6])
		day, err3 := strconv.Atoi(dday.Date[6:8])
		if err1 != nil || err2 != nil || err3 != nil || month < 1 || month > 12 || day < 1 || day > 31 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date values"})
			return
		}
	}

	// validate title
	if dday.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
		return
	}

	// set current time for timestamps
	now := time.Now()

	// create a new document in the ddays collection
	newDDay := map[string]interface{}{
		"title":          dday.Title,
		"group":          dday.Group,
		"description":    dday.Description,
		"date":           dday.Date,
		"endDate":        dday.EndDate,
		"isAnnual":       dday.IsAnnual,
		"createdBy":      userEmail,
		"connectedUsers": dday.ConnectedUsers,
		"createdAt":      now,
		"updatedAt":      now,
	}

	// add document to Firestore
	newDoc, _, err := fsClient.Collection("ddays").Add(context.Background(), newDDay)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event: " + err.Error()})
		return
	}

	// return created evetn
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

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if dateVal, ok := updates["date"]; ok {
		dateStr, isString := dateVal.(string)
		if !isString {
			c.JSON(http.StatusBadRequest, gin.H{"error": "date field must be a string"})
			return
		}
		// Only validate non-empty date strings.
		if dateStr != "" {
			if len(dateStr) != 8 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYYMMDD"})
				return
			}
			_, err1 := strconv.Atoi(dateStr[0:4])
			month, err2 := strconv.Atoi(dateStr[4:6])
			day, err3 := strconv.Atoi(dateStr[6:8])
			if err1 != nil || err2 != nil || err3 != nil || month < 1 || month > 12 || day < 1 || day > 31 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date values"})
				return
			}
		}
	}

	if titleVal, ok := updates["title"]; ok {
		if titleStr, isString := titleVal.(string); !isString || titleStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title cannot be empty if provided"})
			return
		}
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

	updates["updatedAt"] = time.Now()

	if _, err := ddayRef.Set(context.Background(), updates, firestore.MergeAll); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event: " + err.Error()})
		return
	}

	updatedDoc, err := ddayRef.Get(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated event"})
		return
	}

	var updatedDDay DDay
	if err := updatedDoc.DataTo(&updatedDDay); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse updated event data"})
		return
	}
	updatedDDay.ID = updatedDoc.Ref.ID

	c.JSON(http.StatusOK, gin.H{"dday": updatedDDay})

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

package handlers

import (
	"calple/util"
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// PeriodDay represents a single period day entry with tracking data
type PeriodDay struct {
	ID         string    `json:"id"`
	UserID     string    `json:"userId"`
	Date       string    `json:"date"`     // Format: YYYY-MM-DD
	IsPeriod   bool      `json:"isPeriod"` // Whether this is a period day
	Symptoms   []string  `json:"symptoms"`
	Mood       []string  `json:"mood"`
	Activities []string  `json:"activities"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// CycleSettings represents user's cycle configuration
type CycleSettings struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	CycleLength  int       `json:"cycleLength"`  // Average cycle length in days
	PeriodLength int       `json:"periodLength"` // Average period length in days
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// GetPeriodDays fetches all period days for the current user
func GetPeriodDays(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Query period days for the user (as subcollection)
	docs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("periodDays").
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch period days"})
		return
	}

	periodDays := []PeriodDay{}
	for _, doc := range docs {
		data := doc.Data()
		periodDays = append(periodDays, PeriodDay{
			ID:         doc.Ref.ID,
			UserID:     uid.(string),
			Date:       data["date"].(string),
			IsPeriod:   data["isPeriod"].(bool),
			Symptoms:   util.ToStringSlice(data["symptoms"]),
			Mood:       util.ToStringSlice(data["mood"]),
			Activities: util.ToStringSlice(data["activities"]),
			Notes:      data["notes"].(string),
			CreatedAt:  data["createdAt"].(time.Time),
			UpdatedAt:  data["updatedAt"].(time.Time),
		})
	}

	c.JSON(http.StatusOK, gin.H{"periodDays": periodDays})
}

// CreatePeriodDay creates a new period day entry
func CreatePeriodDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Parse request body
	var periodDay PeriodDay
	if err := c.ShouldBindJSON(&periodDay); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate date format (YYYY-MM-DD)
	if len(periodDay.Date) != 10 || periodDay.Date[4] != '-' || periodDay.Date[7] != '-' {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Check if period day already exists for this date
	existingDocs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("periodDays").
		Where("date", "==", periodDay.Date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing period day"})
		return
	}

	if len(existingDocs) > 0 {
		// Update existing period day
		_, err = existingDocs[0].Ref.Update(ctx, []firestore.Update{
			{Path: "isPeriod", Value: periodDay.IsPeriod},
			{Path: "symptoms", Value: periodDay.Symptoms},
			{Path: "mood", Value: periodDay.Mood},
			{Path: "activities", Value: periodDay.Activities},
			{Path: "notes", Value: periodDay.Notes},
			{Path: "updatedAt", Value: time.Now()},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update period day"})
			return
		}

		// Return updated period day
		updatedData := existingDocs[0].Data()
		c.JSON(http.StatusOK, PeriodDay{
			ID:         existingDocs[0].Ref.ID,
			UserID:     uid.(string),
			Date:       periodDay.Date,
			IsPeriod:   periodDay.IsPeriod,
			Symptoms:   periodDay.Symptoms,
			Mood:       periodDay.Mood,
			Activities: periodDay.Activities,
			Notes:      periodDay.Notes,
			CreatedAt:  updatedData["createdAt"].(time.Time),
			UpdatedAt:  time.Now(),
		})
		return
	}

	// Create new period day
	docRef, _, err := fsClient.Collection("users").Doc(uid.(string)).Collection("periodDays").Add(ctx, map[string]interface{}{
		"date":       periodDay.Date,
		"isPeriod":   periodDay.IsPeriod,
		"symptoms":   periodDay.Symptoms,
		"mood":       periodDay.Mood,
		"activities": periodDay.Activities,
		"notes":      periodDay.Notes,
		"createdAt":  time.Now(),
		"updatedAt":  time.Now(),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create period day"})
		return
	}

	c.JSON(http.StatusCreated, PeriodDay{
		ID:         docRef.ID,
		UserID:     uid.(string),
		Date:       periodDay.Date,
		IsPeriod:   periodDay.IsPeriod,
		Symptoms:   periodDay.Symptoms,
		Mood:       periodDay.Mood,
		Activities: periodDay.Activities,
		Notes:      periodDay.Notes,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	})
}

// DeletePeriodDay deletes a period day entry
func DeletePeriodDay(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	date := c.Param("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	// Find and delete the period day
	docs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("periodDays").
		Where("date", "==", date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find period day"})
		return
	}

	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Period day not found"})
		return
	}

	// Delete the document
	_, err = docs[0].Ref.Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete period day"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Period day deleted successfully"})
}

// GetCycleSettings fetches cycle settings for the current user
func GetCycleSettings(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Query cycle settings for the user (as subcollection)
	docs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("cycleSettings").
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cycle settings"})
		return
	}

	if len(docs) == 0 {
		// Return default settings if none exist
		c.JSON(http.StatusOK, gin.H{
			"cycleSettings": CycleSettings{
				UserID:       uid.(string),
				CycleLength:  28,
				PeriodLength: 5,
			},
		})
		return
	}

	// Return the first (and should be only) settings document
	data := docs[0].Data()
	settings := CycleSettings{
		ID:           docs[0].Ref.ID,
		UserID:       uid.(string),
		CycleLength:  int(data["cycleLength"].(int64)),
		PeriodLength: int(data["periodLength"].(int64)),
		CreatedAt:    data["createdAt"].(time.Time),
		UpdatedAt:    data["updatedAt"].(time.Time),
	}

	c.JSON(http.StatusOK, gin.H{"cycleSettings": settings})
}

// UpdateCycleSettings updates or creates cycle settings for the current user
func UpdateCycleSettings(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Parse request body
	var settings CycleSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate cycle settings
	if settings.CycleLength < 20 || settings.CycleLength > 45 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cycle length must be between 20 and 45 days"})
		return
	}

	if settings.PeriodLength < 1 || settings.PeriodLength > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Period length must be between 1 and 10 days"})
		return
	}

	// Check if settings already exist
	docs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("cycleSettings").
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing settings"})
		return
	}

	now := time.Now()
	if len(docs) > 0 {
		// Update existing settings
		_, err = docs[0].Ref.Update(ctx, []firestore.Update{
			{Path: "cycleLength", Value: settings.CycleLength},
			{Path: "periodLength", Value: settings.PeriodLength},
			{Path: "updatedAt", Value: now},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cycle settings"})
			return
		}
	} else {
		// Create new settings
		docRef, _, err := fsClient.Collection("users").Doc(uid.(string)).Collection("cycleSettings").Add(ctx, map[string]interface{}{
			"cycleLength":  settings.CycleLength,
			"periodLength": settings.PeriodLength,
			"createdAt":    now,
			"updatedAt":    now,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cycle settings"})
			return
		}
		settings.ID = docRef.ID
	}

	settings.UserID = uid.(string)
	settings.UpdatedAt = now

	c.JSON(http.StatusOK, gin.H{"cycleSettings": settings})
}

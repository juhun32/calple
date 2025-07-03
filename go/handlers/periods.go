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

// PeriodDay represents a single period day entry
type PeriodDay struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Date      string    `json:"date"` // Format: YYYY-MM-DD
	CreatedAt time.Time `json:"createdAt"`
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

// PeriodLog represents daily period tracking data
type PeriodLog struct {
	ID         string    `json:"id"`
	UserID     string    `json:"userId"`
	Date       string    `json:"date"` // Format: YYYY-MM-DD
	Symptoms   []string  `json:"symptoms"`
	Mood       []string  `json:"mood"`
	Activities []string  `json:"activities"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
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

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Query period days for the user
	docs, err := fsClient.Collection("periodDays").
		Where("userEmail", "==", userEmail).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch period days"})
		return
	}

	periodDays := []PeriodDay{}
	for _, doc := range docs {
		data := doc.Data()
		periodDays = append(periodDays, PeriodDay{
			ID:        doc.Ref.ID,
			UserID:    data["userEmail"].(string),
			Date:      data["date"].(string),
			CreatedAt: data["createdAt"].(time.Time),
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

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

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
	existingDocs, err := fsClient.Collection("periodDays").
		Where("userEmail", "==", userEmail).
		Where("date", "==", periodDay.Date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing period day"})
		return
	}

	if len(existingDocs) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Period day already exists for this date"})
		return
	}

	// Create new period day
	docRef, _, err := fsClient.Collection("periodDays").Add(ctx, map[string]interface{}{
		"userEmail": userEmail,
		"date":      periodDay.Date,
		"createdAt": time.Now(),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create period day"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        docRef.ID,
		"userEmail": userEmail,
		"date":      periodDay.Date,
		"createdAt": time.Now(),
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

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	date := c.Param("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	// Find and delete the period day
	docs, err := fsClient.Collection("periodDays").
		Where("userEmail", "==", userEmail).
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

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Query cycle settings for the user
	docs, err := fsClient.Collection("cycleSettings").
		Where("userEmail", "==", userEmail).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cycle settings"})
		return
	}

	if len(docs) == 0 {
		// Return default settings if none exist
		c.JSON(http.StatusOK, gin.H{
			"cycleSettings": CycleSettings{
				UserID:       userEmail,
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
		UserID:       data["userEmail"].(string),
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

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

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
	docs, err := fsClient.Collection("cycleSettings").
		Where("userEmail", "==", userEmail).
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
		docRef, _, err := fsClient.Collection("cycleSettings").Add(ctx, map[string]interface{}{
			"userEmail":    userEmail,
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

	settings.UserID = userEmail
	settings.UpdatedAt = now

	c.JSON(http.StatusOK, gin.H{"cycleSettings": settings})
}

// GetPeriodLogs fetches period logs for the current user
func GetPeriodLogs(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Get date range from query parameters
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	var query firestore.Query
	if startDate != "" && endDate != "" {
		query = fsClient.Collection("periodLogs").
			Where("userEmail", "==", userEmail).
			Where("date", ">=", startDate).
			Where("date", "<=", endDate)
	} else {
		query = fsClient.Collection("periodLogs").
			Where("userEmail", "==", userEmail)
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch period logs"})
		return
	}

	logs := []PeriodLog{}
	for _, doc := range docs {
		data := doc.Data()
		logs = append(logs, PeriodLog{
			ID:         doc.Ref.ID,
			UserID:     data["userEmail"].(string),
			Date:       data["date"].(string),
			Symptoms:   util.ToStringSlice(data["symptoms"]),
			Mood:       util.ToStringSlice(data["mood"]),
			Activities: util.ToStringSlice(data["activities"]),
			Notes:      data["notes"].(string),
			CreatedAt:  data["createdAt"].(time.Time),
			UpdatedAt:  data["updatedAt"].(time.Time),
		})
	}

	c.JSON(http.StatusOK, gin.H{"periodLogs": logs})
}

// CreatePeriodLog creates a new period log entry
func CreatePeriodLog(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Parse request body
	var log PeriodLog
	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate date format (YYYY-MM-DD)
	if len(log.Date) != 10 || log.Date[4] != '-' || log.Date[7] != '-' {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Check if log already exists for this date
	existingDocs, err := fsClient.Collection("periodLogs").
		Where("userEmail", "==", userEmail).
		Where("date", "==", log.Date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing log"})
		return
	}

	if len(existingDocs) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Period log already exists for this date"})
		return
	}

	// Create new period log
	docRef, _, err := fsClient.Collection("periodLogs").Add(ctx, map[string]interface{}{
		"userEmail":  userEmail,
		"date":       log.Date,
		"symptoms":   log.Symptoms,
		"mood":       log.Mood,
		"activities": log.Activities,
		"notes":      log.Notes,
		"createdAt":  time.Now(),
		"updatedAt":  time.Now(),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create period log"})
		return
	}

	log.ID = docRef.ID
	log.UserID = userEmail
	log.CreatedAt = time.Now()
	log.UpdatedAt = time.Now()

	c.JSON(http.StatusCreated, gin.H{"periodLog": log})
}

// UpdatePeriodLog updates an existing period log entry
func UpdatePeriodLog(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Parse request body
	var log PeriodLog
	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate date format (YYYY-MM-DD)
	if len(log.Date) != 10 || log.Date[4] != '-' || log.Date[7] != '-' {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Find existing log
	docs, err := fsClient.Collection("periodLogs").
		Where("userEmail", "==", userEmail).
		Where("date", "==", log.Date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find period log"})
		return
	}

	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Period log not found"})
		return
	}

	// Update the log
	_, err = docs[0].Ref.Update(ctx, []firestore.Update{
		{Path: "symptoms", Value: log.Symptoms},
		{Path: "mood", Value: log.Mood},
		{Path: "activities", Value: log.Activities},
		{Path: "notes", Value: log.Notes},
		{Path: "updatedAt", Value: time.Now()},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update period log"})
		return
	}

	log.ID = docs[0].Ref.ID
	log.UserID = userEmail
	log.UpdatedAt = time.Now()

	c.JSON(http.StatusOK, gin.H{"periodLog": log})
}

// DeletePeriodLog deletes a period log entry
func DeletePeriodLog(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get user email from firestore
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	date := c.Param("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	// Find and delete the period log
	docs, err := fsClient.Collection("periodLogs").
		Where("userEmail", "==", userEmail).
		Where("date", "==", date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find period log"})
		return
	}

	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Period log not found"})
		return
	}

	// Delete the document
	_, err = docs[0].Ref.Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete period log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Period log deleted successfully"})
}

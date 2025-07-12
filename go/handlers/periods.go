package handlers

import (
	"calple/util"
	"context"
	"fmt"
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

// UserMetadata represents user's personal metadata including sex
type UserMetadata struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Sex       string    `json:"sex"` // "male" or "female"
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
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

// GetPartnerPeriodDays fetches period days for the connected partner
func GetPartnerPeriodDays(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get user email
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Find active connection
	connectionDocs, err := fsClient.Collection("connections").
		Where("status", "==", "active").
		Where("user1", "==", userEmail).
		Documents(ctx).GetAll()

	if err == nil && len(connectionDocs) == 0 {
		connectionDocs, err = fsClient.Collection("connections").
			Where("status", "==", "active").
			Where("user2", "==", userEmail).
			Documents(ctx).GetAll()
	}

	if err != nil || len(connectionDocs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active connection found"})
		return
	}

	// Get partner email
	connectionData := connectionDocs[0].Data()
	var partnerEmail string
	if connectionData["user1"] == userEmail {
		partnerEmail = connectionData["user2"].(string)
	} else {
		partnerEmail = connectionData["user1"].(string)
	}

	// Find partner's user ID
	partnerDocs, err := fsClient.Collection("users").
		Where("email", "==", partnerEmail).
		Documents(ctx).GetAll()

	if err != nil || len(partnerDocs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Partner not found"})
		return
	}

	partnerUID := partnerDocs[0].Ref.ID
	fmt.Printf("DEBUG: GetPartnerPeriodDays - userEmail: %s, partnerEmail: %s, partnerUID: %s\n", userEmail, partnerEmail, partnerUID)

	// Get user's sex to determine what data to show
	var userSex string
	userDoc, userErr := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if userErr == nil {
		if sex, ok := userDoc.Data()["sex"].(string); ok {
			userSex = sex
		}
	}

	// Get partner's sex
	var partnerSex string
	partnerDoc, partnerErr := fsClient.Collection("users").Doc(partnerUID).Get(ctx)
	if partnerErr == nil {
		if sex, ok := partnerDoc.Data()["sex"].(string); ok {
			partnerSex = sex
		}
	}

	fmt.Printf("DEBUG: User sex: %s, Partner sex: %s\n", userSex, partnerSex)

	// Query partner's period days
	docs, err := fsClient.Collection("users").Doc(partnerUID).Collection("periodDays").
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner period days"})
		return
	}

	fmt.Printf("DEBUG: Found %d partner period days\n", len(docs))

	periodDays := []PeriodDay{}
	for _, doc := range docs {
		data := doc.Data()

		// Show all partner data regardless of user sex
		periodDays = append(periodDays, PeriodDay{
			ID:         doc.Ref.ID,
			UserID:     partnerUID,
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

	fmt.Printf("DEBUG: Returning %d period days\n", len(periodDays))

	c.JSON(http.StatusOK, gin.H{
		"periodDays": periodDays,
		"partnerSex": partnerSex,
	})
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

// GetUserMetadata fetches user metadata including sex for the current user
func GetUserMetadata(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		fmt.Printf("DEBUG: GetUserMetadata - No user_id in session\n")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	userID := uid.(string)
	fmt.Printf("DEBUG: GetUserMetadata - User ID: %s\n", userID)

	// Get user document directly
	userDoc, err := fsClient.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		fmt.Printf("DEBUG: GetUserMetadata - Error fetching user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
		return
	}

	if !userDoc.Exists() {
		fmt.Printf("DEBUG: GetUserMetadata - User document does not exist for ID: %s\n", userID)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userData := userDoc.Data()
	fmt.Printf("DEBUG: GetUserMetadata - User data keys: %v\n", util.GetMapKeys(userData))

	// Safely extract sex field
	sex := ""
	if userData["sex"] != nil {
		if sexStr, ok := userData["sex"].(string); ok {
			sex = sexStr
		} else {
			fmt.Printf("DEBUG: GetUserMetadata - Sex field is not a string: %T\n", userData["sex"])
		}
	}

	// Handle optional timestamp fields with safe type assertions
	createdAt := time.Now()
	if userData["created_at"] != nil {
		if createdTime, ok := userData["created_at"].(time.Time); ok {
			createdAt = createdTime
		} else {
			fmt.Printf("DEBUG: GetUserMetadata - created_at field is not time.Time: %T\n", userData["created_at"])
		}
	}

	updatedAt := time.Now()
	if userData["last_login_at"] != nil {
		if updatedTime, ok := userData["last_login_at"].(time.Time); ok {
			updatedAt = updatedTime
		} else {
			fmt.Printf("DEBUG: GetUserMetadata - last_login_at field is not time.Time: %T\n", userData["last_login_at"])
		}
	}

	metadata := UserMetadata{
		ID:        userDoc.Ref.ID,
		UserID:    userID,
		Sex:       sex,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}

	fmt.Printf("DEBUG: GetUserMetadata - Successfully created metadata for user: %s\n", userID)
	c.JSON(http.StatusOK, gin.H{"userMetadata": metadata})
}

// UpdateUserMetadata updates user sex in the users collection
func UpdateUserMetadata(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		fmt.Printf("DEBUG: UpdateUserMetadata - No user_id in session\n")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Parse request body
	var metadata UserMetadata
	if err := c.ShouldBindJSON(&metadata); err != nil {
		fmt.Printf("DEBUG: UpdateUserMetadata - Invalid request body: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate sex value
	if metadata.Sex != "male" && metadata.Sex != "female" {
		fmt.Printf("DEBUG: UpdateUserMetadata - Invalid sex value: %s\n", metadata.Sex)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sex must be either 'male' or 'female'"})
		return
	}

	userID := uid.(string)
	fmt.Printf("DEBUG: UpdateUserMetadata - Updating metadata for user: %s, sex: %s\n", userID, metadata.Sex)

	// Update user document directly
	_, err := fsClient.Collection("users").Doc(userID).Update(ctx, []firestore.Update{
		{Path: "sex", Value: metadata.Sex},
		{Path: "last_login_at", Value: time.Now()},
	})

	if err != nil {
		fmt.Printf("DEBUG: UpdateUserMetadata - Error updating user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user metadata"})
		return
	}

	// Get updated user data
	userDoc, err := fsClient.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		fmt.Printf("DEBUG: UpdateUserMetadata - Error fetching updated user data: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user data"})
		return
	}

	userData := userDoc.Data()
	metadata.ID = userDoc.Ref.ID
	metadata.UserID = userID

	// Safely extract updated timestamp
	if userData["last_login_at"] != nil {
		if updatedTime, ok := userData["last_login_at"].(time.Time); ok {
			metadata.UpdatedAt = updatedTime
		} else {
			fmt.Printf("DEBUG: UpdateUserMetadata - last_login_at field is not time.Time: %T\n", userData["last_login_at"])
			metadata.UpdatedAt = time.Now()
		}
	} else {
		metadata.UpdatedAt = time.Now()
	}

	fmt.Printf("DEBUG: UpdateUserMetadata - Successfully updated metadata for user: %s\n", userID)
	c.JSON(http.StatusOK, gin.H{"userMetadata": metadata})
}

// GetPartnerMetadata fetches partner's metadata for connected users
func GetPartnerMetadata(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get current user's email
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// First, get the user's connection to find their partner
	connectionDocs, err := fsClient.Collection("connections").
		Where("status", "==", "active").
		Where("user1", "==", userEmail).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connection"})
		return
	}

	// If no connection found as user1, check as user2
	if len(connectionDocs) == 0 {
		connectionDocs, err = fsClient.Collection("connections").
			Where("status", "==", "active").
			Where("user2", "==", userEmail).
			Documents(ctx).GetAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connection"})
			return
		}
	}

	if len(connectionDocs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No partner connection found"})
		return
	}

	// Determine partner's email
	connectionData := connectionDocs[0].Data()
	var partnerEmail string
	if connectionData["user1"] == userEmail {
		partnerEmail = connectionData["user2"].(string)
	} else {
		partnerEmail = connectionData["user1"].(string)
	}

	// Get partner's user document by email
	partnerUserDocs, err := fsClient.Collection("users").
		Where("email", "==", partnerEmail).
		Documents(ctx).GetAll()

	if err != nil || len(partnerUserDocs) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner data"})
		return
	}

	partnerUserData := partnerUserDocs[0].Data()
	partnerSex := ""
	if partnerUserData["sex"] != nil {
		partnerSex = partnerUserData["sex"].(string)
	}

	// Handle optional timestamp fields
	createdAt := time.Now()
	if partnerUserData["created_at"] != nil {
		createdAt = partnerUserData["created_at"].(time.Time)
	}

	updatedAt := time.Now()
	if partnerUserData["last_login_at"] != nil {
		updatedAt = partnerUserData["last_login_at"].(time.Time)
	}

	metadata := UserMetadata{
		ID:        partnerUserDocs[0].Ref.ID,
		UserID:    partnerUserDocs[0].Ref.ID,
		Sex:       partnerSex,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"partnerMetadata": metadata})
}

// CheckinData represents a daily checkin entry
type CheckinData struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	Date         string    `json:"date"`         // Format: YYYY-MM-DD
	Mood         string    `json:"mood"`         // "great", "good", "okay", "bad", "terrible"
	Energy       string    `json:"energy"`       // "high", "medium", "low"
	PeriodStatus string    `json:"periodStatus"` // "on", "off", "starting", "ending"
	SexualMood   string    `json:"sexualMood"`   // "very_horny", "horny", "interested", "neutral", "not_interested"
	Note         string    `json:"note"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// PartnerCheckin represents partner's checkin data with user info
type PartnerCheckin struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	UserName     string    `json:"userName"`
	UserEmail    string    `json:"userEmail"`
	UserSex      string    `json:"userSex"`
	Date         string    `json:"date"`
	Mood         string    `json:"mood"`
	Energy       string    `json:"energy"`
	PeriodStatus string    `json:"periodStatus"`
	SexualMood   string    `json:"sexualMood"`
	Note         string    `json:"note"`
	CreatedAt    time.Time `json:"createdAt"`
}

// CreateCheckin creates or updates a daily checkin
func CreateCheckin(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Parse request body
	var checkin CheckinData
	if err := c.ShouldBindJSON(&checkin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate date format (YYYY-MM-DD)
	if len(checkin.Date) != 10 || checkin.Date[4] != '-' || checkin.Date[7] != '-' {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Validate mood
	validMoods := []string{"great", "good", "okay", "bad", "terrible"}
	moodValid := false
	for _, mood := range validMoods {
		if checkin.Mood == mood {
			moodValid = true
			break
		}
	}
	if !moodValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood value"})
		return
	}

	// Validate energy
	validEnergies := []string{"high", "medium", "low"}
	energyValid := false
	for _, energy := range validEnergies {
		if checkin.Energy == energy {
			energyValid = true
			break
		}
	}
	if !energyValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid energy value"})
		return
	}

	// Validate period status if provided
	if checkin.PeriodStatus != "" {
		validPeriodStatuses := []string{"on", "off", "starting", "ending"}
		periodStatusValid := false
		for _, status := range validPeriodStatuses {
			if checkin.PeriodStatus == status {
				periodStatusValid = true
				break
			}
		}
		if !periodStatusValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid period status value"})
			return
		}
	}

	// Validate sexual mood if provided
	if checkin.SexualMood != "" {
		validSexualMoods := []string{"very_horny", "horny", "interested", "neutral", "not_interested"}
		sexualMoodValid := false
		for _, mood := range validSexualMoods {
			if checkin.SexualMood == mood {
				sexualMoodValid = true
				break
			}
		}
		if !sexualMoodValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sexual mood value"})
			return
		}
	}

	// Check if checkin already exists for this date
	existingDocs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("checkins").
		Where("date", "==", checkin.Date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing checkin"})
		return
	}

	now := time.Now()
	if len(existingDocs) > 0 {
		// Update existing checkin
		_, err = existingDocs[0].Ref.Update(ctx, []firestore.Update{
			{Path: "mood", Value: checkin.Mood},
			{Path: "energy", Value: checkin.Energy},
			{Path: "periodStatus", Value: checkin.PeriodStatus},
			{Path: "sexualMood", Value: checkin.SexualMood},
			{Path: "note", Value: checkin.Note},
			{Path: "updatedAt", Value: now},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update checkin"})
			return
		}

		// Return updated checkin
		updatedData := existingDocs[0].Data()
		c.JSON(http.StatusOK, gin.H{"checkin": CheckinData{
			ID:           existingDocs[0].Ref.ID,
			UserID:       uid.(string),
			Date:         checkin.Date,
			Mood:         checkin.Mood,
			Energy:       checkin.Energy,
			PeriodStatus: checkin.PeriodStatus,
			SexualMood:   checkin.SexualMood,
			Note:         checkin.Note,
			CreatedAt:    updatedData["createdAt"].(time.Time),
			UpdatedAt:    now,
		}})
		return
	}

	// Create new checkin
	docRef, _, err := fsClient.Collection("users").Doc(uid.(string)).Collection("checkins").Add(ctx, map[string]interface{}{
		"date":         checkin.Date,
		"mood":         checkin.Mood,
		"energy":       checkin.Energy,
		"periodStatus": checkin.PeriodStatus,
		"sexualMood":   checkin.SexualMood,
		"note":         checkin.Note,
		"createdAt":    now,
		"updatedAt":    now,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create checkin"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"checkin": CheckinData{
		ID:           docRef.ID,
		UserID:       uid.(string),
		Date:         checkin.Date,
		Mood:         checkin.Mood,
		Energy:       checkin.Energy,
		PeriodStatus: checkin.PeriodStatus,
		SexualMood:   checkin.SexualMood,
		Note:         checkin.Note,
		CreatedAt:    now,
		UpdatedAt:    now,
	}})
}

// GetTodayCheckin fetches today's checkin for the current user
func GetTodayCheckin(c *gin.Context) {
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

	// Query checkin for the specific date
	docs, err := fsClient.Collection("users").Doc(uid.(string)).Collection("checkins").
		Where("date", "==", date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch checkin"})
		return
	}

	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Checkin not found"})
		return
	}

	// Return the checkin
	data := docs[0].Data()

	// Handle optional timestamp fields
	createdAt := time.Now()
	if data["createdAt"] != nil {
		createdAt = data["createdAt"].(time.Time)
	}

	updatedAt := time.Now()
	if data["updatedAt"] != nil {
		updatedAt = data["updatedAt"].(time.Time)
	}

	checkin := CheckinData{
		ID:           docs[0].Ref.ID,
		UserID:       uid.(string),
		Date:         data["date"].(string),
		Mood:         data["mood"].(string),
		Energy:       data["energy"].(string),
		PeriodStatus: util.GetStringValue(data, "periodStatus"),
		SexualMood:   util.GetStringValue(data, "sexualMood"),
		Note:         util.GetStringValue(data, "note"),
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"checkin": checkin})
}

// GetPartnerCheckin fetches partner's checkin for a specific date
func GetPartnerCheckin(c *gin.Context) {
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

	// Get current user's email
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// First, get the user's connection to find their partner
	connectionDocs, err := fsClient.Collection("connections").
		Where("status", "==", "active").
		Where("user1", "==", userEmail).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connection"})
		return
	}

	// If no connection found as user1, check as user2
	if len(connectionDocs) == 0 {
		connectionDocs, err = fsClient.Collection("connections").
			Where("status", "==", "active").
			Where("user2", "==", userEmail).
			Documents(ctx).GetAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connection"})
			return
		}
	}

	if len(connectionDocs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No partner connection found"})
		return
	}

	// Determine partner's email
	connectionData := connectionDocs[0].Data()
	var partnerEmail string
	if connectionData["user1"] == userEmail {
		partnerEmail = connectionData["user2"].(string)
	} else {
		partnerEmail = connectionData["user1"].(string)
	}

	// Get partner's user info by email
	partnerUserDocs, err := fsClient.Collection("users").
		Where("email", "==", partnerEmail).
		Documents(ctx).GetAll()

	if err != nil || len(partnerUserDocs) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner user info"})
		return
	}

	partnerUserData := partnerUserDocs[0].Data()
	partnerName := partnerUserData["name"].(string)
	partnerID := partnerUserDocs[0].Ref.ID

	// Get partner's sex from user document
	partnerSex := ""
	if partnerUserData["sex"] != nil {
		partnerSex = partnerUserData["sex"].(string)
	}

	// Get partner's checkin for the date
	checkinDocs, err := fsClient.Collection("users").Doc(partnerID).Collection("checkins").
		Where("date", "==", date).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner checkin"})
		return
	}

	if len(checkinDocs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Partner checkin not found"})
		return
	}

	// Return partner's checkin
	data := checkinDocs[0].Data()

	// Handle optional timestamp fields
	createdAt := time.Now()
	if data["createdAt"] != nil {
		createdAt = data["createdAt"].(time.Time)
	}

	partnerCheckin := PartnerCheckin{
		ID:           checkinDocs[0].Ref.ID,
		UserID:       partnerID,
		UserName:     partnerName,
		UserEmail:    partnerEmail,
		UserSex:      partnerSex,
		Date:         data["date"].(string),
		Mood:         data["mood"].(string),
		Energy:       data["energy"].(string),
		PeriodStatus: util.GetStringValue(data, "periodStatus"),
		SexualMood:   util.GetStringValue(data, "sexualMood"),
		Note:         util.GetStringValue(data, "note"),
		CreatedAt:    createdAt,
	}

	c.JSON(http.StatusOK, gin.H{"partnerCheckin": partnerCheckin})
}

// DebugConnection is a test endpoint to verify connection status
func DebugConnection(c *gin.Context) {
	session := sessions.Default(c)
	uid := session.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fsClient := c.MustGet("firestore").(*firestore.Client)
	ctx := context.Background()

	// Get current user's email
	userDoc, err := fsClient.Collection("users").Doc(uid.(string)).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
		return
	}
	userEmail := userDoc.Data()["email"].(string)

	// Check for active connections
	connectionDocs, err := fsClient.Collection("connections").
		Where("status", "==", "active").
		Where("user1", "==", userEmail).
		Documents(ctx).GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connections"})
		return
	}

	// If no connection found as user1, check as user2
	if len(connectionDocs) == 0 {
		connectionDocs, err = fsClient.Collection("connections").
			Where("status", "==", "active").
			Where("user2", "==", userEmail).
			Documents(ctx).GetAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch connections"})
			return
		}
	}

	debugInfo := map[string]interface{}{
		"userId":        uid.(string),
		"userEmail":     userEmail,
		"hasConnection": len(connectionDocs) > 0,
	}

	if len(connectionDocs) > 0 {
		connectionData := connectionDocs[0].Data()
		debugInfo["connection"] = connectionData
		debugInfo["connectionId"] = connectionDocs[0].Ref.ID
	}

	c.JSON(http.StatusOK, debugInfo)
}

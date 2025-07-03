# Period Tracking API Documentation

This document describes the backend API endpoints for the period tracking functionality.

## Authentication

All endpoints require authentication via session cookies. The user must be logged in to access any period tracking features.

## Base URL

```
http://localhost:5000/api/periods
```

## Endpoints

### Period Days

#### GET /api/periods/days

Get all period days for the current user.

**Response:**

```json
{
    "periodDays": [
        {
            "id": "doc_id",
            "userId": "user@example.com",
            "date": "2024-07-01",
            "createdAt": "2024-07-01T10:00:00Z"
        }
    ]
}
```

#### POST /api/periods/days

Create a new period day entry.

**Request Body:**

```json
{
    "date": "2024-07-01"
}
```

**Response:**

```json
{
    "id": "doc_id",
    "userEmail": "user@example.com",
    "date": "2024-07-01",
    "createdAt": "2024-07-01T10:00:00Z"
}
```

#### DELETE /api/periods/days/:date

Delete a period day entry.

**Parameters:**

-   `date`: Date in YYYY-MM-DD format

**Response:**

```json
{
    "message": "Period day deleted successfully"
}
```

### Cycle Settings

#### GET /api/periods/settings

Get cycle settings for the current user.

**Response:**

```json
{
    "cycleSettings": {
        "id": "doc_id",
        "userId": "user@example.com",
        "cycleLength": 28,
        "periodLength": 5,
        "createdAt": "2024-07-01T10:00:00Z",
        "updatedAt": "2024-07-01T10:00:00Z"
    }
}
```

#### PUT /api/periods/settings

Update or create cycle settings for the current user.

**Request Body:**

```json
{
    "cycleLength": 28,
    "periodLength": 5
}
```

**Validation Rules:**

-   `cycleLength`: Must be between 20 and 45 days
-   `periodLength`: Must be between 1 and 10 days

**Response:**

```json
{
    "cycleSettings": {
        "id": "doc_id",
        "userId": "user@example.com",
        "cycleLength": 28,
        "periodLength": 5,
        "createdAt": "2024-07-01T10:00:00Z",
        "updatedAt": "2024-07-01T10:00:00Z"
    }
}
```

### Period Logs

#### GET /api/periods/logs

Get period logs for the current user.

**Query Parameters:**

-   `startDate` (optional): Start date in YYYY-MM-DD format
-   `endDate` (optional): End date in YYYY-MM-DD format

**Response:**

```json
{
    "periodLogs": [
        {
            "id": "doc_id",
            "userId": "user@example.com",
            "date": "2024-07-01",
            "symptoms": ["cramps", "fatigue"],
            "mood": ["happy"],
            "activities": ["exercise"],
            "notes": "Feeling good today",
            "createdAt": "2024-07-01T10:00:00Z",
            "updatedAt": "2024-07-01T10:00:00Z"
        }
    ]
}
```

#### POST /api/periods/logs

Create a new period log entry.

**Request Body:**

```json
{
    "date": "2024-07-01",
    "symptoms": ["cramps", "fatigue"],
    "mood": ["happy"],
    "activities": ["exercise"],
    "notes": "Feeling good today"
}
```

**Response:**

```json
{
    "periodLog": {
        "id": "doc_id",
        "userId": "user@example.com",
        "date": "2024-07-01",
        "symptoms": ["cramps", "fatigue"],
        "mood": ["happy"],
        "activities": ["exercise"],
        "notes": "Feeling good today",
        "createdAt": "2024-07-01T10:00:00Z",
        "updatedAt": "2024-07-01T10:00:00Z"
    }
}
```

#### PUT /api/periods/logs

Update an existing period log entry.

**Request Body:**

```json
{
    "date": "2024-07-01",
    "symptoms": ["cramps", "fatigue"],
    "mood": ["happy"],
    "activities": ["exercise"],
    "notes": "Feeling good today"
}
```

**Response:**

```json
{
    "periodLog": {
        "id": "doc_id",
        "userId": "user@example.com",
        "date": "2024-07-01",
        "symptoms": ["cramps", "fatigue"],
        "mood": ["happy"],
        "activities": ["exercise"],
        "notes": "Feeling good today",
        "createdAt": "2024-07-01T10:00:00Z",
        "updatedAt": "2024-07-01T10:00:00Z"
    }
}
```

#### DELETE /api/periods/logs/:date

Delete a period log entry.

**Parameters:**

-   `date`: Date in YYYY-MM-DD format

**Response:**

```json
{
    "message": "Period log deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
    "error": "Invalid request body"
}
```

### 401 Unauthorized

```json
{
    "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
    "error": "Period day not found"
}
```

### 409 Conflict

```json
{
    "error": "Period day already exists for this date"
}
```

### 500 Internal Server Error

```json
{
    "error": "Failed to create period day"
}
```

## Data Models

### PeriodDay

```go
type PeriodDay struct {
    ID        string    `json:"id"`
    UserID    string    `json:"userId"`
    Date      string    `json:"date"` // Format: YYYY-MM-DD
    CreatedAt time.Time `json:"createdAt"`
}
```

### CycleSettings

```go
type CycleSettings struct {
    ID           string    `json:"id"`
    UserID       string    `json:"userId"`
    CycleLength  int       `json:"cycleLength"`  // Average cycle length in days
    PeriodLength int       `json:"periodLength"` // Average period length in days
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
}
```

### PeriodLog

```go
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
```

## Firestore Collections

The API uses the following Firestore collections:

-   `periodDays`: Stores individual period day entries
-   `cycleSettings`: Stores user cycle configuration
-   `periodLogs`: Stores daily period tracking data

All collections use the user's email as the primary identifier for data isolation.

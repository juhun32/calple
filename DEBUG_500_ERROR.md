# Debugging 500 Error and Metadata Fetch Failure

## Problem Description

The application is experiencing a 500 error when trying to fetch user metadata, specifically:

-   `Failed to load resource: the server responded with a status of 500 ()`
-   `Failed to load metadata: Error: Failed to fetch user metadata`

## Recent Improvements Made

### 1. Enhanced Error Handling in Backend

-   Added detailed logging to `GetUserMetadata` and `UpdateUserMetadata` functions
-   Improved type assertion safety to prevent panics
-   Added user document existence checks
-   Better error messages for different failure scenarios

### 2. Request Logging Middleware

-   Added comprehensive request logging to track all API calls
-   Logs request method, path, status code, and latency
-   Special logging for error responses (status >= 400)

### 3. Firebase Connection Diagnostics

-   Enhanced Firebase initialization with detailed logging
-   Added health check endpoints (`/health` and `/api/health/firebase`)
-   Better error handling for credential file issues

### 4. Frontend Error Handling

-   Improved error messages in API calls
-   Better user feedback with specific error descriptions
-   Enhanced error logging for debugging

## Debugging Steps

### Step 1: Test Backend Connectivity

Run the test script to check basic connectivity:

```bash
python test_backend.py
```

### Step 2: Check Backend Logs

Look for these specific log messages in your backend logs:

**Successful requests:**

```
DEBUG: GET /api/periods/metadata - Status: 200, Latency: 123ms
DEBUG: GetUserMetadata - User ID: [user_id]
DEBUG: GetUserMetadata - User data keys: [email, name, sex, created_at, last_login_at]
DEBUG: GetUserMetadata - Successfully created metadata for user: [user_id]
```

**Error scenarios:**

```
DEBUG: GetUserMetadata - No user_id in session
DEBUG: GetUserMetadata - Error fetching user: [firebase_error]
DEBUG: GetUserMetadata - User document does not exist for ID: [user_id]
DEBUG: GetUserMetadata - Sex field is not a string: [actual_type]
```

### Step 3: Check Environment Variables

Ensure these environment variables are properly set in production:

**Required for Backend:**

-   `FIREBASE_CREDENTIALS_JSON` - Firebase service account credentials
-   `SECRET_KEY` - Session encryption key
-   `ENV` - Environment (should be "production" in prod)
-   `FRONTEND_URL` - Frontend URL for CORS

**Required for Frontend:**

-   `NEXT_PUBLIC_BACKEND_URL` - Backend API URL

### Step 4: Test Health Endpoints

Check these endpoints directly:

1. **Basic Health Check:**

    ```
    GET https://api.calple.date/health
    ```

2. **Firebase Connectivity:**
    ```
    GET https://api.calple.date/api/health/firebase
    ```

### Step 5: Check Session/Authentication

The most common cause of 500 errors is session issues:

1. **Check if user is properly authenticated:**

    ```
    GET https://api.calple.date/api/auth/status
    ```

2. **Verify session cookie is being sent:**

    - Check browser dev tools → Network tab
    - Look for `calple_session` cookie in requests

3. **Check session configuration:**
    - Domain: `.calple.date` (production)
    - Secure: `true` (production)
    - SameSite: `Lax`

## Common Issues and Solutions

### Issue 1: Firebase Connection Problems

**Symptoms:** Firebase-related errors in logs
**Solutions:**

-   Verify `FIREBASE_CREDENTIALS_JSON` is properly set
-   Check Firebase project permissions
-   Ensure Firestore is enabled in Firebase console

### Issue 2: Session/Authentication Problems

**Symptoms:** "No user_id in session" in logs
**Solutions:**

-   Check if user is properly logged in
-   Verify session cookie domain matches your domain
-   Check if session has expired

### Issue 3: Data Type Issues

**Symptoms:** Type assertion errors in logs
**Solutions:**

-   The improved code now handles these safely
-   Check if user data in Firestore has correct field types

### Issue 4: Missing User Document

**Symptoms:** "User document does not exist" in logs
**Solutions:**

-   User may not have been properly created during OAuth
-   Check Firestore for user document existence
-   Re-authenticate user if needed

## Monitoring and Alerts

### Key Metrics to Monitor:

1. **Error Rate:** Percentage of 500 errors on `/api/periods/metadata`
2. **Response Time:** Latency for metadata requests
3. **Authentication Failures:** 401 errors
4. **Firebase Connection:** Health check endpoint status

### Log Patterns to Watch:

-   `DEBUG: GetUserMetadata - Error fetching user:`
-   `DEBUG: GetUserMetadata - No user_id in session`
-   `DEBUG: GetUserMetadata - User document does not exist`

## Next Steps

1. **Deploy the improved code** with better error handling
2. **Monitor the logs** for the specific error patterns
3. **Test the health endpoints** to verify connectivity
4. **Check user authentication** status for affected users
5. **Verify Firebase credentials** and permissions

## Support

If the issue persists after implementing these improvements:

1. Check the detailed logs for specific error messages
2. Test the health endpoints to isolate the problem
3. Verify environment variables and configuration
4. Contact the development team with specific error logs

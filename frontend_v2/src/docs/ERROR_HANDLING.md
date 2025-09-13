# Error Handling System

This document describes the comprehensive error handling system implemented in the HRMS frontend application.

## Overview

The error handling system provides:
- **Structured error handling** for all API responses
- **User-friendly error messages** with appropriate styling
- **Automatic logout** for authentication errors
- **Retry functionality** for recoverable errors
- **Global error management** across the application

## Architecture

### 1. Error Classes (`src/utils/errorHandler.js`)

#### `ApiError` Class
```javascript
class ApiError extends Error {
  constructor(message, statusCode, type = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
  }
}
```

#### Error Types
- `AUTH_ERROR` - Authentication failures (401)
- `PERMISSION_ERROR` - Access denied (403)
- `VALIDATION_ERROR` - Input validation errors (400, 422)
- `NOT_FOUND_ERROR` - Resource not found (404)
- `RATE_LIMIT_ERROR` - Too many requests (429)
- `SERVER_ERROR` - Server-side errors (500)
- `NETWORK_ERROR` - Network connectivity issues
- `TIMEOUT_ERROR` - Request timeout

### 2. API Service (`src/services/api.js`)

The API service automatically:
- Converts HTTP errors to `ApiError` instances
- Adds metadata (shouldLogout, shouldRetry, userMessage)
- Handles network and timeout errors
- Provides structured error information

### 3. Error Handler Hook (`src/hooks/useErrorHandler.js`)

```javascript
const { error, handleError, clearError, handleRetry } = useErrorHandler();
```

### 4. Error Display Component (`src/components/ErrorHandler.jsx`)

Features:
- **Color-coded errors** based on type
- **Auto-dismiss** for non-critical errors (5 seconds)
- **Retry buttons** for recoverable errors
- **Logout notifications** for auth errors
- **Manual dismiss** for user control

## Status Code Handling

### Backend Status Codes

| Code | Description | Frontend Handling |
|------|-------------|-------------------|
| 200 | OK | Success response |
| 201 | Created | Success response |
| 400 | Bad Request | Validation error with user-friendly message |
| 401 | Unauthorized | Auth error, triggers logout |
| 403 | Forbidden | Permission error with clear message |
| 404 | Not Found | Resource error with helpful message |
| 422 | Unprocessable Entity | Validation error with field details |
| 429 | Too Many Requests | Rate limit error with retry option |
| 500 | Server Error | Server error with retry option |

### Error Message Mapping

The system maps technical error messages to user-friendly ones:

```javascript
// Example mappings
'Invalid credentials' → 'The email or password you entered is incorrect.'
'Account is locked' → 'Your account has been temporarily locked...'
'Please provide a valid email address' → 'Please enter a valid email address.'
'User role is not authorized' → 'You do not have permission to access this feature.'
```

## Usage Examples

### 1. Basic Error Handling

```javascript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError, clearError } = useErrorHandler();
  
  const handleApiCall = async () => {
    try {
      await apiService.get('/some-endpoint');
    } catch (error) {
      handleError(error); // Automatically displays user-friendly error
    }
  };
}
```

### 2. Error Display

```javascript
import ErrorHandler from '../components/ErrorHandler';

function App() {
  const { error, clearError, handleRetry } = useErrorHandler();
  
  return (
    <div>
      <ErrorHandler 
        error={error} 
        onClose={clearError}
        onRetry={handleRetry}
      />
      {/* Your app content */}
    </div>
  );
}
```

### 3. Custom Error Handling

```javascript
import { ApiError, getErrorMessage } from '../utils/errorHandler';

try {
  await apiService.post('/endpoint', data);
} catch (error) {
  if (error instanceof ApiError) {
    const userMessage = getErrorMessage(error);
    console.log(userMessage.title, userMessage.message);
    
    if (error.shouldLogout) {
      // Handle logout
    }
    
    if (error.shouldRetry) {
      // Show retry option
    }
  }
}
```

## Error Scenarios

### 1. Authentication Errors
- **Trigger**: Invalid token, expired session, account locked
- **Behavior**: Shows error message, triggers logout
- **User Action**: Redirected to login page

### 2. Permission Errors
- **Trigger**: Insufficient role, onboarding required
- **Behavior**: Shows clear permission message
- **User Action**: Contact administrator or complete onboarding

### 3. Validation Errors
- **Trigger**: Invalid input, missing required fields
- **Behavior**: Shows field-specific error messages
- **User Action**: Correct input and retry

### 4. Network Errors
- **Trigger**: No internet connection, server unreachable
- **Behavior**: Shows network error with retry option
- **User Action**: Check connection and retry

### 5. Server Errors
- **Trigger**: Internal server errors, database issues
- **Behavior**: Shows generic error with retry option
- **User Action**: Retry or contact support

## Testing

### Error Test Component
Visit `/error-test` to test different error scenarios:
- Authentication errors
- Permission errors
- Validation errors
- Network errors
- Server errors

### Manual Testing
1. **Invalid Login**: Try wrong credentials
2. **Network Issues**: Disconnect internet
3. **Permission Denied**: Try accessing admin features as employee
4. **Validation Errors**: Submit invalid forms

## Best Practices

### 1. Error Handling
- Always use `handleError()` for API errors
- Don't show raw error messages to users
- Provide clear next steps for users
- Log technical details for debugging

### 2. User Experience
- Show errors immediately when they occur
- Provide retry options for recoverable errors
- Auto-dismiss non-critical errors
- Use consistent error styling

### 3. Development
- Test error scenarios during development
- Use the error test component
- Check console for technical error details
- Verify user-friendly messages are appropriate

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

### Error Display Settings
- Auto-dismiss timeout: 5 seconds
- Error position: Top-right corner
- Max error width: 400px
- Z-index: 50 (above modals)

## Troubleshooting

### Common Issues

1. **Errors not showing**: Check if `ErrorHandler` component is rendered
2. **Wrong error messages**: Verify error mapping in `errorHandler.js`
3. **No retry button**: Check if error has `shouldRetry: true`
4. **Auto-logout issues**: Verify `shouldLogout` logic

### Debug Mode
Enable debug logging by checking browser console for:
- API request/response details
- Error transformation process
- User message generation

## Future Enhancements

1. **Error Analytics**: Track error frequency and types
2. **Offline Support**: Handle offline scenarios gracefully
3. **Error Recovery**: Automatic retry with exponential backoff
4. **User Feedback**: Allow users to report error details
5. **Error Categories**: Group related errors for better UX

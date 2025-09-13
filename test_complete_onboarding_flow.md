# Complete Employee Onboarding Flow Test Guide

## 🎯 **Perfect 10-Step Flow Implementation**

### **Flow Overview:**
```
1. Employee gets approval email with temporary password
   ↓
2. Employee logs in with temporary password
   ↓
3. System detects needsPasswordReset = true
   ↓
4. Redirects to /password-reset page
   ↓
5. Employee sees password reset form
   ↓
6. Employee enters current (temp) password and new password
   ↓
7. System updates password and clears hasTemporaryPassword flag
   ↓
8. System logs out user and redirects to /login
   ↓
9. Employee logs in with email and new password
   ↓
10. Employee lands on dashboard
```

---

## 🧪 **Complete Test Steps**

### **Step 1: Admin Approves Employee Onboarding**

**Backend API Call:**
```bash
PUT http://localhost:5000/api/users/{userId}/onboarding/review
```

**Request Body:**
```json
{
  "decision": "approve",
  "comments": "Onboarding approved successfully"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Onboarding approved successfully"
}
```

**Backend Console Logs:**
```
Generated temporary password for user: {userId}
Sending onboarding approval email to: employee@email.com
Temporary password included: Yes
Email would be sent: {email details with temp password}
```

**Database Changes:**
- `onboardingStatus`: "COMPLETED"
- `hasTemporaryPassword`: true
- `status`: "ACTIVE"
- `email`: set to personalEmail
- `password`: temporary password (hashed)

---

### **Step 2: Employee Receives Email**

**Email Content Should Include:**
```
Subject: Onboarding Approved - Welcome to HRMS

Congratulations! Your onboarding has been approved.

Official Email: employee@company.com
Temporary Password: a1b2c3d4e5f6
Employee ID: EMP00001
Login URL: http://localhost:3000/login

IMPORTANT: Please change your temporary password after your first login for security purposes.
```

---

### **Step 3: Employee Logs In with Temporary Password**

**Frontend Action:**
1. Go to `http://localhost:3000/login`
2. Enter official email and temporary password
3. Click "Login"

**Expected Console Logs:**
```
Login response: {success: true, data: {...}}
Login data returned: {user: {...}, token: "...", needsPasswordReset: true}
LOGIN_SUCCESS - payload: {...}
LOGIN_SUCCESS - needsPasswordReset: true
AppContent - Auth state: {isAuthenticated: true, isLoading: false, needsPasswordReset: true}
ProtectedRoute: Redirecting to password reset
```

**Expected Behavior:**
- ✅ Redirected to `/password-reset` (NOT dashboard)
- ✅ No white screen
- ✅ No "mobile number required" error

---

### **Step 4: Password Reset Page**

**Expected UI:**
```
Set Your Password

Welcome [Employee Name]! 
Please set a secure password for your account.

After setting your password, you'll be redirected to login with your new credentials.

[Current Password (Temporary)] field
[New Password] field
[Confirm New Password] field

[Update Password] button
```

**Console Logs:**
```
PasswordReset component rendered
PasswordReset - user: {user object}
Debug: PasswordReset component is rendering
```

---

### **Step 5: Employee Sets New Password**

**Form Validation:**
- ✅ Current password matches temporary password
- ✅ New password is at least 6 characters
- ✅ New password and confirmation match

**Expected API Call:**
```bash
PUT http://localhost:5000/api/auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "a1b2c3d4e5f6",
  "newPassword": "NewSecurePassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Backend Changes:**
- `hasTemporaryPassword`: false
- `passwordChangedAt`: current timestamp
- `password`: new password (hashed)

---

### **Step 6: Automatic Logout and Redirect**

**Expected Behavior:**
```
Success Toast: "Password updated successfully! Please log in with your new password."

Console Log: "Password reset successful, logging out and redirecting to login"

Automatic redirect to: http://localhost:3000/login
```

**Auth State Changes:**
- `isAuthenticated`: false
- `user`: null
- `needsPasswordReset`: false

---

### **Step 7: Employee Logs In with New Password**

**Frontend Action:**
1. On login page, enter email and NEW password
2. Click "Login"

**Expected Console Logs:**
```
Login response: {success: true, data: {...}}
Login data returned: {user: {...}, token: "...", needsPasswordReset: false}
LOGIN_SUCCESS - payload: {...}
LOGIN_SUCCESS - needsPasswordReset: false
AppContent - Auth state: {isAuthenticated: true, isLoading: false, needsPasswordReset: false}
```

**Expected Behavior:**
- ✅ No redirect to password reset
- ✅ No redirect to onboarding
- ✅ Direct access to dashboard

---

### **Step 8: Employee Lands on Dashboard**

**Expected Result:**
- ✅ Dashboard loads successfully
- ✅ Employee can access all features
- ✅ No more temporary password restrictions
- ✅ Normal user experience

---

## 🔍 **Debugging Checklist**

### **If Step 3 Fails (White Screen/Mobile Error):**
1. Check backend console for `needsPasswordReset: true`
2. Check frontend console for auth state logs
3. Verify `hasTemporaryPassword` is set in database
4. Check ProtectedRoute redirect logic

### **If Step 4 Fails (Password Reset Not Showing):**
1. Check `/password-reset` route exists
2. Verify PasswordReset component imports
3. Check console for component rendering logs

### **If Step 5 Fails (Password Update Error):**
1. Check API endpoint `/auth/change-password`
2. Verify current password matches
3. Check password validation rules

### **If Step 6 Fails (No Redirect to Login):**
1. Check logout function works
2. Verify navigate('/login') call
3. Check for JavaScript errors

### **If Step 7 Fails (Can't Login with New Password):**
1. Verify password was actually updated in database
2. Check `hasTemporaryPassword` is false
3. Verify password hashing is working

---

## 🎉 **Success Criteria**

**Complete Flow is Successful When:**
- ✅ Employee receives email with temporary password
- ✅ Can log in with temporary password
- ✅ Redirected to password reset page (not dashboard)
- ✅ Can set new password successfully
- ✅ Automatically logged out and redirected to login
- ✅ Can log in with new password
- ✅ Lands on dashboard with full access

**No Errors Should Occur:**
- ❌ No white screen
- ❌ No "mobile number required" error
- ❌ No direct dashboard access with temporary password
- ❌ No authentication errors
- ❌ No routing issues

---

## 🚀 **Ready for Production**

This flow provides:
- **Security**: Forces password change for temporary passwords
- **User Experience**: Clear guidance and smooth transitions
- **Error Handling**: Comprehensive validation and error messages
- **Debugging**: Detailed logging for troubleshooting
- **Flexibility**: Easy to modify or extend

The implementation is complete and ready for use! 🎯

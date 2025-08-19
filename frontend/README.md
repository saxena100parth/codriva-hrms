# HRMS Frontend

This is the React frontend for the Human Resource Management System.

## Tech Stack
- React.js with React Router
- Tailwind CSS for styling
- React Hook Form
- Axios for API calls
- React Context for state management

## Setup
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Build for production: `npm run build`

## Features
- Role-based dashboards (Admin, HR, Employee)
- Employee onboarding workflow
- Leave management
- Ticket system
- Holiday calendar
- Profile management

## Environment Variables
Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)
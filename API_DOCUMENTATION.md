# Email Management System - API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "active": true
  }
}
\`\`\`

### POST /api/auth/register
Register a new user account.

**Request Body:**
\`\`\`json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "3",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user",
    "active": true
  }
}
\`\`\`

## User Management Endpoints (Admin Only)

### GET /api/users
Get all users.

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": "1",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "active": true
    }
  ]
}
\`\`\`

### PUT /api/users/[id]
Update a user.

**Request Body:**
\`\`\`json
{
  "name": "Updated Name",
  "role": "admin",
  "active": false
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

### DELETE /api/users/[id]
Delete a user.

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

## Email Script Endpoints

### GET /api/scripts
Get all email scripts.

**Response:**
\`\`\`json
{
  "scripts": [
    {
      "id": "1",
      "name": "Welcome Email",
      "subject": "Welcome to {{company}}!",
      "body": "Hi {{name}}, welcome!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
\`\`\`

### POST /api/scripts
Create a new email script (Admin only).

**Request Body:**
\`\`\`json
{
  "name": "New Script",
  "subject": "Subject with {{variable}}",
  "body": "Body with {{variable}}"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "script": {
    "id": "4",
    "name": "New Script",
    "subject": "Subject with {{variable}}",
    "body": "Body with {{variable}}",
    "createdAt": "2024-01-08T00:00:00.000Z",
    "updatedAt": "2024-01-08T00:00:00.000Z"
  }
}
\`\`\`

### GET /api/scripts/[id]
Get a specific script by ID.

**Response:**
\`\`\`json
{
  "script": {
    "id": "1",
    "name": "Welcome Email",
    "subject": "Welcome to {{company}}!",
    "body": "Hi {{name}}, welcome!"
  }
}
\`\`\`

### PUT /api/scripts/[id]
Update a script (Admin only).

**Request Body:**
\`\`\`json
{
  "name": "Updated Script",
  "subject": "New subject",
  "body": "New body"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

### DELETE /api/scripts/[id]
Delete a script (Admin only).

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

## Email Endpoints

### POST /api/emails/send
Send an email.

**Request Body:**
\`\`\`json
{
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "subject": "Email subject with {{variable}}",
  "body": "Email body with {{variable}}",
  "variables": {
    "variable": "value"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "email": {
    "id": "1",
    "status": "sent",
    "sentAt": "2024-01-08T00:00:00.000Z"
  }
}
\`\`\`

### GET /api/emails/history
Get email history.

**Query Parameters:**
- `userEmail` (optional): Filter by user email

**Response:**
\`\`\`json
{
  "emails": [
    {
      "id": "1",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "subject": "Email subject",
      "body": "Email body",
      "sentAt": "2024-01-08T00:00:00.000Z",
      "status": "sent"
    }
  ]
}
\`\`\`

## Template Variables

Email scripts support template variables using the `{{variable}}` syntax. Common variables include:
- `{{name}}` - Recipient name
- `{{company}}` - Company name
- `{{sender}}` - Sender name
- `{{date}}` - Date
- `{{time}}` - Time
- `{{topic}}` - Topic/subject

Variables are replaced when sending emails by providing a `variables` object in the request.

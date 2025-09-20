# LORDMINDS ACADEMY - API Testing Guide

## 🚀 Getting Started

### Prerequisites
1. Node.js installed
2. MySQL database running
3. Environment variables configured

### Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed sample data
node src/utils/seedData.js

# Start the server
npm run dev
```

## 🔑 Test Credentials

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Super Admin | superadmin | superadmin123 | Full system access |
| Admin | admin1 | admin123 | College management access |
| Teacher | teacher1 | teacher123 | View and report access |
| Student | student_abc_1 | student123 | Student portal access |
| Administrative | admin_access_abc | adminaccess123 | College-specific management |

## 📡 Base URL
```
http://localhost:8000/api
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📋 API Endpoints

### 1. Authentication Routes (`/auth`)

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "STUDENT",
  "name": "New User",
  "email": "newuser@example.com",
  "collegeId": 1,
  "classId": 1,
  "rollNo": "STU001",
  "dob": "2000-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": 1,
    "username": "newuser",
    "name": "New User",
    "role": "STUDENT",
    "status": "PENDING_CONFIRMATION"
  }
}
```

#### POST `/auth/login`
Login with username and password.

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "superadmin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "superadmin",
      "name": "Super Admin",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "isFirstTimeLogin": false
    }
  }
}
```

#### POST `/auth/confirm-first-time-login`
Confirm first-time login (for new users).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "First time login confirmed",
  "data": {
    "isFirstTimeLogin": false,
    "status": "ACTIVE"
  }
}
```

### 2. Super Admin Routes (`/super-admin`)

#### GET `/super-admin/dashboard`
Get dashboard statistics.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalColleges": 3,
      "totalUsers": 25,
      "totalTopics": 5,
      "totalAssessments": 5
    },
    "recentUsers": [...],
    "recentColleges": [...]
  }
}
```

#### GET `/super-admin/colleges`
Get all colleges.

**Headers:** `Authorization: Bearer <super_admin_token>`

#### POST `/super-admin/colleges`
Create a new college.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**
```json
{
  "name": "New College",
  "location": "City, State"
}
```

#### GET `/super-admin/users`
Get all users in the system.

**Headers:** `Authorization: Bearer <super_admin_token>`

#### POST `/super-admin/users`
Create a new user.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "ADMIN",
  "name": "New Admin",
  "email": "newadmin@example.com"
}
```

### 3. Admin Routes (`/admin`)

#### GET `/admin/dashboard`
Get admin dashboard data.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/colleges`
Get all colleges.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/students?collegeId=1&classId=1`
Get students with optional filters.

**Headers:** `Authorization: Bearer <admin_token>`

#### POST `/admin/assessments`
Create a new assessment.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Math Assessment",
  "description": "Basic math concepts test",
  "type": "QUESTIONS",
  "collegeId": 1,
  "classId": 1,
  "passingScore": 70.0,
  "timeLimit": 30,
  "questions": [
    {
      "topic": "Mathematics",
      "subTopic": "Algebra",
      "questionText": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswerIndex": 1,
      "explanation": "2 + 2 equals 4",
      "timeLimitSec": 30
    }
  ]
}
```

#### GET `/admin/reports?type=marks&collegeId=1`
Generate reports.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `type`: marks, assignment, duration, overall
- `collegeId`: Filter by college
- `classId`: Filter by class
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

### 4. Teacher Routes (`/teacher`)

#### GET `/teacher/dashboard`
Get teacher dashboard.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/students`
Get all students.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/assessments/results`
Get assessment results.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/reports?type=overall`
Generate reports.

**Headers:** `Authorization: Bearer <teacher_token>`

### 5. Student Routes (`/student`)

#### GET `/student/dashboard`
Get student dashboard.

**Headers:** `Authorization: Bearer <student_token>`

#### GET `/student/topics`
Get available topics for the student.

**Headers:** `Authorization: Bearer <student_token>`

#### GET `/student/topics/1`
Get specific topic details.

**Headers:** `Authorization: Bearer <student_token>`

#### GET `/student/subtopics/1`
Get sub-topic details.

**Headers:** `Authorization: Bearer <student_token>`

#### POST `/student/initial-assessment`
Take initial assessment.

**Headers:** `Authorization: Bearer <student_token>`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedIndex": 2,
      "isCorrect": true
    }
  ],
  "timeSpent": 300
}
```

#### POST `/student/assessments/1/submit`
Submit assessment.

**Headers:** `Authorization: Bearer <student_token>`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedIndex": 2
    }
  ],
  "timeSpent": 180
}
```

#### GET `/student/progress`
Get student progress.

**Headers:** `Authorization: Bearer <student_token>`

### 6. Administrative Access Routes (`/administrative`)

#### GET `/administrative/dashboard`
Get administrative dashboard.

**Headers:** `Authorization: Bearer <administrative_token>`

#### GET `/administrative/students`
Get students in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

#### POST `/administrative/students`
Create a new student.

**Headers:** `Authorization: Bearer <administrative_token>`

**Request Body:**
```json
{
  "username": "newstudent",
  "password": "password123",
  "name": "New Student",
  "email": "newstudent@example.com",
  "classId": 1,
  "rollNo": "STU002",
  "dob": "2000-01-01"
}
```

#### GET `/administrative/classes`
Get all classes in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

#### POST `/administrative/classes`
Create a new class.

**Headers:** `Authorization: Bearer <administrative_token>`

**Request Body:**
```json
{
  "name": "Fourth Year"
}
```

#### GET `/administrative/teachers`
Get teachers in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

#### POST `/administrative/teachers`
Create a new teacher.

**Headers:** `Authorization: Bearer <administrative_token>`

**Request Body:**
```json
{
  "username": "newteacher",
  "password": "password123",
  "name": "New Teacher",
  "email": "newteacher@example.com"
}
```

### 7. Assessment Routes (`/assessments`)

#### GET `/assessments`
Get all assessments.

**Headers:** `Authorization: Bearer <token>`

#### GET `/assessments/1`
Get specific assessment.

**Headers:** `Authorization: Bearer <token>`

#### GET `/assessments/1/results`
Get assessment results.

**Headers:** `Authorization: Bearer <token>`

#### GET `/assessments/1/statistics`
Get assessment statistics.

**Headers:** `Authorization: Bearer <token>`

### 8. Topic Routes (`/topics`)

#### GET `/topics`
Get all topics.

**Headers:** `Authorization: Bearer <token>`

#### GET `/topics/1`
Get specific topic.

**Headers:** `Authorization: Bearer <token>`

#### GET `/topics/college/1`
Get topics assigned to a college.

**Headers:** `Authorization: Bearer <token>`

## 🧪 Testing with cURL

### 1. Login as Super Admin
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "superadmin123"
  }'
```

### 2. Get Dashboard Data
```bash
curl -X GET http://localhost:8000/api/super-admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create a New College
```bash
curl -X POST http://localhost:8000/api/super-admin/colleges \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test College",
    "location": "Test City, Test State"
  }'
```

### 4. Login as Student
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student_abc_1",
    "password": "student123"
  }'
```

### 5. Get Student Topics
```bash
curl -X GET http://localhost:8000/api/student/topics \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

## 🐛 Common Issues

### 1. Authentication Errors
- Ensure the token is included in the Authorization header
- Check if the token has expired
- Verify the user has the correct role for the endpoint

### 2. Database Errors
- Run `npx prisma db push` to sync the schema
- Check if the database is running
- Verify the DATABASE_URL in your .env file

### 3. Validation Errors
- Check the request body format
- Ensure required fields are provided
- Verify data types match the expected format

## 📊 Sample Data

The seeder creates:
- 3 Colleges
- 9 Classes (3 per college)
- 1 Super Admin
- 2 Admins
- 2 Administrative Access users
- 2 Teachers
- 18 Students
- 5 Topics
- 15 SubTopics
- 5 Assessments
- Sample progress and results data

## 🔄 Database Reset

To reset the database and reseed:
```bash
npx prisma db push --force-reset
node src/utils/seedData.js
```

## 📝 Notes

- All timestamps are in ISO format
- Passwords are hashed using bcrypt
- JWT tokens expire in 1 day
- File uploads are not implemented in this basic version
- Voice recognition features are placeholder implementations

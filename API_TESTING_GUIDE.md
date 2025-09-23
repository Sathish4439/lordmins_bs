# LORDMINDS ACADEMY - Comprehensive API Testing Guide

## 🚀 Getting Started

### Prerequisites

1. Node.js installed
2. MySQL database running
3. Environment variables configured
4. ExcelJS for report generation
5. Multer for file uploads

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

| Role           | Username         | Password       | Description                                                                     |
| -------------- | ---------------- | -------------- | ------------------------------------------------------------------------------- |
| Super Admin    | superadmin       | superadmin123  | Full system access - can manage everything                                      |
| Admin          | admin1           | admin123       | College management access - can view all colleges, students, topics, marks      |
| Teacher        | teacher1         | teacher123     | View and report access - can view colleges, students, topics, marks             |
| Student        | student_abc_1    | student123     | Student portal access - can take assessments and view topics                    |
| Administrative | admin_access_abc | adminaccess123 | College-specific management - can manage teachers and students in their college |

## 📡 Base URL

```
http://localhost:8000/api
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### First-Time Login Flow

1. User logs in with credentials
2. If `isFirstTimeLogin: true`, user is redirected to confirmation page
3. User confirms first-time login
4. User is redirected to role-specific dashboard

## 📋 API Endpoints

### 1. Authentication Routes (`/auth`)

#### POST `/auth/signup`

Create a new user account with role-specific validation.

**Request Body (Student):**

```json
{
  "username": "newstudent",
  "password": "password123",
  "role": "STUDENT",
  "name": "New Student",
  "email": "newstudent@example.com",
  "collegeId": 1,
  "classId": 1,
  "rollNo": "STU001",
  "dob": "2000-01-01"
}
```

**Request Body (Teacher/Administrative):**

```json
{
  "username": "newteacher",
  "password": "password123",
  "role": "TEACHER",
  "name": "New Teacher",
  "email": "newteacher@example.com",
  "collegeId": 1
}
```

**Request Body (Admin/Super Admin):**

```json
{
  "username": "newadmin",
  "password": "password123",
  "role": "ADMIN",
  "name": "New Admin",
  "email": "newadmin@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": 1,
    "username": "newstudent",
    "name": "New Student",
    "role": "STUDENT",
    "status": "PENDING_CONFIRMATION",
    "isFirstTimeLogin": true,
    "collegeId": 1,
    "classId": 1,
    "rollNo": "STU001"
  }
}
```

#### POST `/auth/login`

Login with username and password. Returns role-specific data and first-time login status.

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
      "email": "superadmin@example.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "isFirstTimeLogin": false,
      "collegeId": null,
      "classId": null,
      "rollNo": null,
      "dob": null,
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### POST `/auth/confirm-first-time-login`

Confirm first-time login (for new users). Required for students to access topics.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "userId": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "First time login confirmed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "isFirstTimeLogin": false,
      "status": "ACTIVE"
    }
  }
}
```

#### POST `/auth/refresh-token`

Refresh expired JWT token.

**Headers:** `Authorization: Bearer <expired_token>`

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Super Admin Routes (`/super-admin`)

#### GET `/super-admin/dashboard`

Get comprehensive dashboard statistics with recent activities.

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
      "totalAssessments": 5,
      "totalStudents": 18,
      "totalTeachers": 2,
      "totalAdmins": 2,
      "totalAdministrativeAccess": 2
    },
    "recentUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "username": "john_doe",
        "role": "STUDENT",
        "status": "ACTIVE",
        "college": "ABC College",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "recentColleges": [
      {
        "id": 1,
        "name": "ABC College",
        "location": "City, State",
        "totalUsers": 8,
        "totalClasses": 3,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "recentActivities": [
      {
        "type": "USER_CREATED",
        "description": "New student John Doe created",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### GET `/super-admin/colleges`

Get all colleges with detailed statistics.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Response:**

```json
{
  "success": true,
  "message": "Colleges retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "ABC College",
      "location": "City, State",
      "stats": {
        "totalUsers": 8,
        "totalClasses": 3,
        "totalStudents": 6,
        "totalTeachers": 1,
        "totalAdministrativeAccess": 1
      },
      "classes": [
        {
          "id": 1,
          "name": "First Year",
          "totalStudents": 2
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/super-admin/colleges`

Create a new college with automatic administrative access user.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**

```json
{
  "name": "New College",
  "location": "City, State"
}
```

**Response:**

```json
{
  "success": true,
  "message": "College created successfully",
  "data": {
    "id": 4,
    "name": "New College",
    "location": "City, State",
    "administrativeAccess": {
      "id": 5,
      "username": "admin_access_new_college",
      "password": "generated_password",
      "name": "Administrative Access - New College"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT `/super-admin/colleges/1`

Update college information.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**

```json
{
  "name": "Updated College Name",
  "location": "Updated City, State"
}
```

#### DELETE `/super-admin/colleges/1`

Delete a college (soft delete).

**Headers:** `Authorization: Bearer <super_admin_token>`

#### GET `/super-admin/users`

Get all users in the system with role-specific data.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Query Parameters:**

- `role`: Filter by role (SUPER_ADMIN, ADMIN, TEACHER, STUDENT, ADMINISTRATIVE_ACCESS)
- `collegeId`: Filter by college
- `status`: Filter by status (ACTIVE, PENDING_CONFIRMATION, INACTIVE)

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "student_abc_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "collegeId": 1,
      "classId": 1,
      "rollNo": "STU001",
      "dob": "2000-01-01",
      "isFirstTimeLogin": false,
      "lastLogin": "2024-01-15T10:30:00Z",
      "college": {
        "id": 1,
        "name": "ABC College"
      },
      "class": {
        "id": 1,
        "name": "First Year"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/super-admin/users`

Create a new user with role-specific validation.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body (Student):**

```json
{
  "username": "newstudent",
  "password": "password123",
  "role": "STUDENT",
  "name": "New Student",
  "email": "newstudent@example.com",
  "collegeId": 1,
  "classId": 1,
  "rollNo": "STU002",
  "dob": "2000-01-01"
}
```

**Request Body (Teacher):**

```json
{
  "username": "newteacher",
  "password": "password123",
  "role": "TEACHER",
  "name": "New Teacher",
  "email": "newteacher@example.com",
  "collegeId": 1
}
```

#### PUT `/super-admin/users/1`

Update user information.

**Headers:** `Authorization: Bearer <super_admin_token>`

#### DELETE `/super-admin/users/1`

Delete a user (soft delete).

**Headers:** `Authorization: Bearer <super_admin_token>`

#### GET `/super-admin/topics`

Get all topics with unlock rules and assignments.

**Headers:** `Authorization: Bearer <super_admin_token>`

#### POST `/super-admin/topics`

Create a new topic.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**

```json
{
  "title": "Mathematics Fundamentals",
  "description": "Basic mathematical concepts",
  "order": 1,
  "isActive": true
}
```

#### POST `/super-admin/topics/assign-to-college`

Assign topics to a college.

**Headers:** `Authorization: Bearer <super_admin_token>`

**Request Body:**

```json
{
  "collegeId": 1,
  "topicIds": [1, 2, 3]
}
```

### 3. Admin Routes (`/admin`)

#### GET `/admin/dashboard`

Get admin dashboard data with comprehensive statistics.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**

```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalColleges": 3,
      "totalStudents": 18,
      "totalTeachers": 2,
      "totalTopics": 5,
      "totalAssessments": 5,
      "totalReports": 12
    },
    "recentStudents": [
      {
        "id": 1,
        "name": "John Doe",
        "rollNo": "STU001",
        "college": "ABC College",
        "class": "First Year",
        "lastLogin": "2024-01-15T10:30:00Z",
        "status": "ACTIVE"
      }
    ],
    "recentAssessments": [
      {
        "id": 1,
        "title": "Math Assessment",
        "college": "ABC College",
        "class": "First Year",
        "totalAttempts": 15,
        "averageScore": 75.5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### GET `/admin/colleges`

Get all colleges with detailed information.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/colleges/1`

Get specific college details.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/students`

Get all students with filtering options.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `status`: Filter by status
- `search`: Search by name or roll number

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "student_abc_1",
      "email": "john@example.com",
      "rollNo": "STU001",
      "dob": "2000-01-01",
      "status": "ACTIVE",
      "isFirstTimeLogin": false,
      "lastLogin": "2024-01-15T10:30:00Z",
      "college": {
        "id": 1,
        "name": "ABC College",
        "location": "City, State"
      },
      "class": {
        "id": 1,
        "name": "First Year"
      },
      "initialAssessment": {
        "score": 85.5,
        "completedAt": "2024-01-10T10:30:00Z"
      },
      "progress": {
        "topicsCompleted": 3,
        "totalTopics": 5,
        "averageScore": 78.5
      }
    }
  ]
}
```

#### GET `/admin/topics`

Get all topics with college assignments.

**Headers:** `Authorization: Bearer <admin_token>`

#### POST `/admin/assessments`

Create a new assessment with Word upload support.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body (Questions Type):**

```json
{
  "title": "Mathematics Assessment",
  "description": "Basic math concepts test",
  "type": "QUESTIONS",
  "collegeId": 1,
  "classId": 1,
  "subTopicId": 1,
  "passingScore": 70.0,
  "timeLimit": 30,
  "maxAttempts": 3,
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

**Request Body (PDF Type):**

```json
{
  "title": "PDF Assessment",
  "description": "Assessment from PDF document",
  "type": "PDF",
  "collegeId": 1,
  "classId": 1,
  "subTopicId": 1,
  "passingScore": 70.0,
  "timeLimit": 45,
  "maxAttempts": 2,
  "pdfFileId": 1
}
```

**Request Body (Voice Recognition Type):**

```json
{
  "title": "Voice Assessment",
  "description": "Voice recognition assessment",
  "type": "VOICE_RECOGNITION",
  "collegeId": 1,
  "classId": 1,
  "subTopicId": 1,
  "passingScore": 70.0,
  "timeLimit": 60,
  "maxAttempts": 3,
  "questions": [
    {
      "questionText": "Speak the answer to 5 + 3",
      "expectedAnswer": "eight",
      "audioFileId": 1,
      "timeLimitSec": 30
    }
  ]
}
```

#### GET `/admin/assessments`

Get all assessments with results.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/assessments/1/results`

Get assessment results with detailed analytics.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `studentId`: Filter by student
- `passed`: Filter by pass/fail status

#### GET `/admin/students/progress`

Get student progress across all topics.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `studentId`: Filter by student

#### POST `/admin/reports/generate`

Generate comprehensive reports.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**

```json
{
  "reportType": "current_marks",
  "collegeId": 1,
  "classId": 1,
  "studentId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Report Types:**

- `current_marks`: Student performance overview
- `assignment_marks`: Detailed assessment results
- `total_duration`: Time spent tracking
- `overall`: Comprehensive student analytics

**Response:**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "filename": "current_marks_report_2024-01-15.xlsx",
    "filepath": "/uploads/reports/current_marks_report_2024-01-15.xlsx",
    "totalStudents": 15,
    "downloadUrl": "/api/reports/download/1"
  }
}
```

#### GET `/admin/reports/history`

Get report generation history.

**Headers:** `Authorization: Bearer <admin_token>`

#### GET `/admin/reports/download/1`

Download generated report file.

**Headers:** `Authorization: Bearer <admin_token>`

### 4. Teacher Routes (`/teacher`)

#### GET `/teacher/dashboard`

Get teacher dashboard with college-specific data.

**Headers:** `Authorization: Bearer <teacher_token>`

**Response:**

```json
{
  "success": true,
  "message": "Teacher dashboard data retrieved successfully",
  "data": {
    "profile": {
      "id": 1,
      "name": "Teacher Name",
      "username": "teacher1",
      "email": "teacher@example.com",
      "college": {
        "id": 1,
        "name": "ABC College",
        "location": "City, State"
      }
    },
    "stats": {
      "totalStudents": 6,
      "totalClasses": 3,
      "totalTopics": 5,
      "totalAssessments": 3,
      "totalReports": 8
    },
    "recentStudents": [
      {
        "id": 1,
        "name": "John Doe",
        "rollNo": "STU001",
        "class": "First Year",
        "lastLogin": "2024-01-15T10:30:00Z",
        "progress": {
          "topicsCompleted": 3,
          "averageScore": 78.5
        }
      }
    ]
  }
}
```

#### GET `/teacher/profile`

Get teacher profile information.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/colleges`

Get all colleges (view-only access).

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/colleges/1`

Get specific college details.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/classes`

Get all classes in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

#### POST `/teacher/classes`

Create a new class in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body:**

```json
{
  "name": "Fourth Year"
}
```

#### PUT `/teacher/classes/1`

Update class information.

**Headers:** `Authorization: Bearer <teacher_token>`

#### DELETE `/teacher/classes/1`

Delete a class.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/students`

Get all students in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

**Query Parameters:**

- `classId`: Filter by class
- `status`: Filter by status
- `search`: Search by name or roll number

#### POST `/teacher/students`

Create a new student in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

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

#### PUT `/teacher/students/1`

Update student information.

**Headers:** `Authorization: Bearer <teacher_token>`

#### DELETE `/teacher/students/1`

Delete a student.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/teachers`

Get all teachers in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

#### POST `/teacher/teachers`

Create a new teacher in the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body:**

```json
{
  "username": "newteacher",
  "password": "password123",
  "name": "New Teacher",
  "email": "newteacher@example.com"
}
```

#### PUT `/teacher/teachers/1`

Update teacher information.

**Headers:** `Authorization: Bearer <teacher_token>`

#### DELETE `/teacher/teachers/1`

Delete a teacher.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/topics`

Get all topics assigned to the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/assessments`

Get all assessments.

**Headers:** `Authorization: Bearer <teacher_token>`

#### GET `/teacher/assessments/results`

Get assessment results for the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `studentId`: Filter by student
- `assessmentId`: Filter by assessment

#### GET `/teacher/students/progress`

Get student progress for the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

#### POST `/teacher/reports/generate`

Generate reports for the teacher's college.

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body:**

```json
{
  "reportType": "overall",
  "classId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 5. Student Routes (`/student`)

#### GET `/student/dashboard`

Get student dashboard with progress and available topics.

**Headers:** `Authorization: Bearer <student_token>`

**Response:**

```json
{
  "success": true,
  "message": "Student dashboard data retrieved successfully",
  "data": {
    "profile": {
      "id": 1,
      "name": "John Doe",
      "username": "student_abc_1",
      "email": "john@example.com",
      "rollNo": "STU001",
      "dob": "2000-01-01",
      "college": {
        "id": 1,
        "name": "ABC College",
        "location": "City, State"
      },
      "class": {
        "id": 1,
        "name": "First Year"
      }
    },
    "initialAssessment": {
      "score": 85.5,
      "completedAt": "2024-01-10T10:30:00Z",
      "totalQuestions": 20
    },
    "progress": {
      "topicsCompleted": 3,
      "totalTopics": 5,
      "subTopicsCompleted": 8,
      "totalSubTopics": 15,
      "averageScore": 78.5,
      "totalTimeSpent": 1200
    },
    "recentAssessments": [
      {
        "id": 1,
        "title": "Math Assessment",
        "score": 85,
        "total": 100,
        "passed": true,
        "completedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "unlockedTopics": 4,
    "lockedTopics": 1
  }
}
```

#### GET `/student/profile`

Get student profile information.

**Headers:** `Authorization: Bearer <student_token>`

#### GET `/student/topics`

Get available topics for the student with unlocking logic applied.

**Headers:** `Authorization: Bearer <student_token>`

**Response:**

```json
{
  "success": true,
  "message": "Student topics with progress retrieved successfully",
  "data": {
    "student": {
      "id": 1,
      "name": "John Doe",
      "rollNo": "STU001",
      "college": {
        "id": 1,
        "name": "ABC College"
      },
      "class": {
        "id": 1,
        "name": "First Year"
      }
    },
    "initialAssessment": {
      "score": 85.5,
      "completedAt": "2024-01-10T10:30:00Z"
    },
    "topics": [
      {
        "id": 1,
        "title": "Mathematics Fundamentals",
        "description": "Basic mathematical concepts",
        "order": 1,
        "isUnlocked": true,
        "subTopics": [
          {
            "id": 1,
            "title": "Basic Arithmetic",
            "order": 1,
            "status": "COMPLETED",
            "progress": {
              "id": 1,
              "status": "COMPLETED",
              "unlockedAt": "2024-01-10T10:30:00Z",
              "completedAt": "2024-01-12T14:20:00Z",
              "score": 85.5
            }
          },
          {
            "id": 2,
            "title": "Algebra Basics",
            "order": 2,
            "status": "UNLOCKED",
            "progress": {
              "id": 2,
              "status": "UNLOCKED",
              "unlockedAt": "2024-01-12T14:20:00Z",
              "completedAt": null,
              "score": null
            }
          }
        ]
      },
      {
        "id": 2,
        "title": "Advanced Mathematics",
        "description": "Advanced mathematical concepts",
        "order": 2,
        "isUnlocked": false,
        "subTopics": [
          {
            "id": 3,
            "title": "Calculus Introduction",
            "order": 1,
            "status": "LOCKED",
            "progress": null
          }
        ]
      }
    ]
  }
}
```

#### GET `/student/topics/1`

Get specific topic details with student progress.

**Headers:** `Authorization: Bearer <student_token>`

#### GET `/student/subtopics/1`

Get sub-topic details with content and assessments.

**Headers:** `Authorization: Bearer <student_token>`

**Response:**

```json
{
  "success": true,
  "message": "Sub-topic details retrieved successfully",
  "data": {
    "id": 1,
    "title": "Basic Arithmetic",
    "contentText": "This sub-topic covers basic arithmetic operations...",
    "order": 1,
    "isActive": true,
    "topic": {
      "id": 1,
      "title": "Mathematics Fundamentals"
    },
    "files": [
      {
        "id": 1,
        "fileName": "arithmetic_video.mp4",
        "fileType": "VIDEO",
        "filePath": "/uploads/videos/arithmetic_video.mp4",
        "fileSize": 15728640
      },
      {
        "id": 2,
        "fileName": "arithmetic_images.jpg",
        "fileType": "IMAGE",
        "filePath": "/uploads/images/arithmetic_images.jpg",
        "fileSize": 524288
      }
    ],
    "assessments": [
      {
        "id": 1,
        "title": "Arithmetic Assessment",
        "description": "Test your arithmetic skills",
        "type": "QUESTIONS",
        "passingScore": 70.0,
        "timeLimit": 30,
        "maxAttempts": 3,
        "questions": [
          {
            "id": 1,
            "questionText": "What is 5 + 3?",
            "options": ["7", "8", "9", "10"],
            "timeLimitSec": 30
          }
        ]
      }
    ],
    "studentProgress": {
      "id": 1,
      "status": "COMPLETED",
      "unlockedAt": "2024-01-10T10:30:00Z",
      "completedAt": "2024-01-12T14:20:00Z",
      "score": 85.5
    }
  }
}
```

#### POST `/student/initial-assessment`

Take initial assessment to determine topic availability.

**Headers:** `Authorization: Bearer <student_token>`

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedIndex": 2,
      "isCorrect": true
    },
    {
      "questionId": 2,
      "selectedIndex": 0,
      "isCorrect": false
    }
  ],
  "timeSpent": 300
}
```

**Response:**

```json
{
  "success": true,
  "message": "Initial assessment submitted successfully",
  "data": {
    "score": 85.5,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "unlockedTopics": 4,
    "topics": [
      {
        "id": 1,
        "title": "Mathematics Fundamentals",
        "unlocked": true
      },
      {
        "id": 2,
        "title": "Science Basics",
        "unlocked": true
      }
    ]
  }
}
```

#### POST `/student/assessments/1/submit`

Submit assessment and update progress.

**Headers:** `Authorization: Bearer <student_token>`

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedIndex": 2
    },
    {
      "questionId": 2,
      "selectedIndex": 0
    }
  ],
  "timeSpent": 180
}
```

**Response:**

```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "resultId": 1,
    "score": 75,
    "total": 100,
    "percentage": 75.0,
    "passed": true,
    "attemptNumber": 1,
    "timeSpent": 180,
    "nextSubTopicUnlocked": true,
    "unlockedSubTopic": {
      "id": 3,
      "title": "Advanced Algebra",
      "status": "UNLOCKED"
    }
  }
}
```

#### GET `/student/assessments/results`

Get student's assessment results.

**Headers:** `Authorization: Bearer <student_token>`

**Query Parameters:**

- `assessmentId`: Filter by specific assessment
- `passed`: Filter by pass/fail status

#### GET `/student/progress`

Get comprehensive student progress.

**Headers:** `Authorization: Bearer <student_token>`

**Response:**

```json
{
  "success": true,
  "message": "Student progress retrieved successfully",
  "data": {
    "overallProgress": {
      "topicsCompleted": 3,
      "totalTopics": 5,
      "subTopicsCompleted": 8,
      "totalSubTopics": 15,
      "completionPercentage": 53.3,
      "averageScore": 78.5,
      "totalTimeSpent": 1200
    },
    "topicProgress": [
      {
        "topicId": 1,
        "topicTitle": "Mathematics Fundamentals",
        "subTopicsCompleted": 3,
        "totalSubTopics": 3,
        "averageScore": 82.5,
        "timeSpent": 450,
        "status": "COMPLETED"
      },
      {
        "topicId": 2,
        "topicTitle": "Science Basics",
        "subTopicsCompleted": 2,
        "totalSubTopics": 4,
        "averageScore": 75.0,
        "timeSpent": 300,
        "status": "IN_PROGRESS"
      }
    ],
    "recentAssessments": [
      {
        "id": 1,
        "title": "Math Assessment",
        "score": 85,
        "total": 100,
        "passed": true,
        "completedAt": "2024-01-15T10:30:00Z",
        "topic": "Mathematics Fundamentals",
        "subTopic": "Basic Arithmetic"
      }
    ]
  }
}
```

### 6. Administrative Access Routes (`/administrative`)

#### GET `/administrative/dashboard`

Get administrative dashboard with college-specific data.

**Headers:** `Authorization: Bearer <administrative_token>`

**Response:**

```json
{
  "success": true,
  "message": "Administrative dashboard data retrieved successfully",
  "data": {
    "profile": {
      "id": 1,
      "name": "Administrative Access - ABC College",
      "username": "admin_access_abc",
      "email": "admin@abccollege.com",
      "college": {
        "id": 1,
        "name": "ABC College",
        "location": "City, State"
      }
    },
    "stats": {
      "totalStudents": 6,
      "totalTeachers": 1,
      "totalClasses": 3,
      "totalTopics": 5,
      "totalAssessments": 3
    },
    "recentStudents": [
      {
        "id": 1,
        "name": "John Doe",
        "rollNo": "STU001",
        "class": "First Year",
        "status": "ACTIVE",
        "lastLogin": "2024-01-15T10:30:00Z"
      }
    ],
    "recentTeachers": [
      {
        "id": 1,
        "name": "Teacher Name",
        "username": "teacher1",
        "status": "ACTIVE",
        "lastLogin": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

#### GET `/administrative/profile`

Get administrative profile information.

**Headers:** `Authorization: Bearer <administrative_token>`

#### GET `/administrative/college`

Get college details for the administrative user.

**Headers:** `Authorization: Bearer <administrative_token>`

#### GET `/administrative/classes`

Get all classes in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

#### POST `/administrative/classes`

Create a new class in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

**Request Body:**

```json
{
  "name": "Fourth Year"
}
```

#### PUT `/administrative/classes/1`

Update class information.

**Headers:** `Authorization: Bearer <administrative_token>`

#### DELETE `/administrative/classes/1`

Delete a class.

**Headers:** `Authorization: Bearer <administrative_token>`

#### GET `/administrative/students`

Get all students in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

**Query Parameters:**

- `classId`: Filter by class
- `status`: Filter by status
- `search`: Search by name or roll number

#### POST `/administrative/students`

Create a new student in the college.

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

#### PUT `/administrative/students/1`

Update student information.

**Headers:** `Authorization: Bearer <administrative_token>`

#### DELETE `/administrative/students/1`

Delete a student.

**Headers:** `Authorization: Bearer <administrative_token>`

#### GET `/administrative/teachers`

Get all teachers in the college.

**Headers:** `Authorization: Bearer <administrative_token>`

#### POST `/administrative/teachers`

Create a new teacher in the college.

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

#### PUT `/administrative/teachers/1`

Update teacher information.

**Headers:** `Authorization: Bearer <administrative_token>`

#### DELETE `/administrative/teachers/1`

Delete a teacher.

**Headers:** `Authorization: Bearer <administrative_token>`

### 7. Assessment Routes (`/assessments`)

#### GET `/assessments`

Get all assessments with filtering options.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `subTopicId`: Filter by sub-topic
- `type`: Filter by type (QUESTIONS, PDF, VOICE_RECOGNITION)
- `isActive`: Filter by active status

#### GET `/assessments/1`

Get specific assessment with questions.

**Headers:** `Authorization: Bearer <token>`

#### POST `/assessments`

Create a new assessment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Mathematics Assessment",
  "description": "Basic math concepts test",
  "type": "QUESTIONS",
  "collegeId": 1,
  "classId": 1,
  "subTopicId": 1,
  "passingScore": 70.0,
  "timeLimit": 30,
  "maxAttempts": 3,
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

#### PUT `/assessments/1`

Update assessment.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/assessments/1`

Delete assessment.

**Headers:** `Authorization: Bearer <token>`

#### POST `/assessments/1/questions`

Add questions to assessment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "questions": [
    {
      "topic": "Mathematics",
      "subTopic": "Algebra",
      "questionText": "What is 5 + 3?",
      "options": ["7", "8", "9", "10"],
      "correctAnswerIndex": 1,
      "explanation": "5 + 3 equals 8",
      "timeLimitSec": 30
    }
  ]
}
```

#### PUT `/assessments/1/questions/1`

Update specific question.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/assessments/1/questions/1`

Delete specific question.

**Headers:** `Authorization: Bearer <token>`

#### GET `/assessments/1/results`

Get assessment results with analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `collegeId`: Filter by college
- `classId`: Filter by class
- `studentId`: Filter by student
- `passed`: Filter by pass/fail status

#### POST `/assessments/1/submit`

Submit assessment (for students).

**Headers:** `Authorization: Bearer <student_token>`

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedIndex": 2
    },
    {
      "questionId": 2,
      "selectedIndex": 0
    }
  ],
  "timeSpent": 180
}
```

#### GET `/assessments/1/statistics`

Get assessment statistics.

**Headers:** `Authorization: Bearer <token>`

### 8. Topic Routes (`/topics`)

#### GET `/topics`

Get all topics with unlock rules and assignments.

**Headers:** `Authorization: Bearer <token>`

#### GET `/topics/1`

Get specific topic with sub-topics.

**Headers:** `Authorization: Bearer <token>`

#### POST `/topics`

Create a new topic.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Mathematics Fundamentals",
  "description": "Basic mathematical concepts",
  "order": 1,
  "isActive": true
}
```

#### PUT `/topics/1`

Update topic.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/topics/1`

Delete topic.

**Headers:** `Authorization: Bearer <token>`

#### POST `/topics/1/subtopics`

Create sub-topic.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Basic Arithmetic",
  "contentText": "This sub-topic covers basic arithmetic operations...",
  "order": 1,
  "isActive": true,
  "videoFileId": 1,
  "imageFileIds": [1, 2]
}
```

#### GET `/topics/1/subtopics/1`

Get specific sub-topic.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/topics/1/subtopics/1`

Update sub-topic.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/topics/1/subtopics/1`

Delete sub-topic.

**Headers:** `Authorization: Bearer <token>`

#### GET `/topics/college/1`

Get topics assigned to a college.

**Headers:** `Authorization: Bearer <token>`

#### POST `/topics/assign-to-college`

Assign topics to a college.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "collegeId": 1,
  "topicIds": [1, 2, 3]
}
```

#### GET `/topics/student-progress`

Get student topics with progress (for students).

**Headers:** `Authorization: Bearer <student_token>`

#### POST `/topics/unlock-rules`

Create topic unlock rule.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "collegeId": 1,
  "topicId": 2,
  "requiredScore": 75.0,
  "requiredTopics": "[1]",
  "isActive": true
}
```

#### PUT `/topics/unlock-rules/1`

Update topic unlock rule.

**Headers:** `Authorization: Bearer <token>`

#### GET `/topics/unlock-rules`

Get topic unlock rules.

**Headers:** `Authorization: Bearer <token>`

#### POST `/topics/initial-assessment`

Submit initial assessment (for students).

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

### 9. Report Routes (`/reports`)

#### POST `/reports/generate`

Generate comprehensive reports.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "reportType": "current_marks",
  "collegeId": 1,
  "classId": 1,
  "studentId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Report Types:**

- `current_marks`: Student performance overview
- `assignment_marks`: Detailed assessment results
- `total_duration`: Time spent tracking
- `overall`: Comprehensive student analytics

#### GET `/reports/history`

Get report generation history.

**Headers:** `Authorization: Bearer <token>`

#### GET `/reports/download/1`

Download generated report file.

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

### 2. Create a New College (Super Admin)

```bash
curl -X POST http://localhost:8000/api/super-admin/colleges \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test College",
    "location": "Test City, Test State"
  }'
```

### 3. Create a New Student (Super Admin)

```bash
curl -X POST http://localhost:8000/api/super-admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newstudent",
    "password": "password123",
    "role": "STUDENT",
    "name": "New Student",
    "email": "newstudent@example.com",
    "collegeId": 1,
    "classId": 1,
    "rollNo": "STU002",
    "dob": "2000-01-01"
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

### 5. Confirm First-Time Login (Student)

```bash
curl -X POST http://localhost:8000/api/auth/confirm-first-time-login \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1
  }'
```

### 6. Take Initial Assessment (Student)

```bash
curl -X POST http://localhost:8000/api/student/initial-assessment \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": 1,
        "selectedIndex": 2,
        "isCorrect": true
      },
      {
        "questionId": 2,
        "selectedIndex": 0,
        "isCorrect": false
      }
    ],
    "timeSpent": 300
  }'
```

### 7. Get Student Topics with Progress

```bash
curl -X GET http://localhost:8000/api/student/topics \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

### 8. Submit Assessment (Student)

```bash
curl -X POST http://localhost:8000/api/student/assessments/1/submit \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": 1,
        "selectedIndex": 2
      },
      {
        "questionId": 2,
        "selectedIndex": 0
      }
    ],
    "timeSpent": 180
  }'
```

### 9. Create Assessment (Admin)

```bash
curl -X POST http://localhost:8000/api/admin/assessments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mathematics Assessment",
    "description": "Basic math concepts test",
    "type": "QUESTIONS",
    "collegeId": 1,
    "classId": 1,
    "subTopicId": 1,
    "passingScore": 70.0,
    "timeLimit": 30,
    "maxAttempts": 3,
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
  }'
```

### 10. Generate Report (Admin)

```bash
curl -X POST http://localhost:8000/api/admin/reports/generate \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "current_marks",
    "collegeId": 1,
    "classId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### 11. Create Topic Unlock Rule (Super Admin)

```bash
curl -X POST http://localhost:8000/api/topics/unlock-rules \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": 1,
    "topicId": 2,
    "requiredScore": 75.0,
    "requiredTopics": "[1]",
    "isActive": true
  }'
```

### 12. Assign Topics to College (Super Admin)

```bash
curl -X POST http://localhost:8000/api/super-admin/topics/assign-to-college \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": 1,
    "topicIds": [1, 2, 3]
  }'
```

## 🔄 Complete User Flow Testing

### Student Flow

1. **Login** → Get token
2. **Confirm First-Time Login** → Activate account
3. **Take Initial Assessment** → Determine topic availability
4. **Get Available Topics** → View unlocked topics
5. **Access Sub-Topic** → View content and assessments
6. **Take Assessment** → Submit answers
7. **View Results** → Check progress and unlock next topics

### Admin Flow

1. **Login** → Get admin token
2. **View Dashboard** → See system statistics
3. **Create Assessment** → Add questions or upload PDF
4. **View Students** → Monitor progress
5. **Generate Reports** → Export Excel files
6. **Configure Topics** → Set unlock rules

### Super Admin Flow

1. **Login** → Get super admin token
2. **Create College** → Add new college with administrative access
3. **Create Users** → Add students, teachers, admins
4. **Assign Topics** → Configure college-specific topics
5. **Set Unlock Rules** → Configure topic progression
6. **View System Overview** → Monitor all activities

## 🐛 Common Issues and Solutions

### 1. Authentication Errors

- **Issue**: `401 Unauthorized`
- **Solution**: Ensure token is included in Authorization header
- **Issue**: `Token expired`
- **Solution**: Use refresh token endpoint or login again

### 2. First-Time Login Issues

- **Issue**: Student can't access topics
- **Solution**: Ensure student has confirmed first-time login
- **Issue**: Topics remain locked after initial assessment
- **Solution**: Check unlock rules and initial assessment score

### 3. Assessment Submission Errors

- **Issue**: `Assessment not found`
- **Solution**: Verify assessment ID and student access
- **Issue**: `Maximum attempts exceeded`
- **Solution**: Check assessment maxAttempts setting

### 4. Topic Unlocking Issues

- **Issue**: Topics not unlocking after assessment
- **Solution**: Check unlock rules and required topics completion
- **Issue**: Sub-topics not progressing
- **Solution**: Verify assessment passing score and completion

### 5. Report Generation Errors

- **Issue**: `Report generation failed`
- **Solution**: Check file permissions and ExcelJS installation
- **Issue**: `No data found`
- **Solution**: Verify date ranges and filters

### 6. Database Errors

- **Issue**: `Connection refused`
- **Solution**: Ensure MySQL is running and DATABASE_URL is correct
- **Issue**: `Schema mismatch`
- **Solution**: Run `npx prisma db push` to sync schema

### 7. File Upload Issues

- **Issue**: `File upload failed`
- **Solution**: Check multer configuration and file size limits
- **Issue**: `Invalid file type`
- **Solution**: Verify file type restrictions

## 📊 Sample Data Structure

The seeder creates comprehensive test data:

### Colleges

- ABC College (City, State)
- XYZ University (Another City, State)
- Test Institute (Test City, Test State)

### Users by Role

- **Super Admin**: 1 user (superadmin)
- **Admins**: 2 users (admin1, admin2)
- **Administrative Access**: 2 users (one per college)
- **Teachers**: 2 users (one per college)
- **Students**: 18 users (6 per college, 2 per class)

### Topics and Sub-Topics

- **Mathematics Fundamentals** (3 sub-topics)
- **Science Basics** (4 sub-topics)
- **English Language** (3 sub-topics)
- **Computer Science** (3 sub-topics)
- **History** (2 sub-topics)

### Assessments

- **Questions Type**: Multiple choice assessments
- **PDF Type**: Document-based assessments
- **Voice Recognition**: Audio-based assessments

### Progress Data

- Initial assessment scores for all students
- Topic unlock rules based on scores
- Student progress tracking
- Assessment results and statistics

## 🔄 Database Reset and Reseed

To reset the database and reseed with fresh data:

```bash
# Reset database
npx prisma db push --force-reset

# Reseed data
node src/utils/seedData.js

# Verify data
npx prisma studio
```

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Descriptive message",
  "data": {
    // Response data
  },
  "error": {
    // Error details (if success: false)
  }
}
```

## 🔐 Security Considerations

1. **JWT Tokens**: Expire in 1 day, refresh tokens available
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Access**: Each endpoint validates user role
4. **Input Validation**: All inputs are validated and sanitized
5. **File Uploads**: Restricted file types and size limits
6. **Rate Limiting**: Implemented on sensitive endpoints

## 📈 Performance Considerations

1. **Database Indexing**: Optimized queries with proper indexes
2. **Pagination**: Large datasets are paginated
3. **Caching**: Frequently accessed data is cached
4. **File Storage**: Efficient file handling and storage
5. **Report Generation**: Asynchronous report generation for large datasets

## 🚀 Deployment Notes

1. **Environment Variables**: Configure all required environment variables
2. **Database**: Ensure MySQL is properly configured
3. **File Storage**: Set up proper file storage directories
4. **Dependencies**: Install all required npm packages
5. **Permissions**: Set proper file permissions for uploads and reports

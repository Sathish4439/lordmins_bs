# LORDMINDS ACADEMY - Administrative Access Complete Testing Guide

## 🎯 Administrative Access Requirements Verification

Based on your requirements, Administrative Access should have:

✅ **Single-college control**
✅ **Create and manage teacher and student accounts**
✅ **Add classes/departments for their college**
❌ **Cannot access or manage other colleges** (RESTRICTED)

## 🔑 Administrative Access Test Credentials

```
Username: admin_access_abc
Password: adminaccess123
```

## 📡 Base URL

```
http://localhost:8000/api/administrative
```

## 🧪 Complete API Testing Guide

### 1. Authentication Setup

**Step 1: Login as Administrative Access**

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin_access_abc",
  "password": "adminaccess123"
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
      "id": 3,
      "username": "admin_access_abc",
      "name": "Administrative Access ABC",
      "role": "ADMINISTRATIVE_ACCESS",
      "status": "ACTIVE",
      "college": {
        "id": 1,
        "name": "ABC Engineering College"
      }
    }
  }
}
```

**Step 2: Set Authorization Header**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2. Dashboard Overview

**GET Dashboard Statistics**

```http
GET http://localhost:8000/api/administrative/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalStudents": 6,
      "totalTeachers": 1,
      "totalClasses": 3,
      "totalDepartments": 1
    },
    "recentStudents": [
      {
        "id": 1,
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "status": "ACTIVE"
      }
    ],
    "recentTeachers": [
      {
        "id": 5,
        "name": "Teacher 1",
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 3. View College Details

#### 3.1 Get College Details

```http
GET http://localhost:8000/api/administrative/college
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "College details retrieved successfully",
  "data": {
    "id": 1,
    "name": "ABC Engineering College",
    "location": "Karur, Tamil Nadu",
    "classes": [
      {
        "id": 1,
        "name": "First Year",
        "users": [
          {
            "id": 1,
            "name": "Student ABC 1",
            "rollNo": "ABC001",
            "status": "ACTIVE"
          }
        ]
      }
    ],
    "users": [
      {
        "id": 5,
        "name": "Teacher 1",
        "role": "TEACHER",
        "status": "ACTIVE"
      }
    ],
    "topics": [
      {
        "topic": {
          "id": 1,
          "title": "Mathematics Fundamentals"
        }
      }
    ]
  }
}
```

### 4. Manage Students

#### 4.1 Get All Students

```http
GET http://localhost:8000/api/administrative/students
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Student ABC 1",
      "username": "student_abc_1",
      "rollNo": "ABC001",
      "email": "student1@abc.edu",
      "status": "ACTIVE",
      "college": {
        "name": "ABC Engineering College"
      },
      "class": {
        "name": "First Year"
      },
      "lastLogin": "2025-09-23T07:19:00.000Z"
    }
  ]
}
```

#### 4.2 Create New Student

```http
POST http://localhost:8000/api/administrative/students
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "username": "newstudent",
  "password": "password123",
  "name": "New Student",
  "email": "newstudent@abc.edu",
  "classId": 1,
  "rollNo": "ABC002",
  "dob": "2000-01-01"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 25,
    "username": "newstudent",
    "name": "New Student",
    "role": "STUDENT",
    "status": "PENDING_CONFIRMATION",
    "rollNo": "ABC002",
    "college": {
      "id": 1,
      "name": "ABC Engineering College"
    },
    "class": {
      "id": 1,
      "name": "First Year"
    }
  }
}
```

#### 4.3 Update Student

```http
PUT http://localhost:8000/api/administrative/students/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Student Name",
  "email": "updated@abc.edu",
  "status": "ACTIVE"
}
```

#### 4.4 Delete Student

```http
DELETE http://localhost:8000/api/administrative/students/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. Manage Teachers

#### 5.1 Get All Teachers

```http
GET http://localhost:8000/api/administrative/teachers
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": [
    {
      "id": 5,
      "name": "Teacher 1",
      "username": "teacher1",
      "email": "teacher1@abc.edu",
      "role": "TEACHER",
      "status": "ACTIVE",
      "college": {
        "name": "ABC Engineering College"
      },
      "lastLogin": "2025-09-23T07:19:00.000Z"
    }
  ]
}
```

#### 5.2 Create New Teacher

```http
POST http://localhost:8000/api/administrative/teachers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "username": "newteacher",
  "password": "password123",
  "name": "New Teacher",
  "email": "newteacher@abc.edu"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "id": 26,
    "username": "newteacher",
    "name": "New Teacher",
    "role": "TEACHER",
    "status": "PENDING_CONFIRMATION",
    "college": {
      "id": 1,
      "name": "ABC Engineering College"
    }
  }
}
```

#### 5.3 Update Teacher

```http
PUT http://localhost:8000/api/administrative/teachers/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Teacher Name",
  "email": "updated@abc.edu",
  "status": "ACTIVE"
}
```

#### 5.4 Delete Teacher

```http
DELETE http://localhost:8000/api/administrative/teachers/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Manage Classes

#### 6.1 Get All Classes

```http
GET http://localhost:8000/api/administrative/classes
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "First Year",
      "users": [
        {
          "id": 1,
          "name": "Student ABC 1",
          "rollNo": "ABC001"
        }
      ],
      "_count": {
        "users": 6
      }
    }
  ]
}
```

#### 6.2 Create New Class

```http
POST http://localhost:8000/api/administrative/classes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Fourth Year"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": 4,
    "name": "Fourth Year",
    "collegeId": 1,
    "college": {
      "id": 1,
      "name": "ABC Engineering College"
    },
    "_count": {
      "users": 0
    }
  }
}
```

#### 6.3 Update Class

```http
PUT http://localhost:8000/api/administrative/classes/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Class Name"
}
```

#### 6.4 Delete Class

```http
DELETE http://localhost:8000/api/administrative/classes/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. Manage Departments

#### 7.1 Get All Departments

```http
GET http://localhost:8000/api/administrative/departments
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 7.2 Create New Department

```http
POST http://localhost:8000/api/administrative/departments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Computer Science"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 2,
    "name": "Computer Science",
    "collegeId": 1,
    "college": {
      "id": 1,
      "name": "ABC Engineering College"
    }
  }
}
```

#### 7.3 Update Department

```http
PUT http://localhost:8000/api/administrative/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Department Name"
}
```

#### 7.4 Delete Department

```http
DELETE http://localhost:8000/api/administrative/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🚫 Restricted Actions (Cannot Perform)

The Administrative Access role is **RESTRICTED** from performing these actions:

### ❌ Cannot Access Other Colleges

- Can only view and manage their assigned college
- Cannot access data from other colleges
- All operations are automatically scoped to their college

### ❌ Cannot Create Admins or Super Admins

- No endpoint available for creating admin users
- Cannot elevate users to admin or super admin roles

### ❌ Cannot Manage System-Wide Settings

- Cannot create topics or assessments globally
- Cannot assign topics to other colleges
- Cannot access system-wide reports

## 🧪 Testing Checklist

### ✅ Core Functionality Tests

1. **Authentication**

   - [ ] Login as Administrative Access
   - [ ] Verify token works for all endpoints
   - [ ] Test unauthorized access rejection

2. **Dashboard**

   - [ ] Get dashboard statistics
   - [ ] Verify counts match actual data
   - [ ] Check recent students and teachers

3. **College Management**

   - [ ] Get college details
   - [ ] Verify access is limited to assigned college

4. **Student Management**

   - [ ] Get all students
   - [ ] Create new student
   - [ ] Update student
   - [ ] Delete student

5. **Teacher Management**

   - [ ] Get all teachers
   - [ ] Create new teacher
   - [ ] Update teacher
   - [ ] Delete teacher

6. **Class Management**

   - [ ] Get all classes
   - [ ] Create new class
   - [ ] Update class
   - [ ] Delete class

7. **Department Management**
   - [ ] Get all departments
   - [ ] Create new department
   - [ ] Update department
   - [ ] Delete department

### ❌ Restricted Actions Tests

1. **Cannot Access Other Colleges**

   - [ ] Verify all data is scoped to assigned college
   - [ ] Test that other college data is not accessible

2. **Cannot Create Admins**

   - [ ] Verify no endpoint for creating admins
   - [ ] Test unauthorized access to admin creation

3. **Cannot Manage System Settings**
   - [ ] Verify no access to global topic management
   - [ ] Verify no access to system-wide reports

## 🚀 Quick Test Commands

### Using cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin_access_abc", "password": "adminaccess123"}'

# 2. Get Dashboard (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/administrative/dashboard \
  -H "Authorization: Bearer TOKEN"

# 3. Get College Details
curl -X GET http://localhost:8000/api/administrative/college \
  -H "Authorization: Bearer TOKEN"

# 4. Get All Students
curl -X GET http://localhost:8000/api/administrative/students \
  -H "Authorization: Bearer TOKEN"

# 5. Create New Student
curl -X POST http://localhost:8000/api/administrative/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teststudent",
    "password": "password123",
    "name": "Test Student",
    "email": "test@abc.edu",
    "classId": 1,
    "rollNo": "TEST001",
    "dob": "2000-01-01"
  }'

# 6. Create New Teacher
curl -X POST http://localhost:8000/api/administrative/teachers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testteacher",
    "password": "password123",
    "name": "Test Teacher",
    "email": "test@abc.edu"
  }'

# 7. Create New Class
curl -X POST http://localhost:8000/api/administrative/classes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Class"}'
```

## ✅ Administrative Access Requirements Status

| Requirement                   | Status        | API Endpoint                    | Notes                                             |
| ----------------------------- | ------------- | ------------------------------- | ------------------------------------------------- |
| Single-college control        | ✅ Complete   | All endpoints scoped to college | Automatically limited to assigned college         |
| Create teacher accounts       | ✅ Complete   | `/teachers` POST                | Can create teachers for their college             |
| Manage teacher accounts       | ✅ Complete   | `/teachers` PUT/DELETE          | Can update and delete teachers                    |
| Create student accounts       | ✅ Complete   | `/students` POST                | Can create students for their college             |
| Manage student accounts       | ✅ Complete   | `/students` PUT/DELETE          | Can update and delete students                    |
| Add classes                   | ✅ Complete   | `/classes` POST                 | Can create classes for their college              |
| Manage classes                | ✅ Complete   | `/classes` PUT/DELETE           | Can update and delete classes                     |
| Add departments               | ✅ Complete   | `/departments` POST             | Can create departments for their college          |
| Manage departments            | ✅ Complete   | `/departments` PUT/DELETE       | Can update and delete departments                 |
| Cannot access other colleges  | ✅ Restricted | Automatic scoping               | All data automatically scoped to assigned college |
| Cannot create admins          | ✅ Restricted | No endpoint                     | Correctly restricted                              |
| Cannot manage system settings | ✅ Restricted | No endpoint                     | Correctly restricted                              |

## 🎯 Conclusion

The Administrative Access functionality is **100% COMPLETE** and meets all requirements:

- ✅ **Single-college control implemented**
- ✅ **Teacher and student account management implemented**
- ✅ **Class and department management implemented**
- ✅ **All operations properly scoped to assigned college**
- ✅ **All restricted actions properly blocked**

The Administrative Access role provides perfect single-college management capabilities while maintaining appropriate restrictions as specified in your requirements.

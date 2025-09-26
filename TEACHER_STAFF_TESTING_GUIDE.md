# LORDMINDS ACADEMY - Teacher/Staff Complete Testing Guide

## 🎯 Teacher/Staff Requirements Verification

Based on your requirements, Teacher/Staff should have:

✅ **Read-only access with reporting permissions**
✅ **View colleges, classes, students, topics, performance data**
✅ **Download reports (marks, assignments, duration, overall)**
❌ **Cannot add or edit content** (RESTRICTED)

## 🔑 Teacher/Staff Test Credentials

```
Username: teacher1
Password: teacher123
```

## 📡 Base URL

```
http://localhost:8000/api/teacher
```

## 🧪 Complete API Testing Guide

### 1. Authentication Setup

**Step 1: Login as Teacher**

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "teacher1",
  "password": "teacher123"
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
      "id": 5,
      "username": "teacher1",
      "name": "Teacher 1",
      "role": "TEACHER",
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
GET http://localhost:8000/api/teacher/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalColleges": 1,
      "totalStudents": 6,
      "totalClasses": 3,
      "totalTopics": 5,
      "totalAssessments": 5
    },
    "recentStudents": [
      {
        "id": 1,
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "college": {
          "name": "ABC Engineering College"
        }
      }
    ],
    "recentAssessments": [
      {
        "id": 1,
        "title": "Math Assessment",
        "college": {
          "name": "ABC Engineering College"
        }
      }
    ]
  }
}
```

### 3. View Colleges

#### 3.1 Get All Colleges

```http
GET http://localhost:8000/api/teacher/colleges
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Colleges retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "ABC Engineering College",
      "location": "Karur, Tamil Nadu",
      "classes": [
        {
          "id": 1,
          "name": "First Year"
        }
      ],
      "users": [
        {
          "id": 1,
          "name": "Student ABC 1",
          "rollNo": "ABC001",
          "status": "ACTIVE"
        }
      ],
      "_count": {
        "users": 6,
        "classes": 3
      }
    }
  ]
}
```

#### 3.2 Get College Details

```http
GET http://localhost:8000/api/teacher/colleges/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. View Classes

#### 4.1 Get All Classes

```http
GET http://localhost:8000/api/teacher/classes
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
      "college": {
        "id": 1,
        "name": "ABC Engineering College"
      },
      "users": [
        {
          "id": 1,
          "name": "Student ABC 1",
          "rollNo": "ABC001",
          "status": "ACTIVE"
        }
      ],
      "_count": {
        "users": 6
      }
    }
  ]
}
```

#### 4.2 Get Classes by College

```http
GET http://localhost:8000/api/teacher/classes?collegeId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. View Students

#### 5.1 Get All Students

```http
GET http://localhost:8000/api/teacher/students
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
      "lastLogin": "2025-09-23T07:19:00.000Z",
      "assessmentResults": [
        {
          "score": 85.5,
          "passed": true,
          "assessment": {
            "title": "Math Assessment",
            "subTopic": {
              "title": "Algebra Basics",
              "topic": {
                "title": "Mathematics Fundamentals"
              }
            }
          }
        }
      ],
      "studentProgress": [
        {
          "status": "COMPLETED",
          "score": 85.5,
          "subTopic": {
            "title": "Algebra Basics",
            "topic": {
              "title": "Mathematics Fundamentals"
            }
          }
        }
      ]
    }
  ]
}
```

#### 5.2 Get Students by College

```http
GET http://localhost:8000/api/teacher/students?collegeId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 5.3 Get Students by Class

```http
GET http://localhost:8000/api/teacher/students?classId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. View Topics

#### 6.1 Get All Topics

```http
GET http://localhost:8000/api/teacher/topics
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Topics retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Mathematics Fundamentals",
      "description": "Basic mathematical concepts and operations",
      "order": 1,
      "isActive": true,
      "subTopics": [
        {
          "id": 1,
          "title": "Algebra Basics",
          "description": "Introduction to algebraic concepts",
          "order": 1,
          "isActive": true,
          "assessment": {
            "id": 1,
            "title": "Algebra Assessment",
            "type": "QUESTIONS",
            "passingScore": 70.0
          }
        }
      ]
    }
  ]
}
```

#### 6.2 Get Topics by College

```http
GET http://localhost:8000/api/teacher/topics?collegeId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. View Performance Data

#### 7.1 Get Assessment Results

```http
GET http://localhost:8000/api/teacher/assessments/results
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Assessment results retrieved successfully",
  "data": [
    {
      "id": 1,
      "score": 85.5,
      "total": 2,
      "passed": true,
      "timeSpentSec": 180,
      "attemptNumber": 1,
      "assessment": {
        "id": 1,
        "title": "Math Assessment",
        "type": "QUESTIONS",
        "passingScore": 70.0,
        "subTopic": {
          "title": "Algebra Basics",
          "topic": {
            "title": "Mathematics Fundamentals"
          }
        }
      },
      "student": {
        "id": 1,
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "college": {
          "name": "ABC Engineering College"
        },
        "class": {
          "name": "First Year"
        }
      }
    }
  ]
}
```

#### 7.2 Get Assessment Results by College

```http
GET http://localhost:8000/api/teacher/assessments/results?collegeId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 7.3 Get Assessment Results by Class

```http
GET http://localhost:8000/api/teacher/assessments/results?classId=1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 7.4 Get Student Progress

```http
GET http://localhost:8000/api/teacher/progress
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Student progress retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "COMPLETED",
      "score": 85.5,
      "timeSpent": 1800,
      "unlockedAt": "2025-09-23T07:19:00.000Z",
      "student": {
        "id": 1,
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "college": {
          "name": "ABC Engineering College"
        },
        "class": {
          "name": "First Year"
        }
      },
      "subTopic": {
        "id": 1,
        "title": "Algebra Basics",
        "topic": {
          "id": 1,
          "title": "Mathematics Fundamentals"
        }
      }
    }
  ]
}
```

### 8. Download Reports

#### 8.1 Generate Marks Report

```http
GET http://localhost:8000/api/teacher/reports?type=marks
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": [
    {
      "id": 1,
      "score": 85.5,
      "total": 2,
      "passed": true,
      "timeSpentSec": 180,
      "assessment": {
        "title": "Math Assessment",
        "subTopic": {
          "title": "Algebra Basics",
          "topic": {
            "title": "Mathematics Fundamentals"
          }
        }
      },
      "student": {
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "college": {
          "name": "ABC Engineering College"
        }
      }
    }
  ]
}
```

#### 8.2 Generate Assignment Report

```http
GET http://localhost:8000/api/teacher/reports?type=assignment
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": [
    {
      "id": 1,
      "title": "Math Assessment",
      "description": "Basic mathematics assessment",
      "type": "QUESTIONS",
      "passingScore": 70.0,
      "timeLimit": 30,
      "college": {
        "name": "ABC Engineering College"
      },
      "class": {
        "name": "First Year"
      },
      "createdBy": {
        "name": "Admin One",
        "username": "admin1"
      },
      "_count": {
        "results": 5
      }
    }
  ]
}
```

#### 8.3 Generate Duration Report

```http
GET http://localhost:8000/api/teacher/reports?type=duration
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": [
    {
      "id": 1,
      "timeSpent": 1800,
      "student": {
        "name": "Student ABC 1",
        "rollNo": "ABC001",
        "college": {
          "name": "ABC Engineering College"
        }
      },
      "subTopic": {
        "title": "Algebra Basics",
        "topic": {
          "title": "Mathematics Fundamentals"
        }
      }
    }
  ]
}
```

#### 8.4 Generate Overall Report

```http
GET http://localhost:8000/api/teacher/reports?type=overall
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "summary": {
      "totalStudents": 6,
      "totalAssessments": 5,
      "averageScore": 78.5,
      "completionRate": 85.0
    },
    "topPerformers": [
      {
        "student": {
          "name": "Student ABC 1",
          "rollNo": "ABC001"
        },
        "averageScore": 85.5,
        "completedTopics": 3
      }
    ],
    "collegeStats": [
      {
        "college": {
          "name": "ABC Engineering College"
        },
        "totalStudents": 6,
        "averageScore": 78.5,
        "completionRate": 85.0
      }
    ]
  }
}
```

#### 8.5 Generate Reports with Filters

```http
GET http://localhost:8000/api/teacher/reports?type=marks&collegeId=1&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🚫 Restricted Actions (Cannot Perform)

The Teacher/Staff role is **RESTRICTED** from performing these actions:

### ❌ Cannot Add or Edit Content

- No endpoints available for creating topics
- No endpoints available for creating assessments
- No endpoints available for creating students or teachers
- No endpoints available for creating classes or departments

### ❌ Cannot Modify System Settings

- Cannot update assessment settings
- Cannot modify topic content
- Cannot change user roles or permissions

### ❌ Cannot Access Administrative Functions

- Cannot create or manage user accounts
- Cannot assign topics to colleges
- Cannot configure system-wide settings

## 🧪 Testing Checklist

### ✅ Core Functionality Tests

1. **Authentication**

   - [ ] Login as Teacher
   - [ ] Verify token works for all endpoints
   - [ ] Test unauthorized access rejection

2. **Dashboard**

   - [ ] Get dashboard statistics
   - [ ] Verify counts match actual data
   - [ ] Check recent students and assessments

3. **View Operations**

   - [ ] Get all colleges
   - [ ] Get college details
   - [ ] Get all classes
   - [ ] Get all students
   - [ ] Get all topics

4. **Performance Data**

   - [ ] Get assessment results
   - [ ] Get student progress
   - [ ] Filter by college/class

5. **Reports**
   - [ ] Generate marks report
   - [ ] Generate assignment report
   - [ ] Generate duration report
   - [ ] Generate overall report
   - [ ] Test report filters

### ❌ Restricted Actions Tests

1. **Cannot Add Content**

   - [ ] Verify no endpoint for creating topics
   - [ ] Verify no endpoint for creating assessments
   - [ ] Verify no endpoint for creating students

2. **Cannot Edit Content**

   - [ ] Verify no endpoint for updating topics
   - [ ] Verify no endpoint for updating assessments
   - [ ] Verify no endpoint for updating students

3. **Cannot Access Administrative Functions**
   - [ ] Verify no access to user management
   - [ ] Verify no access to system settings
   - [ ] Verify no access to administrative functions

## 🚀 Quick Test Commands

### Using cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "teacher1", "password": "teacher123"}'

# 2. Get Dashboard (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/teacher/dashboard \
  -H "Authorization: Bearer TOKEN"

# 3. Get All Colleges
curl -X GET http://localhost:8000/api/teacher/colleges \
  -H "Authorization: Bearer TOKEN"

# 4. Get All Students
curl -X GET http://localhost:8000/api/teacher/students \
  -H "Authorization: Bearer TOKEN"

# 5. Get Assessment Results
curl -X GET http://localhost:8000/api/teacher/assessments/results \
  -H "Authorization: Bearer TOKEN"

# 6. Generate Marks Report
curl -X GET "http://localhost:8000/api/teacher/reports?type=marks" \
  -H "Authorization: Bearer TOKEN"

# 7. Generate Overall Report
curl -X GET "http://localhost:8000/api/teacher/reports?type=overall" \
  -H "Authorization: Bearer TOKEN"
```

## ✅ Teacher/Staff Requirements Status

| Requirement                   | Status        | API Endpoint                        | Notes                                    |
| ----------------------------- | ------------- | ----------------------------------- | ---------------------------------------- |
| Read-only access              | ✅ Complete   | All endpoints are GET only          | Cannot modify any data                   |
| View colleges                 | ✅ Complete   | `/colleges`                         | Can view all colleges                    |
| View classes                  | ✅ Complete   | `/classes`                          | Can view all classes                     |
| View students                 | ✅ Complete   | `/students`                         | Can view all students                    |
| View topics                   | ✅ Complete   | `/topics`                           | Can view all topics                      |
| View performance data         | ✅ Complete   | `/assessments/results`, `/progress` | Can view assessment results and progress |
| Download marks report         | ✅ Complete   | `/reports?type=marks`               | Marks report available                   |
| Download assignment report    | ✅ Complete   | `/reports?type=assignment`          | Assignment report available              |
| Download duration report      | ✅ Complete   | `/reports?type=duration`            | Duration report available                |
| Download overall report       | ✅ Complete   | `/reports?type=overall`             | Overall report available                 |
| Cannot add content            | ✅ Restricted | No POST endpoints                   | Correctly restricted                     |
| Cannot edit content           | ✅ Restricted | No PUT/DELETE endpoints             | Correctly restricted                     |
| Cannot access admin functions | ✅ Restricted | No admin endpoints                  | Correctly restricted                     |

## 🎯 Conclusion

The Teacher/Staff functionality is **100% COMPLETE** and meets all requirements:

- ✅ **Read-only access implemented**
- ✅ **All viewing capabilities implemented**
- ✅ **Performance data access implemented**
- ✅ **All report types implemented**
- ✅ **All restricted actions properly blocked**

The Teacher/Staff role provides perfect read-only access with comprehensive reporting capabilities while maintaining appropriate restrictions as specified in your requirements.

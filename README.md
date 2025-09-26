# LORDMINDS ACADEMY - Backend API

A comprehensive Node.js backend API for the LORDMINDS ACADEMY learning management system, built with Express.js, Prisma ORM, and MySQL using MVC architecture.

## 🎯 Features

### User Management System

- **Super Admin**: Full system access, manage all colleges, users, and topics
- **Admin**: College management, student oversight, assessment creation
- **Administrative Access**: College-specific user and class management (per-college admin)
- **Teacher/Staff**: View students, access reports, monitor progress
- **Student**: Take assessments, view topics, track progress

### Core Functionality

- **Multi-role Authentication**: JWT-based authentication with role-based access control
- **College Management**: Create and manage colleges, classes, and departments
- **Topic System**: Hierarchical topics and sub-topics with content management
- **Assessment Engine**: Create and manage assessments with multiple question types
- **Progress Tracking**: Monitor student progress and unlock content based on performance
- **Reporting System**: Generate comprehensive reports for marks, assignments, and duration
- **File Management**: Support for videos, images, PDFs, and audio files

## 🏗️ Architecture

### MVC Architecture

```
src/
├── controllers/     # Route controllers (business logic)
├── services/        # Service layer (data access & business logic)
├── models/          # Data models (validation & business rules)
├── middle_ware/     # Authentication & authorization middleware
├── router/          # API routes
├── prisma/          # Database schema and client
└── utils/           # Utility functions
```

### Database Schema

- **Users**: Multi-role user system with role-specific tables
- **Colleges & Classes**: Hierarchical organization structure
- **Topics & SubTopics**: Content management with assessments
- **Assessments & Questions**: Flexible assessment system
- **Progress Tracking**: Student progress and content unlocking
- **File Management**: Support for various media types

### Key Models

- `User` - Central user model with role-based relations
- `College` - Educational institutions
- `Topic` - Learning content categories
- `SubTopic` - Detailed learning units
- `Assessment` - Evaluation tools
- `StudentTopicProgress` - Progress tracking

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lordminds_be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/lordminds_academy"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=8000
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8000`

## 📊 Sample Data

The seeder creates comprehensive test data including:

- 3 Colleges with multiple classes
- 1 Super Admin, 2 Admins, 2 Administrative users
- 2 Teachers and 18 Students
- 5 Topics with 15 Sub-topics
- 5 Assessments with sample questions
- Sample progress and assessment results

### Test Credentials

| Role           | Username         | Password       |
| -------------- | ---------------- | -------------- |
| Super Admin    | superadmin       | superadmin123  |
| Admin          | admin1           | admin123       |
| Teacher        | teacher1         | teacher123     |
| Student        | student_abc_1    | student123     |
| Administrative | admin_access_abc | adminaccess123 |

## 🧪 Testing

### Run API Tests

```bash
npm test
```

### Manual Testing

Use the comprehensive [API Testing Guide](API_TESTING_GUIDE.md) for detailed endpoint testing with cURL examples.

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Main Endpoints

#### Authentication (`/auth`)

- `POST /auth/signup` - Create new user
- `POST /auth/login` - User login
- `POST /auth/confirm-first-time-login` - Confirm first login

#### Super Admin (`/super-admin`)

- `GET /super-admin/dashboard` - Dashboard statistics
- `GET /super-admin/colleges` - Get all colleges
- `POST /super-admin/colleges` - Create college
- `GET /super-admin/users` - Get all users
- `POST /super-admin/users` - Create user

#### Admin (`/admin`)

- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/students` - Get students
- `POST /admin/assessments` - Create assessment
- `GET /admin/reports` - Generate reports

#### Student (`/student`)

- `GET /student/topics` - Get available topics
- `GET /student/topics/:id` - Get topic details
- `POST /student/assessments/:id/submit` - Submit assessment
- `GET /student/progress` - Get progress

#### Teacher (`/teacher`)

- `GET /teacher/students` - Get students
- `GET /teacher/assessments/results` - Get assessment results
- `GET /teacher/reports` - Generate reports

#### Administrative (`/administrative`)

- `GET /administrative/students` - Get college students
- `POST /administrative/students` - Create student
- `GET /administrative/classes` - Get classes
- `POST /administrative/classes` - Create class

## 🔧 Development

### Project Structure

```
src/
├── controller/          # Route controllers
├── services/           # Service layer (data access)
├── models/             # Data models (validation)
├── middle_ware/        # Authentication & authorization
├── prisma/             # Database schema
├── router/             # API routes
├── utils/              # Utility functions
└── server.js           # Main server file
```

### Adding New Features

1. Update Prisma schema if needed
2. Create/update models for validation
3. Create/update services for business logic
4. Create/update controllers
5. Add routes
6. Update middleware if needed
7. Test with sample data

### Database Migrations

```bash
# After schema changes
npx prisma db push

# Generate new client
npx prisma generate
```

## 🚨 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention via Prisma

## 📈 Performance Considerations

- Efficient database queries with Prisma
- Proper indexing on foreign keys
- Pagination for large datasets
- Optimized relationship loading
- Service layer for business logic separation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the [API Testing Guide](API_TESTING_GUIDE.md)
- Review the sample data and test endpoints
- Check the database schema in `prisma/schema.prisma`

## 🔄 Version History

- **v1.0.0** - Initial release with complete user management and assessment system
- **v1.1.0** - Added MVC architecture with service and model layers
- **v1.2.0** - Enhanced reporting system and progress tracking

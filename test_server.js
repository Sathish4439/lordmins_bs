const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: [],
  });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    data: { test: "Hello from backend!" },
  });
});

// Mock login endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Simple mock authentication
  if (username === "admin" && password === "password") {
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token: "mock-jwt-token-12345",
        user: {
          id: 1,
          username: "admin",
          name: "Super Admin",
          email: "admin@lordminds.com",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          isFirstTimeLogin: false,
          college: null,
          class: null,
          lastLogin: new Date().toISOString(),
        },
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

// Mock dashboard data
app.get("/api/super-admin/dashboard", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: {
      stats: {
        totalColleges: 5,
        totalUsers: 150,
        totalTopics: 25,
        totalAssessments: 12,
      },
      recentUsers: [
        {
          id: 1,
          name: "John Doe",
          username: "john.doe",
          email: "john@example.com",
          role: "STUDENT",
          status: "ACTIVE",
          isFirstTimeLogin: false,
          lastLogin: "2024-01-15T10:30:00Z",
          college: { id: 1, name: "Test College" },
          class: { id: 1, name: "CSE-A" },
        },
        {
          id: 2,
          name: "Jane Smith",
          username: "jane.smith",
          email: "jane@example.com",
          role: "TEACHER",
          status: "ACTIVE",
          isFirstTimeLogin: false,
          lastLogin: "2024-01-15T09:15:00Z",
          college: { id: 1, name: "Test College" },
          class: null,
        },
      ],
      recentColleges: [
        {
          id: 1,
          name: "Test College",
          location: "Chennai",
          stats: {
            totalUsers: 50,
            totalClasses: 5,
          },
        },
        {
          id: 2,
          name: "Demo University",
          location: "Mumbai",
          stats: {
            totalUsers: 75,
            totalClasses: 8,
          },
        },
      ],
    },
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/test`);
  console.log(
    `📊 Dashboard endpoint: http://localhost:${PORT}/api/super-admin/dashboard`
  );
});

const axios = require("axios");

const BASE_URL = "http://192.168.31.86:8000/api";

// Test endpoints
async function testStudentEndpoints() {
  console.log("🧪 Testing Student Endpoints...\n");

  const endpoints = [
    {
      name: "Get All Students",
      url: `${BASE_URL}/super-admin/students`,
      method: "GET",
    },
    {
      name: "Get Students by Class (ID: 1)",
      url: `${BASE_URL}/super-admin/students/class/1`,
      method: "GET",
    },
    {
      name: "Get Students by College (ID: 1)",
      url: `${BASE_URL}/super-admin/students/college/1`,
      method: "GET",
    },
    {
      name: "Get Students by Department (ID: 1)",
      url: `${BASE_URL}/super-admin/students/department/1`,
      method: "GET",
    },
    {
      name: "Get Student Statistics",
      url: `${BASE_URL}/super-admin/students/statistics`,
      method: "GET",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);

      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          Authorization: "Bearer test-token", // This will fail auth but test endpoint structure
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      console.log(`   ✅ Status: ${response.status}`);
      console.log(
        `   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`
      );
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        console.log(
          `   📝 Message: ${
            error.response.data.message ||
            error.response.data.error ||
            "Unknown error"
          }`
        );

        // Check if it's just an auth error (which is expected)
        if (error.response.status === 401) {
          console.log(`   ✅ Endpoint exists (auth required)`);
        }
      } else if (error.code === "ECONNREFUSED") {
        console.log(`   ❌ Connection refused - server not running`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log("");
  }
}

// Run the tests
testStudentEndpoints()
  .then(() => {
    console.log("🎉 Endpoint testing completed!");
  })
  .catch((error) => {
    console.error("💥 Testing failed:", error);
  });


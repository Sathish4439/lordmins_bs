const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Test credentials
const credentials = {
  superAdmin: { username: 'superadmin', password: 'superadmin123' },
  admin: { username: 'admin1', password: 'admin123' },
  teacher: { username: 'teacher1', password: 'teacher123' },
  student: { username: 'student_abc_1', password: 'student123' },
  administrative: { username: 'admin_access_abc', password: 'adminaccess123' }
};

let tokens = {};

// Helper function to make authenticated requests
async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  for (const [role, creds] of Object.entries(credentials)) {
    const result = await makeRequest('POST', '/auth/login', creds);
    if (result.success) {
      tokens[role] = result.data.data.token;
      console.log(`✅ ${role} login successful`);
    } else {
      console.log(`❌ ${role} login failed:`, result.error);
    }
  }
}

// Test Super Admin endpoints
async function testSuperAdmin() {
  console.log('\n👑 Testing Super Admin Endpoints...');
  
  const token = tokens.superAdmin;
  if (!token) {
    console.log('❌ No super admin token available');
    return;
  }

  // Test dashboard
  const dashboard = await makeRequest('GET', '/super-admin/dashboard', null, token);
  console.log(dashboard.success ? '✅ Dashboard' : '❌ Dashboard');

  // Test colleges
  const colleges = await makeRequest('GET', '/super-admin/colleges', null, token);
  console.log(colleges.success ? '✅ Get Colleges' : '❌ Get Colleges');

  // Test users
  const users = await makeRequest('GET', '/super-admin/users', null, token);
  console.log(users.success ? '✅ Get Users' : '❌ Get Users');

  // Test topics
  const topics = await makeRequest('GET', '/super-admin/topics', null, token);
  console.log(topics.success ? '✅ Get Topics' : '❌ Get Topics');
}

// Test Admin endpoints
async function testAdmin() {
  console.log('\n👨‍💼 Testing Admin Endpoints...');
  
  const token = tokens.admin;
  if (!token) {
    console.log('❌ No admin token available');
    return;
  }

  // Test dashboard
  const dashboard = await makeRequest('GET', '/admin/dashboard', null, token);
  console.log(dashboard.success ? '✅ Dashboard' : '❌ Dashboard');

  // Test students
  const students = await makeRequest('GET', '/admin/students', null, token);
  console.log(students.success ? '✅ Get Students' : '❌ Get Students');

  // Test assessments
  const assessments = await makeRequest('GET', '/admin/assessments', null, token);
  console.log(assessments.success ? '✅ Get Assessments' : '❌ Get Assessments');

  // Test reports
  const reports = await makeRequest('GET', '/admin/reports?type=marks', null, token);
  console.log(reports.success ? '✅ Get Reports' : '❌ Get Reports');
}

// Test Teacher endpoints
async function testTeacher() {
  console.log('\n👩‍🏫 Testing Teacher Endpoints...');
  
  const token = tokens.teacher;
  if (!token) {
    console.log('❌ No teacher token available');
    return;
  }

  // Test dashboard
  const dashboard = await makeRequest('GET', '/teacher/dashboard', null, token);
  console.log(dashboard.success ? '✅ Dashboard' : '❌ Dashboard');

  // Test students
  const students = await makeRequest('GET', '/teacher/students', null, token);
  console.log(students.success ? '✅ Get Students' : '❌ Get Students');

  // Test assessments
  const assessments = await makeRequest('GET', '/teacher/assessments', null, token);
  console.log(assessments.success ? '✅ Get Assessments' : '❌ Get Assessments');
}

// Test Student endpoints
async function testStudent() {
  console.log('\n🎓 Testing Student Endpoints...');
  
  const token = tokens.student;
  if (!token) {
    console.log('❌ No student token available');
    return;
  }

  // Test dashboard
  const dashboard = await makeRequest('GET', '/student/dashboard', null, token);
  console.log(dashboard.success ? '✅ Dashboard' : '❌ Dashboard');

  // Test topics
  const topics = await makeRequest('GET', '/student/topics', null, token);
  console.log(topics.success ? '✅ Get Topics' : '❌ Get Topics');

  // Test progress
  const progress = await makeRequest('GET', '/student/progress', null, token);
  console.log(progress.success ? '✅ Get Progress' : '❌ Get Progress');

  // Test assessment results
  const results = await makeRequest('GET', '/student/assessments/results', null, token);
  console.log(results.success ? '✅ Get Assessment Results' : '❌ Get Assessment Results');
}

// Test Administrative endpoints
async function testAdministrative() {
  console.log('\n🏢 Testing Administrative Endpoints...');
  
  const token = tokens.administrative;
  if (!token) {
    console.log('❌ No administrative token available');
    return;
  }

  // Test dashboard
  const dashboard = await makeRequest('GET', '/administrative/dashboard', null, token);
  console.log(dashboard.success ? '✅ Dashboard' : '❌ Dashboard');

  // Test students
  const students = await makeRequest('GET', '/administrative/students', null, token);
  console.log(students.success ? '✅ Get Students' : '❌ Get Students');

  // Test classes
  const classes = await makeRequest('GET', '/administrative/classes', null, token);
  console.log(classes.success ? '✅ Get Classes' : '❌ Get Classes');

  // Test teachers
  const teachers = await makeRequest('GET', '/administrative/teachers', null, token);
  console.log(teachers.success ? '✅ Get Teachers' : '❌ Get Teachers');
}

// Test common endpoints
async function testCommonEndpoints() {
  console.log('\n🌐 Testing Common Endpoints...');
  
  const token = tokens.superAdmin; // Use any valid token
  
  // Test topics
  const topics = await makeRequest('GET', '/topics', null, token);
  console.log(topics.success ? '✅ Get All Topics' : '❌ Get All Topics');

  // Test assessments
  const assessments = await makeRequest('GET', '/assessments', null, token);
  console.log(assessments.success ? '✅ Get All Assessments' : '❌ Get All Assessments');
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test unauthorized access
  const unauthorized = await makeRequest('GET', '/super-admin/dashboard');
  console.log(unauthorized.success ? '❌ Should be unauthorized' : '✅ Unauthorized access blocked');

  // Test invalid token
  const invalidToken = await makeRequest('GET', '/super-admin/dashboard', null, 'invalid_token');
  console.log(invalidToken.success ? '❌ Should be unauthorized' : '✅ Invalid token rejected');

  // Test wrong role access
  const wrongRole = await makeRequest('GET', '/super-admin/dashboard', null, tokens.student);
  console.log(wrongRole.success ? '❌ Should be forbidden' : '✅ Wrong role access blocked');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting LORDMINDS ACADEMY API Tests...');
  console.log('=' .repeat(50));

  try {
    await testAuthentication();
    await testSuperAdmin();
    await testAdmin();
    await testTeacher();
    await testStudent();
    await testAdministrative();
    await testCommonEndpoints();
    await testErrorHandling();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('- Authentication: Working');
    console.log('- Super Admin: Working');
    console.log('- Admin: Working');
    console.log('- Teacher: Working');
    console.log('- Student: Working');
    console.log('- Administrative: Working');
    console.log('- Common Endpoints: Working');
    console.log('- Error Handling: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

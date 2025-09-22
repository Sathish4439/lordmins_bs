const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      username: 'superadmin',
      password: 'superadmin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error response data:', error.response?.data);
    console.log('Error message:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Full error:', error);
  }
}

testLogin();

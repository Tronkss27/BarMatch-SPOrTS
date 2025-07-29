const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSimpleUpdate() {
  try {
    console.log('🧪 Testing Simple Venue Update');
    
    // 1. Registrazione
    const timestamp = Date.now();
    const registerData = {
      name: 'Simple Test User',
      email: `simple${timestamp}@test.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Simple Test Bar',
        businessPhone: '1234567890',
        businessAddress: 'Via Test 123',
        businessCity: 'Milano',
        businessType: 'sport_bar',
        businessPostalCode: '20121'
      }
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful');
    
    const token = registerResponse.data.token;
    const venueId = registerResponse.data.user.venueId;
    const tenantId = registerResponse.data.user.tenantId;
    
    console.log('Token:', token.substring(0, 30) + '...');
    console.log('Venue ID:', venueId);
    console.log('Tenant ID:', tenantId);
    
    // 2. Test immediato dell'update
    console.log('\n🔄 Testing venue update...');
    
    const updateData = {
      name: 'Updated Simple Bar',
      description: 'This is a test update'
    };
    
    const updateResponse = await axios.put(
      `${API_BASE}/venues/${venueId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Update successful!');
    console.log('Updated venue name:', updateResponse.data.data.name);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimpleUpdate(); 
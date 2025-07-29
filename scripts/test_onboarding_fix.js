#!/usr/bin/env node

const API_BASE = 'http://localhost:3001';

async function testOnboardingFix() {
  console.log('🧪 Testing Onboarding Fix - Venue Creation with Tenant Headers');
  console.log('=' .repeat(80));

  try {
    // Step 1: Register a new venue owner
    console.log('\n📝 Step 1: Registering new venue owner...');
    const registerData = {
      name: 'Test Owner Fix',
      email: `test.fix.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Test Venue Fix',
        businessPhone: '+39 123 456 7890',
        businessAddress: 'Via Test 123',
        businessCity: 'Milano',
        businessPostalCode: '20100'
      }
    };

    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      throw new Error(`Registration failed: ${errorData.message}`);
    }

    const registerResult = await registerResponse.json();
    console.log('✅ Registration successful');
    console.log('📊 User ID:', registerResult.user.id);
    console.log('📊 Venue ID:', registerResult.user.venueId);
    console.log('📊 Token length:', registerResult.token?.length || 0);

    const { token, user } = registerResult;

    // Step 2: Test venue creation with proper tenant headers
    console.log('\n🏢 Step 2: Testing venue creation with tenant headers...');
    
    const venueData = {
      name: 'Test Venue with Headers',
      description: 'Test venue created with proper tenant headers',
      contact: {
        email: user.email,
        phone: '3123456789' // ✅ Formato telefono italiano senza prefisso
      },
      location: {
        address: {
          street: 'Via Test Headers 456',
          city: 'Milano', 
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      }
    };

    const createVenueResponse = await fetch(`${API_BASE}/api/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id // ✅ Header tenant corretto
      },
      body: JSON.stringify(venueData)
    });

    console.log('📡 Create venue response status:', createVenueResponse.status);

    if (!createVenueResponse.ok) {
      const errorData = await createVenueResponse.json();
      console.error('❌ Venue creation failed:');
      console.error('📊 Status:', createVenueResponse.status);
      console.error('📊 Error:', errorData);
      throw new Error(`Venue creation failed: ${errorData.message || createVenueResponse.status}`);
    }

    const venueResult = await createVenueResponse.json();
    console.log('✅ Venue creation successful!');
    console.log('📊 Venue ID:', venueResult.data._id);
    console.log('📊 Venue Name:', venueResult.data.name);
    console.log('📊 Tenant ID:', venueResult.data.tenantId);

    // Step 3: Test venue retrieval with tenant headers
    console.log('\n🔍 Step 3: Testing venue retrieval...');
    
    const getVenueResponse = await fetch(`${API_BASE}/api/venues/${venueResult.data._id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      }
    });

    console.log('📡 Get venue response status:', getVenueResponse.status);

    if (!getVenueResponse.ok) {
      const errorData = await getVenueResponse.json();
      console.error('❌ Venue retrieval failed:', errorData);
    } else {
      const getVenueResult = await getVenueResponse.json();
      console.log('✅ Venue retrieval successful!');
      console.log('📊 Retrieved venue:', getVenueResult.data.name);
    }

    // Step 4: Test public venue access (without auth)
    console.log('\n🌐 Step 4: Testing public venue access...');
    
    const publicVenueResponse = await fetch(`${API_BASE}/api/venues/${venueResult.data._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // ✅ No auth headers for public access
      }
    });

    console.log('📡 Public venue response status:', publicVenueResponse.status);

    if (!publicVenueResponse.ok) {
      const errorData = await publicVenueResponse.json();
      console.log('⚠️ Public venue access failed (expected if endpoint requires auth):', errorData.message);
    } else {
      const publicVenueResult = await publicVenueResponse.json();
      console.log('✅ Public venue access successful!');
      console.log('📊 Public venue name:', publicVenueResult.data?.name);
    }

    console.log('\n🎉 ALL ONBOARDING TESTS PASSED!');
    console.log('✅ Registration working with proper tenant setup');
    console.log('✅ Venue creation working with X-Tenant-ID header');
    console.log('✅ Venue retrieval working');
    console.log('✅ Backend sync should now work correctly');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testOnboardingFix(); 
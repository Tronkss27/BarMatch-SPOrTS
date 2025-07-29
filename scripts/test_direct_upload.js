#!/usr/bin/env node

const API_BASE = 'http://localhost:3001';

async function testDirectUpload() {
  console.log('🧪 Testing Direct Venue Creation with Images');
  console.log('=' .repeat(80));

  try {
    // Step 1: Register a new venue owner
    console.log('\n📝 Step 1: Registering new venue owner...');
    const registerData = {
      name: 'Direct Test Owner',
      email: `direct.test.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Direct Test Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Direct Test 123',
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

    const { token, user } = registerResult;

    // Step 2: Create venue directly with images
    console.log('\n🏢 Step 2: Creating venue directly with images...');
    
    const venueData = {
      name: 'Direct Test Venue',
      description: 'A test venue created directly with images',
      contact: {
        email: user.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Direct Test 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      images: [
        {
          url: '/uploads/test/test-image-1.jpg',
          caption: 'Test Image 1',
          isMain: true,
          uploadedAt: new Date().toISOString()
        },
        {
          url: '/uploads/test/test-image-2.jpg',
          caption: 'Test Image 2',
          isMain: false,
          uploadedAt: new Date().toISOString()
        }
      ]
    };

    console.log('📊 Venue data being sent:', {
      name: venueData.name,
      imagesCount: venueData.images.length,
      images: venueData.images
    });

    const createVenueResponse = await fetch(`${API_BASE}/api/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      },
      body: JSON.stringify(venueData)
    });

    console.log('📡 Create venue response status:', createVenueResponse.status);

    if (!createVenueResponse.ok) {
      const errorData = await createVenueResponse.json();
      console.error('❌ Venue creation failed:', errorData);
      throw new Error(`Venue creation failed: ${errorData.message}`);
    }

    const venueResult = await createVenueResponse.json();
    console.log('✅ Venue created successfully!');
    console.log('📊 Venue ID:', venueResult.data._id);
    console.log('📊 Venue Images in response:', venueResult.data.images?.length || 0);

    if (venueResult.data.images && venueResult.data.images.length > 0) {
      console.log('📸 Images in created venue:');
      venueResult.data.images.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.url} (${img.caption}) - Main: ${img.isMain}`);
      });
    } else {
      console.log('⚠️ No images found in created venue');
    }

    // Step 3: Verify venue retrieval
    console.log('\n🔍 Step 3: Verifying venue retrieval...');
    
    const getVenueResponse = await fetch(`${API_BASE}/api/venues/${venueResult.data._id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      }
    });

    if (getVenueResponse.ok) {
      const venueData = await getVenueResponse.json();
      console.log('✅ Venue retrieved successfully!');
      console.log('📊 Venue name:', venueData.data.name);
      console.log('📊 Images count in retrieval:', venueData.data.images?.length || 0);
      
      if (venueData.data.images && venueData.data.images.length > 0) {
        console.log('📸 Images in retrieved venue:');
        venueData.data.images.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img.url} (${img.caption}) - Main: ${img.isMain}`);
        });
      } else {
        console.log('⚠️ No images found in retrieved venue');
      }
    } else {
      console.error('❌ Venue retrieval failed:', getVenueResponse.status);
    }

    console.log('\n🎉 DIRECT UPLOAD TEST COMPLETED!');
    
    if (venueResult.data.images && venueResult.data.images.length > 0) {
      console.log('✅ Images are being saved correctly!');
    } else {
      console.log('❌ Images are NOT being saved!');
    }

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testDirectUpload(); 
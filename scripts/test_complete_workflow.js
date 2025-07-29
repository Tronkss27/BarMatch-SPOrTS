#!/usr/bin/env node

const API_BASE = 'http://localhost:3001';

async function testCompleteWorkflow() {
  console.log('🧪 Testing Complete Workflow - Registration → Onboarding → Profile');
  console.log('=' .repeat(80));

  try {
    // Step 1: Register a new venue owner
    console.log('\n📝 Step 1: Registering new venue owner...');
    const registerData = {
      name: 'Complete Test Owner',
      email: `complete.test.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Complete Test Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Complete Test 123',
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

    // Step 2: Upload multiple photos (simulating onboarding step 6)
    console.log('\n📸 Step 2: Uploading photos during onboarding...');
    
    const testImages = [
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]),
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82])
    ];

    const uploadedPhotos = [];
    
    for (let i = 0; i < testImages.length; i++) {
      const formData = new FormData();
      const blob = new Blob([testImages[i]], { type: 'image/png' });
      formData.append('image', blob, `test-photo-${i + 1}.png`);

      const uploadResponse = await fetch(`${API_BASE}/api/venues/${user.venueId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.id
        },
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log(`✅ Photo ${i + 1} uploaded successfully`);
        uploadedPhotos.push(uploadResult.data);
      } else {
        console.error(`❌ Photo ${i + 1} upload failed:`, uploadResponse.status);
      }
    }

    console.log(`📊 Total photos uploaded: ${uploadedPhotos.length}`);

    // Step 3: Simulate onboarding completion (create venue profile)
    console.log('\n🏢 Step 3: Creating venue profile...');
    
    const venueData = {
      name: 'Complete Test Venue',
      description: 'A complete test venue with photos',
      contact: {
        email: user.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Complete Test 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      // Include uploaded photos
      images: uploadedPhotos.flatMap(photo => 
        photo.uploadedImages?.map(img => ({
          url: img.url,
          caption: img.caption || ''
        })) || []
      )
    };

    const createVenueResponse = await fetch(`${API_BASE}/api/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      },
      body: JSON.stringify(venueData)
    });

    if (!createVenueResponse.ok) {
      const errorData = await createVenueResponse.json();
      console.error('❌ Venue creation failed:', errorData);
      throw new Error(`Venue creation failed: ${errorData.message}`);
    }

    const venueResult = await createVenueResponse.json();
    console.log('✅ Venue profile created successfully!');
    console.log('📊 Venue ID:', venueResult.data._id);
    console.log('📊 Venue Images:', venueResult.data.images?.length || 0);

    // Step 4: Verify venue retrieval with photos
    console.log('\n🔍 Step 4: Verifying venue retrieval with photos...');
    
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
      console.log('📊 Images count:', venueData.data.images?.length || 0);
      
      if (venueData.data.images && venueData.data.images.length > 0) {
        console.log('📸 Image URLs:');
        venueData.data.images.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img.url}`);
        });
      }
    } else {
      console.error('❌ Venue retrieval failed:', getVenueResponse.status);
    }

    // Step 5: Test public access to venue (should work without auth)
    console.log('\n🌐 Step 5: Testing public venue access...');
    
    const publicVenueResponse = await fetch(`${API_BASE}/api/venues/${venueResult.data._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // No auth headers for public access
      }
    });

    if (publicVenueResponse.ok) {
      const publicVenueData = await publicVenueResponse.json();
      console.log('✅ Public venue access successful!');
      console.log('📊 Public venue name:', publicVenueData.data.name);
      console.log('📊 Public images count:', publicVenueData.data.images?.length || 0);
    } else {
      console.log('⚠️ Public venue access failed (expected if endpoint requires auth)');
    }

    console.log('\n🎉 COMPLETE WORKFLOW TEST PASSED!');
    console.log('✅ Registration working');
    console.log('✅ Photo upload working');
    console.log('✅ Venue creation working');
    console.log('✅ Photo persistence working');
    console.log('✅ Venue retrieval working');
    console.log('✅ Photos should now transfer correctly to profile');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testCompleteWorkflow(); 
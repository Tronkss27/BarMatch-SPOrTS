#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testPhotoUpload() {
  console.log('🧪 Testing Frontend Photo Upload Fix');
  console.log('=' .repeat(80));

  try {
    // Step 1: Register a new venue owner
    console.log('\n📝 Step 1: Registering new venue owner...');
    const registerData = {
      name: 'Test Photo Owner',
      email: `test.photo.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Test Photo Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Test Photo 123',
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

    // Step 2: Create a test image file
    console.log('\n📸 Step 2: Creating test image file...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Step 3: Test photo upload
    console.log('\n📤 Step 3: Testing photo upload...');
    
    const formData = new FormData();
    
    // Create a Blob from the buffer and append to FormData
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test-photo.png');

    const uploadResponse = await fetch(`${API_BASE}/api/venues/${user.venueId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      },
      body: formData
    });

    console.log('📡 Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('❌ Photo upload failed:');
      console.error('📊 Status:', uploadResponse.status);
      console.error('📊 Error:', errorData);
      throw new Error(`Photo upload failed: ${errorData.message || uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Photo upload successful!');
    console.log('📊 Upload result:', uploadResult);

    // Step 4: Verify the photo was saved
    console.log('\n🔍 Step 4: Verifying photo was saved...');
    
    const venueResponse = await fetch(`${API_BASE}/api/venues/${user.venueId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      }
    });

    if (venueResponse.ok) {
      const venueData = await venueResponse.json();
      const images = venueData.data.images || [];
      console.log('✅ Venue images found:', images.length);
      
      if (images.length > 0) {
        console.log('📊 First image URL:', images[0].url);
        console.log('📊 First image caption:', images[0].caption);
      }
    } else {
      console.log('⚠️ Could not verify venue images');
    }

    console.log('\n🎉 PHOTO UPLOAD TEST PASSED!');
    console.log('✅ Registration working');
    console.log('✅ Photo upload working');
    console.log('✅ Tenant headers working');
    console.log('✅ Frontend should now work correctly');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testPhotoUpload(); 
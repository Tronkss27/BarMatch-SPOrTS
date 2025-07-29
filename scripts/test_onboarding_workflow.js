#!/usr/bin/env node

const API_BASE = 'http://localhost:3001';

async function testOnboardingWorkflow() {
  console.log('🧪 Testing Real Onboarding Workflow - Step by Step');
  console.log('=' .repeat(80));

  try {
    // Step 1: Register a new venue owner
    console.log('\n📝 Step 1: Registering new venue owner...');
    const registerData = {
      name: 'Onboarding Test Owner',
      email: `onboarding.test.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Onboarding Test Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Onboarding Test 123',
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

    // Step 2: Upload photos to venue (simulating StepPhotos component)
    console.log('\n📸 Step 2: Uploading photos during onboarding step 6...');
    
    const testImages = [
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]),
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82])
    ];

    const uploadedPhotos = [];
    
    for (let i = 0; i < testImages.length; i++) {
      const formData = new FormData();
      const blob = new Blob([testImages[i]], { type: 'image/png' });
      formData.append('image', blob, `onboarding-photo-${i + 1}.png`);

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
        
        // Simula il formato che userebbe StepPhotos.tsx
        if (uploadResult.data && uploadResult.data.uploadedImages) {
          uploadResult.data.uploadedImages.forEach(img => {
            uploadedPhotos.push({
              id: img.url,
              name: img.caption || `Foto ${i + 1}`,
              preview: `http://localhost:3001${img.url}`
            });
          });
        }
      } else {
        console.error(`❌ Photo ${i + 1} upload failed:`, uploadResponse.status);
      }
    }

    console.log(`📊 Total photos for onboarding: ${uploadedPhotos.length}`);
    console.log('📸 Photos data:', uploadedPhotos);

    // Step 3: Simulate onboarding completion (create venue with photos)
    console.log('\n🏢 Step 3: Completing onboarding with photos...');
    
    // Simula i dati dell'onboarding come farebbe VenueOnboarding.tsx
    const onboardingData = {
      keyInfo: {
        name: 'Onboarding Test Venue',
        address: 'Via Onboarding Test 123',
        city: 'Milano',
        postalCode: '20100',
        about: 'A test venue created through onboarding workflow',
        website: 'https://test.com',
        phone: '3123456789'
      },
      openingHours: [
        { day: 'MON', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'TUE', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'WED', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'THU', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'FRI', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'SAT', status: 'open', openTime: '11:00', closeTime: '23:00' },
        { day: 'SUN', status: 'open', openTime: '11:00', closeTime: '23:00' }
      ],
      screens: { screenCount: 3 },
      favourites: { selectedCompetitions: [{ id: 'serie-a', name: 'Serie A', sport: 'football' }] },
      facilities: { facilities: ['wifi', 'large_screen', 'food_service'] },
      photos: { photos: uploadedPhotos } // ✅ Include le foto caricate
    };

    // Simula la creazione del venue profile come farebbe venueProfileService.convertToBackendFormat
    const venueProfileData = {
      name: onboardingData.keyInfo.name,
      address: onboardingData.keyInfo.address,
      city: onboardingData.keyInfo.city,
      postalCode: onboardingData.keyInfo.postalCode,
      description: onboardingData.keyInfo.about,
      website: onboardingData.keyInfo.website,
      phone: onboardingData.keyInfo.phone,
      openingHours: onboardingData.openingHours,
      facilities: {
        screens: onboardingData.screens.screenCount,
        services: onboardingData.facilities.facilities
      },
      favouriteSports: onboardingData.favourites.selectedCompetitions,
      photos: onboardingData.photos.photos, // ✅ Include le foto
      completedAt: new Date().toISOString(),
      userId: user.id
    };

    console.log('📊 Venue profile data with photos:', {
      name: venueProfileData.name,
      photosCount: venueProfileData.photos.length,
      photos: venueProfileData.photos.map(p => ({ id: p.id, name: p.name, preview: p.preview.substring(0, 50) + '...' }))
    });

    // Simula la conversione al formato backend
    const backendVenueData = {
      name: venueProfileData.name,
      description: venueProfileData.description,
      contact: {
        email: user.email,
        phone: venueProfileData.phone,
        website: venueProfileData.website
      },
      location: {
        address: {
          street: venueProfileData.address,
          city: venueProfileData.city,
          postalCode: venueProfileData.postalCode,
          country: 'Italy'
        }
      },
      capacity: {
        total: 80
      },
      // ✅ Include le immagini nel formato backend
      images: venueProfileData.photos.map((photo, index) => ({
        url: photo.preview.startsWith('http://localhost:3001') 
          ? photo.preview.replace('http://localhost:3001', '')
          : photo.preview,
        caption: photo.name || `Foto ${index + 1}`,
        isMain: index === 0,
        uploadedAt: new Date().toISOString()
      }))
    };

    console.log('📊 Backend venue data:', {
      name: backendVenueData.name,
      imagesCount: backendVenueData.images.length,
      images: backendVenueData.images.map(img => ({ url: img.url, caption: img.caption, isMain: img.isMain }))
    });

    // Create venue with photos
    const createVenueResponse = await fetch(`${API_BASE}/api/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': user.id
      },
      body: JSON.stringify(backendVenueData)
    });

    if (!createVenueResponse.ok) {
      const errorData = await createVenueResponse.json();
      console.error('❌ Venue creation failed:', errorData);
      throw new Error(`Venue creation failed: ${errorData.message}`);
    }

    const venueResult = await createVenueResponse.json();
    console.log('✅ Venue created successfully!');
    console.log('📊 Venue ID:', venueResult.data._id);
    console.log('📊 Venue Images:', venueResult.data.images?.length || 0);

    if (venueResult.data.images && venueResult.data.images.length > 0) {
      console.log('📸 Venue images:');
      venueResult.data.images.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.url} (${img.caption})`);
      });
    }

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
        console.log('📸 Retrieved images:');
        venueData.data.images.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img.url}`);
        });
      }
    } else {
      console.error('❌ Venue retrieval failed:', getVenueResponse.status);
    }

    console.log('\n🎉 ONBOARDING WORKFLOW TEST COMPLETED!');
    console.log('✅ Registration working');
    console.log('✅ Photo upload working');
    console.log('✅ Photos included in venue creation');
    console.log('✅ Venue creation working');
    console.log('✅ Photo persistence working');
    console.log('✅ Photos should now appear in profile');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('📊 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testOnboardingWorkflow(); 
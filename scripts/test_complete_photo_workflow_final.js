#!/usr/bin/env node

/**
 * Test Completo Workflow Foto - Versione Finale
 * Verifica upload, visualizzazione e cancellazione foto con URL assoluti
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

// Dati di test
const TEST_USER = {
  email: 'iqosss@example.com',
  password: 'Password123!',
  venueId: '687532b583e5032d1c8ed9ba', // ID venue di test
  tenantId: '6875322f83e5032d1c8ed90b'
};

async function runCompletePhotoTest() {
  console.log('🚀 Starting Complete Photo Workflow Test...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      headers: {
        'X-Tenant-ID': TEST_USER.tenantId
      }
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get venue before upload
    console.log('\n2️⃣ Getting venue data before upload...');
    const beforeResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TEST_USER.tenantId
      }
    });

    const initialImageCount = beforeResponse.data.venue?.images?.length || 0;
    console.log(`📊 Initial image count: ${initialImageCount}`);

    // Step 3: Upload test image
    console.log('\n3️⃣ Testing photo upload...');
    
    // Create a test file
    const testImagePath = path.join(__dirname, '..', 'frontend', 'public', 'placeholder.svg');
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(
      `${API_BASE}/api/venues/${TEST_USER.venueId}/images`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': TEST_USER.tenantId
        }
      }
    );

    console.log('✅ Upload successful');
    console.log('📸 Upload response:', {
      success: uploadResponse.data.success,
      imageCount: uploadResponse.data.uploadedImages?.length,
      firstImageUrl: uploadResponse.data.uploadedImages?.[0]?.url
    });

    // Step 4: Verify image URLs are correct
    console.log('\n4️⃣ Verifying image URLs...');
    const afterUploadResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TEST_USER.tenantId
      }
    });

    const venueImages = afterUploadResponse.data.venue?.images || [];
    console.log(`📊 Total images after upload: ${venueImages.length}`);
    
    // Test URL accessibility
    for (let i = 0; i < venueImages.length; i++) {
      const img = venueImages[i];
      const imageUrl = typeof img === 'string' ? img : img.url;
      
      try {
        // Costruisci URL completo se relativo
        let fullUrl = imageUrl;
        if (imageUrl.startsWith('/uploads/')) {
          fullUrl = `${API_BASE}${imageUrl}`;
        }
        
        const imageResponse = await axios.head(fullUrl);
        console.log(`✅ Image ${i+1} accessible: ${fullUrl} (${imageResponse.status})`);
      } catch (error) {
        console.log(`❌ Image ${i+1} NOT accessible: ${imageUrl} (${error.response?.status || 'NETWORK_ERROR'})`);
      }
    }

    // Step 5: Test public page access
    console.log('\n5️⃣ Testing public page access...');
    const publicResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'X-Tenant-ID': TEST_USER.tenantId
      }
    });

    console.log('✅ Public access successful');
    console.log('📊 Public page images:', {
      imageCount: publicResponse.data.venue?.images?.length || 0,
      hasVenueField: !!publicResponse.data.venue,
      hasDataField: !!publicResponse.data.data
    });

    // Step 6: Test photo deletion
    if (venueImages.length > initialImageCount) {
      console.log('\n6️⃣ Testing photo deletion...');
      
      const imageToDelete = venueImages[venueImages.length - 1]; // Ultima immagine
      const imageUrl = typeof imageToDelete === 'string' ? imageToDelete : imageToDelete.url;
      
      // Assicurati che sia un URL relativo per la cancellazione
      let relativeUrl = imageUrl;
      if (imageUrl.includes('/uploads/')) {
        const urlParts = imageUrl.split('/uploads/');
        if (urlParts.length > 1) {
          relativeUrl = '/uploads/' + urlParts[1];
        }
      }
      
      console.log(`🗑️ Deleting image: ${relativeUrl}`);
      
      const deleteResponse = await axios.delete(`${API_BASE}/api/venues/${TEST_USER.venueId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': TEST_USER.tenantId,
          'Content-Type': 'application/json'
        },
        data: {
          imageUrl: relativeUrl
        }
      });

      console.log('✅ Delete successful');
      console.log('📊 Remaining images:', deleteResponse.data.venue?.images?.length || 0);
    }

    console.log('\n🎉 Complete Photo Workflow Test PASSED! 🎉');

  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
    if (error.response) {
      console.error('📄 Response data:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
    process.exit(1);
  }
}

// Esegui il test
runCompletePhotoTest(); 
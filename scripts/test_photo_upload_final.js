const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

// Test completo del workflow foto
async function testPhotoWorkflow() {
  console.log('🧪 Testing complete photo workflow...\n');

  try {
    // 1. Test upload foto
    console.log('1️⃣ Testing photo upload...');
    
    const venueId = '68741ba6e80c6b63cab1fd57';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzQxYjcxZTgwYzZiNjNjYWIxZmQxMiIsImlhdCI6MTc1MjQzOTY2NiwiZXhwIjoxNzU1MDMxNjY2fQ.yiZ5m2uOFIXksddKEiBKZowiO0YPUYlrepmn6c4s470';
    const tenantId = '68741b71e80c6b63cab1fd12';

    // Crea un'immagine di test semplice (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xCC, 0x5E, 0xB3, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-photo.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/venues/${venueId}/images`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      }
    );

    console.log('✅ Upload Response:', {
      status: uploadResponse.status,
      uploadedImages: uploadResponse.data.uploadedImages?.length || 0,
      firstImage: uploadResponse.data.uploadedImages?.[0]?.url || 'N/A'
    });

    // 2. Test recupero venue pubblico per verificare le foto
    console.log('\n2️⃣ Testing public venue photo retrieval...');
    
    const publicResponse = await axios.get(`${BASE_URL}/api/venues/${venueId}`);
    
    console.log('✅ Public venue response:', {
      status: publicResponse.status,
      venueName: publicResponse.data.venue?.name || 'N/A',
      imagesCount: publicResponse.data.venue?.images?.length || 0,
      images: publicResponse.data.venue?.images || []
    });

    // 3. Test conversione frontend
    console.log('\n3️⃣ Testing frontend data conversion...');
    
    const venueData = publicResponse.data.venue;
    if (venueData && venueData.images) {
      console.log('📸 Raw backend images:', venueData.images);
      
      // Simula la conversione che fa il frontend
      const convertedImages = venueData.images
        .map(img => {
          if (typeof img === 'string') {
            return img.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
          }
          return img?.url ? img.url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&') : '';
        })
        .filter(url => url && url !== 'undefined');
      
      console.log('🔄 Frontend converted images:', convertedImages);
      
      // Test se gli URL sono accessibili
      for (const imageUrl of convertedImages.slice(0, 2)) { // Testa solo le prime 2
        try {
          const imageResponse = await axios.head(`http://localhost:3001${imageUrl}`);
          console.log(`✅ Image accessible: ${imageUrl} (${imageResponse.status})`);
        } catch (error) {
          console.log(`❌ Image not accessible: ${imageUrl} (${error.response?.status || error.message})`);
        }
      }
    }

    // 4. Test eliminazione foto (se abbiamo foto da eliminare)
    if (uploadResponse.data.uploadedImages && uploadResponse.data.uploadedImages.length > 0) {
      console.log('\n4️⃣ Testing photo deletion...');
      
      const imageToDelete = uploadResponse.data.uploadedImages[0].url;
      console.log('🗑️ Attempting to delete:', imageToDelete);
      
      try {
        const deleteResponse = await axios.delete(
          `${BASE_URL}/api/venues/${venueId}/images`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-ID': tenantId,
              'Content-Type': 'application/json'
            },
            data: { imageUrl: imageToDelete }
          }
        );
        
        console.log('✅ Delete Response:', {
          status: deleteResponse.status,
          message: deleteResponse.data.message || 'Success'
        });
      } catch (error) {
        console.log('❌ Delete Error:', {
          status: error.response?.status || 'N/A',
          message: error.response?.data?.message || error.message
        });
      }
    }

    console.log('\n🎉 Photo workflow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Esegui il test
testPhotoWorkflow(); 
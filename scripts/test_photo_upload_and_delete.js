const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';
const VENUE_ID = '68741ba6e80c6b63cab1fd57';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzQxYjcxZTgwYzZiNjNjYWIxZmQxMiIsImlhdCI6MTc1MjQzOTY2NiwiZXhwIjoxNzU1MDMxNjY2fQ.yiZ5m2uOFIXksddKEiBKZowiO0YPUYlrepmn6c4s470';
const TENANT_ID = '68741b71e80c6b63cab1fd12';

const config = {
  headers: {
    'Authorization': `Bearer ${USER_TOKEN}`,
    'X-Tenant-ID': TENANT_ID
  }
};

async function testUploadAndDelete() {
  console.log('🧪 TESTING UPLOAD E DELETE FOTO REALI');
  console.log('======================================');

  try {
    // 1. Crea un file immagine di test
    console.log('\n1️⃣ Creazione file immagine di test...');
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Crea un file PNG minimale (1x1 pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ File immagine di test creato');

    // 2. Upload dell'immagine
    console.log('\n2️⃣ Upload immagine...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(`${BASE_URL}/venues/${VENUE_ID}/images`, formData, {
      headers: {
        ...config.headers,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Upload riuscito:', uploadResponse.data);
    const uploadedImageUrl = uploadResponse.data.data.uploadedImages[0].url;
    console.log('📸 URL immagine caricata:', uploadedImageUrl);

    // 3. Verifica che l'immagine sia nel venue
    console.log('\n3️⃣ Verifica immagine nel venue...');
    const venueResponse = await axios.get(`${BASE_URL}/venues/${VENUE_ID}`, config);
    const currentImages = venueResponse.data.images || [];
    console.log(`📸 Immagini totali nel venue: ${currentImages.length}`);
    
    const imageExists = currentImages.includes(uploadedImageUrl);
    console.log(`✅ Immagine trovata nel venue: ${imageExists}`);

    // 4. Test cancellazione con URL corretto
    console.log('\n4️⃣ Test cancellazione immagine...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/venues/${VENUE_ID}/images`, {
        headers: config.headers,
        data: { imageUrl: uploadedImageUrl }
      });
      
      console.log('✅ Cancellazione riuscita:', deleteResponse.data);
      
      // 5. Verifica che sia stata rimossa
      console.log('\n5️⃣ Verifica rimozione...');
      const updatedVenueResponse = await axios.get(`${BASE_URL}/venues/${VENUE_ID}`, config);
      const updatedImages = updatedVenueResponse.data.images || [];
      console.log(`📸 Immagini dopo cancellazione: ${updatedImages.length}`);
      
      const imageStillExists = updatedImages.includes(uploadedImageUrl);
      console.log(`✅ Immagine rimossa: ${!imageStillExists}`);
      
      if (!imageStillExists) {
        console.log('🎉 CANCELLAZIONE VERIFICATA CON SUCCESSO!');
      } else {
        console.log('❌ ERRORE: Immagine ancora presente dopo cancellazione');
      }
      
    } catch (deleteError) {
      console.error('❌ Errore cancellazione:', deleteError.response?.data || deleteError.message);
    }

    // 6. Cleanup
    console.log('\n6️⃣ Cleanup...');
    fs.unlinkSync(testImagePath);
    console.log('✅ File di test rimosso');

    console.log('\n🎉 Test completo terminato!');

  } catch (error) {
    console.error('❌ Errore generale:', error.response?.data || error.message);
  }
}

// Esegui il test
testUploadAndDelete(); 
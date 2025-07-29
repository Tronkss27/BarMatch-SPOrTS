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

async function testPhotoDisplay() {
  console.log('🧪 TESTING VISUALIZZAZIONE FOTO DOPO CORREZIONI');
  console.log('================================================');

  try {
    // 1. Upload una foto di test
    console.log('\n1️⃣ Upload foto di test...');
    const testImagePath = path.join(__dirname, 'test-display.png');
    
    // Crea un file PNG minimale
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, pngData);

    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(`${BASE_URL}/venues/${VENUE_ID}/images`, formData, {
      headers: {
        ...config.headers,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Upload riuscito');
    console.log('📸 Struttura risposta upload:', JSON.stringify(uploadResponse.data, null, 2));

    // 2. Test API pubblica del venue
    console.log('\n2️⃣ Test API pubblica venue...');
    const publicResponse = await axios.get(`${BASE_URL}/venues/${VENUE_ID}`);
    
    console.log('✅ API pubblica risposta ricevuta');
    const venueData = publicResponse.data.data; // Accesso corretto ai dati
    console.log('📸 Immagini nel venue (backend):', venueData.images);
    console.log('🔍 Tipo delle immagini:', typeof venueData.images);
    console.log('🔍 Lunghezza array immagini:', venueData.images?.length || 0);
    
    if (venueData.images && venueData.images.length > 0) {
      console.log('🔍 Prima immagine:', venueData.images[0]);
      console.log('🔍 Tipo prima immagine:', typeof venueData.images[0]);
    }

    // 3. Test conversione frontend
    console.log('\n3️⃣ Test conversione frontend...');
    
    // Simula la conversione che farebbe venuesService.convertBackendVenueToLegacy
    const backendVenue = venueData;
    const convertedImages = (backendVenue.images || [])
      .map(img => img.url ? img.url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&') : '')
      .filter(url => url);
    
    console.log('✅ Conversione frontend simulata');
    console.log('📸 Immagini convertite:', convertedImages);
    console.log('🔍 Tipo array convertito:', typeof convertedImages);
    console.log('🔍 Lunghezza array convertito:', convertedImages.length);
    
    if (convertedImages.length > 0) {
      console.log('🔍 Prima immagine convertita:', convertedImages[0]);
      console.log('🔍 Tipo prima immagine convertita:', typeof convertedImages[0]);
    }

    // 4. Cleanup
    console.log('\n4️⃣ Cleanup...');
    fs.unlinkSync(testImagePath);
    console.log('✅ File di test rimosso');

    console.log('\n🎉 Test visualizzazione foto completato!');
    console.log('\n📋 RISULTATI:');
    console.log(`   - Upload funziona: ✅`);
    console.log(`   - API pubblica restituisce immagini: ${venueData.images?.length > 0 ? '✅' : '❌'}`);
    console.log(`   - Conversione frontend corretta: ${convertedImages.length > 0 && typeof convertedImages[0] === 'string' ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Errore nel test:', error.response?.data || error.message);
  }
}

// Esegui il test
testPhotoDisplay(); 
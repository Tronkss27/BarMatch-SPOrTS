const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

console.log('🧪 Test Upload Foto - SPOrTS Platform');
console.log('=====================================');

async function testPhotoUpload() {
  try {
    console.log('\n1. 🔐 Registrazione utente venue owner...');
    
    // Registrazione
    const timestamp = Date.now();
    const registerData = {
      name: 'Test Photo Venue',
      email: `photovenue${timestamp}@test.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Photo Test Bar',
        businessAddress: 'Via Photo 123',
        businessCity: 'Milano',
        businessPhone: '1234567890'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, registerData);
    
    if (!registerResponse.data.success) {
      throw new Error('Registrazione fallita: ' + registerResponse.data.message);
    }

    const { token, user } = registerResponse.data;
    console.log(`✅ Utente registrato: ${user.name} (ID: ${user.id})`);
    console.log(`🏟️ Venue ID: ${user.venueId}`);

    // Headers per autenticazione
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': user.id // Usa l'ID utente come tenant ID
    };

    console.log(`🔍 Auth headers:`, {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'X-Tenant-ID': user.id
    });

    console.log('\n2. 📸 Test upload foto...');

    // Crea un file di test (immagine placeholder)
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'Test image content for photo upload');

    // Prepara FormData
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-venue.jpg',
      contentType: 'image/jpeg'
    });

    try {
      const uploadResponse = await axios.post(
        `${API_BASE}/api/venues/${user.venueId}/images`,
        formData,
        {
          headers: {
            ...authHeaders,
            ...formData.getHeaders()
          }
        }
      );

      console.log('✅ Upload completato con successo!');
      console.log('📊 Risposta server:', JSON.stringify(uploadResponse.data, null, 2));

    } catch (uploadError) {
      console.error('❌ Errore upload:', uploadError.response?.data || uploadError.message);
    }

    // Pulisci file di test
    fs.unlinkSync(testImagePath);

    console.log('\n3. 🔍 Verifica venue con immagini...');
    
    const venueResponse = await axios.get(`${API_BASE}/api/venues/${user.venueId}`, {
      headers: authHeaders
    });

    if (venueResponse.data.success) {
      const venue = venueResponse.data.data;
      console.log(`✅ Venue trovato: ${venue.name}`);
      console.log(`📸 Numero immagini: ${venue.images?.length || 0}`);
      
      if (venue.images?.length > 0) {
        console.log('🖼️ Immagini caricate:');
        venue.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.url} (Principale: ${img.isMain ? 'Sì' : 'No'})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Errore generale:', error.response?.data || error.message);
  }
}

// Avvia test
testPhotoUpload(); 
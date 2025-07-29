const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const VENUE_ID = '68741ba6e80c6b63cab1fd57';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzQxYjcxZTgwYzZiNjNjYWIxZmQxMiIsImlhdCI6MTc1MjQzOTY2NiwiZXhwIjoxNzU1MDMxNjY2fQ.yiZ5m2uOFIXksddKEiBKZowiO0YPUYlrepmn6c4s470';
const TENANT_ID = '68741b71e80c6b63cab1fd12';

const config = {
  headers: {
    'Authorization': `Bearer ${USER_TOKEN}`,
    'X-Tenant-ID': TENANT_ID,
    'Content-Type': 'application/json'
  }
};

async function testPhotoWorkflow() {
  console.log('🧪 TESTING PHOTO WORKFLOW COMPLETO');
  console.log('=====================================');

  try {
    // 1. Prima ottieni lo stato attuale del venue
    console.log('\n1️⃣ Ottengo stato attuale venue...');
    const venueResponse = await axios.get(`${BASE_URL}/venues/${VENUE_ID}`, config);
    const currentImages = venueResponse.data.images || [];
    
    console.log(`✅ Venue trovato: ${venueResponse.data.name}`);
    console.log(`📸 Immagini attuali: ${currentImages.length}`);
    currentImages.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });

    // 2. Se ci sono immagini, testiamo la cancellazione
    if (currentImages.length > 0) {
      console.log('\n2️⃣ Test cancellazione foto...');
      const imageToDelete = currentImages[currentImages.length - 1]; // Ultima immagine
      
      try {
        const deleteResponse = await axios.delete(`${BASE_URL}/venues/${VENUE_ID}/images`, {
          headers: config.headers,
          data: { imageUrl: imageToDelete }
        });
        
        console.log('✅ Cancellazione riuscita:', deleteResponse.data.message);
        
        // Verifica che sia stata effettivamente rimossa
        const updatedVenueResponse = await axios.get(`${BASE_URL}/venues/${VENUE_ID}`, config);
        const updatedImages = updatedVenueResponse.data.images || [];
        console.log(`📸 Immagini dopo cancellazione: ${updatedImages.length}`);
        
        if (updatedImages.length === currentImages.length - 1) {
          console.log('✅ Cancellazione verificata - numero immagini ridotto');
        } else {
          console.log('❌ Cancellazione non verificata - numero immagini invariato');
        }
        
      } catch (deleteError) {
        console.error('❌ Errore cancellazione:', deleteError.response?.data || deleteError.message);
      }
    } else {
      console.log('\n2️⃣ Nessuna immagine da cancellare');
    }

    // 3. Test update venue con immagini filtrate
    console.log('\n3️⃣ Test update venue con filtro immagini...');
    
    const updateData = {
      name: venueResponse.data.name,
      description: venueResponse.data.description || 'Test description',
      location: venueResponse.data.location,
      contact: venueResponse.data.contact,
      capacity: venueResponse.data.capacity,
      // Simula array con alcune immagini undefined/null
      images: [
        { url: '/test/valid-image.jpg', isMain: true },
        { url: undefined, isMain: false }, // Questo dovrebbe essere filtrato
        { url: null, isMain: false }, // Questo dovrebbe essere filtrato  
        { url: '/test/another-valid.jpg', isMain: false }
      ].filter(img => img && img.url), // Applica lo stesso filtro del frontend
      hours: venueResponse.data.hours,
      facilities: venueResponse.data.facilities
    };

    try {
      const updateResponse = await axios.put(`${BASE_URL}/venues/${VENUE_ID}`, updateData, config);
      console.log('✅ Update venue riuscito');
      console.log(`📸 Immagini nel payload: ${updateData.images.length}`);
      
    } catch (updateError) {
      console.error('❌ Errore update venue:', updateError.response?.data || updateError.message);
    }

    console.log('\n🎉 Test workflow foto completato!');

  } catch (error) {
    console.error('❌ Errore generale:', error.response?.data || error.message);
  }
}

// Esegui il test
testPhotoWorkflow(); 
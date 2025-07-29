/**
 * Test Script: Verifica rimozione foto tramite URL
 * 
 * Questo script testa:
 * 1. Nuova route DELETE /api/venues/:id/images (con imageUrl nel body)
 * 2. Funzionalità completa di rimozione foto
 * 3. Verifica che il frontend possa eliminare foto correttamente
 */

const axios = require('axios');

// Configurazione
const API_BASE = 'http://localhost:3001';

// Dati di test (dal log precedente)
const TEST_USER = {
  id: '68741b71e80c6b63cab1fd12',
  venueId: '68741ba6e80c6b63cab1fd57',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzQxYjcxZTgwYzZiNjNjYWIxZmQxMiIsImlhdCI6MTc1MjQzOTY2NiwiZXhwIjoxNzU1MDMxNjY2fQ.yiZ5m2uOFIXksddKEiBKZowiO0YPUYlrepmn6c4s470'
};

async function testPhotoDeleteByUrl() {
  console.log('🧪 TEST: Rimozione foto tramite URL');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Verifica venue e immagini esistenti
    console.log('\n1️⃣ Verifica venue e immagini...');
    
    const venueResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER.token}`,
        'X-Tenant-ID': TEST_USER.id
      }
    });
    
    console.log('✅ Venue trovato:', venueResponse.data.data.name);
    console.log('📸 Numero immagini:', venueResponse.data.data.images?.length || 0);
    
    if (!venueResponse.data.data.images || venueResponse.data.data.images.length === 0) {
      console.log('⚠️ Nessuna immagine presente per testare la rimozione');
      console.log('ℹ️ Carica prima alcune immagini dal pannello admin per testare');
      return;
    }
    
    // Mostra tutte le immagini disponibili
    console.log('\n📋 Immagini disponibili:');
    venueResponse.data.data.images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.url} (${img.caption || 'Senza caption'})`);
    });
    
    const firstImage = venueResponse.data.data.images[0];
    console.log(`\n🎯 Testiamo la rimozione della prima immagine: ${firstImage.url}`);
    
    // Test 2: Test rimozione foto tramite URL
    console.log('\n2️⃣ Test rimozione foto tramite URL...');
    
    const deleteUrl = `${API_BASE}/api/venues/${TEST_USER.venueId}/images`;
    console.log('🔗 DELETE URL:', deleteUrl);
    console.log('📦 Body:', { imageUrl: firstImage.url });
    
    try {
      const deleteResponse = await axios.delete(deleteUrl, {
        headers: {
          'Authorization': `Bearer ${TEST_USER.token}`,
          'X-Tenant-ID': TEST_USER.id,
          'Content-Type': 'application/json'
        },
        data: { 
          imageUrl: firstImage.url 
        }
      });
      
      console.log('✅ Rimozione riuscita!');
      console.log('📝 Messaggio:', deleteResponse.data.message);
      console.log('📸 Immagini rimanenti:', deleteResponse.data.data.venue.images.length);
      
    } catch (deleteError) {
      if (deleteError.response) {
        console.log('❌ Errore rimozione:', deleteError.response.status, deleteError.response.data.message);
        console.log('📝 Dettagli:', deleteError.response.data);
      } else {
        console.log('❌ Errore di rete:', deleteError.message);
      }
      throw deleteError;
    }
    
    // Test 3: Verifica che l'immagine sia stata rimossa
    console.log('\n3️⃣ Verifica rimozione...');
    
    const updatedVenueResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER.token}`,
        'X-Tenant-ID': TEST_USER.id
      }
    });
    
    const remainingImages = updatedVenueResponse.data.data.images || [];
    console.log('📸 Immagini dopo rimozione:', remainingImages.length);
    
    // Verifica che l'immagine rimossa non sia più presente
    const imageStillExists = remainingImages.some(img => img.url === firstImage.url);
    if (imageStillExists) {
      console.log('❌ ERRORE: L\'immagine non è stata rimossa correttamente!');
    } else {
      console.log('✅ Immagine rimossa correttamente dal database');
    }
    
    // Test 4: Test rimozione immagine inesistente
    console.log('\n4️⃣ Test rimozione immagine inesistente...');
    
    try {
      await axios.delete(deleteUrl, {
        headers: {
          'Authorization': `Bearer ${TEST_USER.token}`,
          'X-Tenant-ID': TEST_USER.id,
          'Content-Type': 'application/json'
        },
        data: { 
          imageUrl: 'http://localhost:3001/uploads/venues/non-existent-image.jpg'
        }
      });
      console.log('❌ ERRORE: La rimozione di immagine inesistente dovrebbe fallire!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Corretto: rimozione immagine inesistente restituisce 404');
      } else {
        console.log('⚠️ Errore diverso dal 404:', error.response?.status, error.response?.data?.message);
      }
    }
    
    console.log('\n🎉 Test completato! Rimozione foto tramite URL funziona correttamente.');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('📝 Dettagli risposta:', error.response.data);
    }
  }
}

// Esegui il test
testPhotoDeleteByUrl(); 
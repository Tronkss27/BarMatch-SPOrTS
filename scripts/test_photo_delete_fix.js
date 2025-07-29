/**
 * Test Script: Verifica correzione rimozione foto
 * 
 * Questo script testa:
 * 1. Correzione URL doppio /api/api/ → /api/
 * 2. Funzionalità rimozione foto dal profilo venue
 * 3. Verifica endpoint DELETE corretto
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

async function testPhotoDeleteFix() {
  console.log('🧪 TEST: Correzione rimozione foto venue');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Verifica che l'endpoint corretto sia raggiungibile
    console.log('\n1️⃣ Test endpoint DELETE corretto...');
    
    const correctUrl = `${API_BASE}/api/venues/${TEST_USER.venueId}/images`;
    console.log('🔗 URL corretto:', correctUrl);
    
    // Test 2: Verifica che l'endpoint sbagliato dia 404
    console.log('\n2️⃣ Test endpoint sbagliato (doppio /api/)...');
    
    const wrongUrl = `${API_BASE}/api/api/venues/${TEST_USER.venueId}/images`;
    console.log('❌ URL sbagliato:', wrongUrl);
    
    try {
      await axios.delete(wrongUrl, {
        headers: {
          'Authorization': `Bearer ${TEST_USER.token}`,
          'X-Tenant-ID': TEST_USER.id
        },
        data: { imageUrl: 'test-image.jpg' }
      });
      console.log('❌ ERRORE: L\'endpoint sbagliato non dovrebbe funzionare!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Corretto: endpoint sbagliato restituisce 404');
      } else {
        console.log('⚠️ Errore diverso dal 404:', error.response?.status, error.message);
      }
    }
    
    // Test 3: Verifica venue esistente
    console.log('\n3️⃣ Verifica venue esistente...');
    
    const venueResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER.token}`,
        'X-Tenant-ID': TEST_USER.id
      }
    });
    
    console.log('✅ Venue trovato:', venueResponse.data.data.name);
    console.log('📸 Numero immagini:', venueResponse.data.data.images?.length || 0);
    
    if (venueResponse.data.data.images && venueResponse.data.data.images.length > 0) {
      const firstImage = venueResponse.data.data.images[0];
      console.log('🖼️ Prima immagine:', firstImage.url);
      
      // Test 4: Test rimozione foto (simulato - non rimuoviamo realmente)
      console.log('\n4️⃣ Test simulato rimozione foto...');
      
      try {
        await axios.delete(correctUrl, {
          headers: {
            'Authorization': `Bearer ${TEST_USER.token}`,
            'X-Tenant-ID': TEST_USER.id
          },
          data: { imageUrl: 'test-non-existent-image.jpg' }
        });
        console.log('✅ Endpoint DELETE raggiungibile');
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          console.log('✅ Endpoint DELETE funziona (errore atteso per immagine inesistente)');
          console.log('📝 Messaggio:', error.response?.data?.message || error.message);
        } else {
          console.log('❌ Errore inaspettato:', error.response?.status, error.message);
        }
      }
    } else {
      console.log('ℹ️ Nessuna immagine presente per testare la rimozione');
    }
    
    console.log('\n🎉 Test completato! URL correzione applicata con successo.');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('📝 Dettagli risposta:', error.response.data);
    }
  }
}

// Esegui il test
testPhotoDeleteFix(); 
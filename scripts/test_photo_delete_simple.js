/**
 * Test Script: Test semplice rimozione foto
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';
const TEST_USER = {
  id: '68741b71e80c6b63cab1fd12',
  venueId: '68741ba6e80c6b63cab1fd57',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzQxYjcxZTgwYzZiNjNjYWIxZmQxMiIsImlhdCI6MTc1MjQzOTY2NiwiZXhwIjoxNzU1MDMxNjY2fQ.yiZ5m2uOFIXksddKEiBKZowiO0YPUYlrepmn6c4s470'
};

async function testSimplePhotoDelete() {
  try {
    // Ottieni venue e immagini
    const venueResponse = await axios.get(`${API_BASE}/api/venues/${TEST_USER.venueId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER.token}`,
        'X-Tenant-ID': TEST_USER.id
      }
    });
    
    console.log('Venue:', venueResponse.data.data.name);
    console.log('Immagini:', venueResponse.data.data.images.length);
    
    // Trova un'immagine che appartiene a questo venue (contiene l'ID corretto)
    const correctImage = venueResponse.data.data.images.find(img => 
      img.url.includes(TEST_USER.venueId)
    );
    
    if (!correctImage) {
      console.log('Nessuna immagine trovata per questo venue');
      return;
    }
    
    console.log('Immagine da rimuovere:', correctImage.url);
    
    // Test rimozione
    const deleteResponse = await axios.delete(`${API_BASE}/api/venues/${TEST_USER.venueId}/images`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER.token}`,
        'X-Tenant-ID': TEST_USER.id,
        'Content-Type': 'application/json'
      },
      data: { 
        imageUrl: correctImage.url 
      }
    });
    
    console.log('✅ Rimozione riuscita!');
    console.log('Messaggio:', deleteResponse.data.message);
    
  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

testSimplePhotoDelete(); 
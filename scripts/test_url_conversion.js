#!/usr/bin/env node

/**
 * Test URL Conversion - Verifica conversione URL immagini
 */

// Simula la funzione convertImageUrl dal venuesService
function convertImageUrl(url) {
  if (!url) return '';
  
  // Decodifica entità HTML se presenti
  let decodedUrl = url
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');
  
  // Se l'URL è relativo, aggiungi il base URL del backend
  if (decodedUrl.startsWith('/uploads/')) {
    const API_BASE_URL = 'http://localhost:3001';
    const baseUrl = API_BASE_URL.replace('/api', ''); // Rimuovi /api se presente
    decodedUrl = `${baseUrl}${decodedUrl}`;
  }
  
  return decodedUrl;
}

// Test data dai log backend
const testUrls = [
  '/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511058802-373369126.jpg',
  '&#x2F;uploads&#x2F;venues&#x2F;venue-6875322f83e5032d1c8ed90e-1752511130326-557044633.jpg',
  '/uploads/venues/venue-687532b583e5032d1c8ed9ba-1752511184295-585808594.jpeg',
  '&#x2F;uploads&#x2F;venues&#x2F;venue-687532b583e5032d1c8ed9ba-1752511184368-87386376.png'
];

console.log('🔄 Testing URL Conversion...\n');

testUrls.forEach((url, index) => {
  const converted = convertImageUrl(url);
  console.log(`Test ${index + 1}:`);
  console.log(`  Input:  ${url}`);
  console.log(`  Output: ${converted}`);
  console.log(`  ✅ ${converted.startsWith('http://localhost:3001/uploads/') ? 'CORRECT' : 'ERROR'}\n`);
});

// Test function for extracting relative URL for deletion
function extractRelativeUrl(fullUrl) {
  if (fullUrl.includes('/uploads/')) {
    const urlParts = fullUrl.split('/uploads/');
    if (urlParts.length > 1) {
      return '/uploads/' + urlParts[1];
    }
  }
  return fullUrl;
}

console.log('🗑️ Testing Deletion URL Extraction...\n');

const fullUrls = [
  'http://localhost:3001/uploads/venues/venue-687532b583e5032d1c8ed9ba-1752511965763-80288838.jpeg',
  '/uploads/venues/venue-687532b583e5032d1c8ed9ba-1752511184295-585808594.jpeg'
];

fullUrls.forEach((url, index) => {
  const relative = extractRelativeUrl(url);
  console.log(`Deletion Test ${index + 1}:`);
  console.log(`  Full URL:     ${url}`);
  console.log(`  Relative URL: ${relative}`);
  console.log(`  ✅ ${relative.startsWith('/uploads/') && !relative.includes('http') ? 'CORRECT' : 'ERROR'}\n`);
});

console.log('🎉 URL Conversion Tests Complete!'); 
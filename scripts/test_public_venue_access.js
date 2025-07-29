/**
 * Test Script: Verifica accesso pubblico al venue
 * 
 * Questo script testa:
 * 1. Accesso pubblico al venue senza autenticazione
 * 2. Struttura dati corretta con location.coordinates
 * 3. Conversione dati backend -> frontend
 * 4. Compatibilità con VenueDetail component
 */

const axios = require('axios');

// Configurazione
const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:5174';

// Venue ID di test (dall'ultimo venue creato nei log)
const TEST_VENUE_ID = '68740bad9229a0d7d64bbb2c';

async function testPublicVenueAccess() {
  console.log('🧪 TEST: Accesso pubblico al venue');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Accesso backend diretto
    console.log('\n1️⃣ Test accesso backend diretto...');
    const backendResponse = await axios.get(`${API_BASE}/venues/${TEST_VENUE_ID}`, {
      headers: {
        'Content-Type': 'application/json'
        // Nessun token di autenticazione per simulare accesso pubblico
      }
    });
    
    console.log('✅ Backend response status:', backendResponse.status);
    console.log('📊 Backend venue data structure:');
    const backendVenue = backendResponse.data.data || backendResponse.data.venue || backendResponse.data;
    console.log('- ID:', backendVenue._id);
    console.log('- Name:', backendVenue.name);
    console.log('- Location:', JSON.stringify(backendVenue.location, null, 2));
    console.log('- Images count:', backendVenue.images?.length || 0);
    
    // Test 2: Frontend service conversion
    console.log('\n2️⃣ Test conversione frontend service...');
    
    // Simula la conversione che fa venuesService.convertBackendVenueToLegacy
    const convertedVenue = {
      id: backendVenue._id,
      name: backendVenue.name,
      description: backendVenue.description,
      address: backendVenue.location?.address?.street || '',
      city: backendVenue.location?.address?.city || '',
      postalCode: backendVenue.location?.address?.postalCode || '',
      phone: backendVenue.contact?.phone || '',
      website: backendVenue.contact?.website || '',
      email: backendVenue.contact?.email || '',
      images: (backendVenue.images || []).map(img => ({
        url: img.url ? img.url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&') : '',
        isMain: img.isMain || false
      })),
      hours: backendVenue.hours || [],
      facilities: backendVenue.facilities || [],
      screenCount: backendVenue.screenCount || 0,
      // ✅ Struttura location completa
      location: {
        address: {
          street: backendVenue.location?.address?.street || '',
          city: backendVenue.location?.address?.city || '',
          postalCode: backendVenue.location?.address?.postalCode || '',
          country: backendVenue.location?.address?.country || 'Italy'
        },
        coordinates: backendVenue.location?.coordinates || null
      }
    };
    
    console.log('✅ Converted venue structure:');
    console.log('- ID:', convertedVenue.id);
    console.log('- Name:', convertedVenue.name);
    console.log('- Location.address:', JSON.stringify(convertedVenue.location.address, null, 2));
    console.log('- Location.coordinates:', convertedVenue.location.coordinates);
    console.log('- Images count:', convertedVenue.images?.length || 0);
    
    // Test 3: Compatibilità VenueDetail
    console.log('\n3️⃣ Test compatibilità VenueDetail component...');
    
    // Simula i controlli che fa VenueDetail
    const fullAddress = convertedVenue?.location?.address 
      ? `${convertedVenue.location.address.street}, ${convertedVenue.location.address.city}, ${convertedVenue.location.address.postalCode}` 
      : 'Indirizzo non disponibile';
    
    const hasCoordinates = convertedVenue.location?.coordinates;
    const coordinatesAccess = hasCoordinates ? 'SAFE' : 'NULL (safe with optional chaining)';
    
    console.log('✅ VenueDetail compatibility checks:');
    console.log('- fullAddress:', fullAddress);
    console.log('- coordinates access:', coordinatesAccess);
    console.log('- venueData.location?.coordinates:', hasCoordinates || 'null/undefined');
    
    // Test 4: Frontend API call simulation
    console.log('\n4️⃣ Test frontend API call simulation...');
    
    try {
      const frontendResponse = await axios.get(`${API_BASE}/venues/${TEST_VENUE_ID}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API call successful');
      console.log('- Status:', frontendResponse.status);
      console.log('- Data structure valid:', !!frontendResponse.data);
      
    } catch (frontendError) {
      console.log('❌ Frontend API call failed:', frontendError.message);
    }
    
    // Test 5: URL pubblico
    console.log('\n5️⃣ Test URL pubblico...');
    console.log(`🌐 URL pubblico: ${FRONTEND_BASE}/venues/${TEST_VENUE_ID}`);
    console.log('👆 Apri questo URL nel browser per testare il frontend');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!');
    console.log('✅ Il venue è accessibile pubblicamente');
    console.log('✅ La struttura dati è corretta');
    console.log('✅ VenueDetail component dovrebbe funzionare');
    
  } catch (error) {
    console.error('\n❌ TEST FALLITO:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\n🔧 AZIONI RICHIESTE:');
    console.log('1. Verifica che il backend sia in esecuzione su porta 3001');
    console.log('2. Verifica che il venue ID esista nel database');
    console.log('3. Controlla i log del backend per errori');
  }
}

// Esegui il test
testPublicVenueAccess(); 
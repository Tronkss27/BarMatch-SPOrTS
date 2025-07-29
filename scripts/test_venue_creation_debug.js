#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testVenueCreationDebug() {
  console.log('🔍 DEBUG: Test Creazione Venue - Analisi Dati');
  console.log('=' .repeat(60));

  try {
    // 1. REGISTRAZIONE UTENTE
    console.log('\n1️⃣ REGISTRAZIONE UTENTE...');
    const timestamp = Date.now();
    const registrationData = {
      name: 'Debug User',
      email: `debug.${timestamp}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Debug Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Debug 123',
        businessCity: 'Milano',
        businessType: 'bar',
        businessPostalCode: '20100'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
    const userId = registerResponse.data.user.id;
    const venueId = registerResponse.data.user.venueId;
    const token = registerResponse.data.token;
    
    console.log('✅ Registrazione completata');
    console.log('User ID:', userId);
    console.log('Venue ID:', venueId);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': userId,
      'Content-Type': 'application/json'
    };

    // 2. TEST CREAZIONE VENUE CON DATI CORRETTI
    console.log('\n2️⃣ TEST CREAZIONE VENUE...');
    
    // ✅ Dati nel formato corretto per il backend
    const correctVenueData = {
      name: 'Debug Test Venue',
      description: 'A venue for debugging data format',
      contact: {
        email: registrationData.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Debug Test 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      // ✅ Features: array di stringhe semplici
      features: ['wifi', 'tv_screens', 'food_service'],
      // ✅ Sports offerings: array di oggetti con struttura corretta
      sportsOfferings: [{
        sport: 'football',
        leagues: ['Serie A'],
        isPrimary: true
      }],
      hours: {
        mon: { isOpen: false },
        tue: { open: '11:00', close: '23:00', isOpen: true },
        wed: { open: '11:00', close: '23:00', isOpen: true },
        thu: { open: '11:00', close: '23:00', isOpen: true },
        fri: { open: '11:00', close: '23:00', isOpen: true },
        sat: { open: '11:00', close: '23:00', isOpen: true },
        sun: { open: '11:00', close: '23:00', isOpen: true }
      }
    };

    console.log('\n📋 DATI INVIATI AL BACKEND:');
    console.log('Features:', JSON.stringify(correctVenueData.features, null, 2));
    console.log('Sports Offerings:', JSON.stringify(correctVenueData.sportsOfferings, null, 2));

    const createResponse = await axios.post(`${API_BASE}/venues`, correctVenueData, { headers });
    console.log('\n✅ VENUE CREATO CON SUCCESSO!');
    console.log('Venue ID:', createResponse.data.venue._id);
    console.log('Features salvate:', createResponse.data.venue.features);
    console.log('Sports salvati:', createResponse.data.venue.sportsOfferings);

    // 3. VERIFICA ACCESSO
    console.log('\n3️⃣ VERIFICA ACCESSO...');
    const getResponse = await axios.get(`${API_BASE}/venues/${createResponse.data.venue._id}`, { headers });
    console.log('✅ Venue accessibile');
    console.log('Nome:', getResponse.data.venue.name);

    console.log('\n🎉 TEST COMPLETATO CON SUCCESSO!');
    
  } catch (error) {
    console.error('\n❌ ERRORE NEL TEST:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Se c'è un errore di validazione, mostra i dettagli
      if (error.response.data && error.response.data.error && error.response.data.error.includes('validation')) {
        console.error('\n🔍 DETTAGLI ERRORE VALIDAZIONE:');
        console.error(error.response.data.error);
      }
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testVenueCreationDebug(); 
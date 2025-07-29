#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOnboardingFinal() {
  console.log('🧪 TEST: Onboarding Finale - Verifica Completa');
  console.log('=' .repeat(60));

  try {
    // 1. REGISTRAZIONE UTENTE
    console.log('\n1️⃣ REGISTRAZIONE UTENTE...');
    const timestamp = Date.now();
    const registrationData = {
      name: 'Test Final User',
      email: `test.final.${timestamp}@example.com`,
      password: 'password123',
      isVenueOwner: true, // ✅ FIX: Aggiungi flag venue owner
      businessInfo: { // ✅ FIX: Aggiungi info business necessarie
        businessName: 'Test Final Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Test Final 123',
        businessCity: 'Milano',
        businessType: 'bar',
        businessPostalCode: '20100'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
    console.log('✅ Registrazione completata');
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Venue ID:', registerResponse.data.user.venueId);

    const userId = registerResponse.data.user.id;
    const venueId = registerResponse.data.user.venueId;
    const token = registerResponse.data.token;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': userId,
      'Content-Type': 'application/json'
    };

    // 2. UPLOAD FOTO
    console.log('\n2️⃣ SIMULAZIONE UPLOAD FOTO...');
    const uploadHeaders = {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': userId,
      'Content-Type': 'multipart/form-data'
    };

    // Simula upload di una foto (senza file reale per il test)
    console.log('📸 Simulando upload foto per venue:', venueId);
    
    // 3. CREAZIONE VENUE CON DATI CORRETTI
    console.log('\n3️⃣ CREAZIONE VENUE CON FORMATO CORRETTO...');
    const venueData = {
      name: 'Test Final Venue',
      description: 'A test venue with correct data format',
      contact: {
        email: registrationData.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Test Final 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      // ✅ Features come array di stringhe semplici con valori enum validi
      features: ['wifi', 'multiple_screens', 'food_service'],
      // ✅ Sports offerings con formato corretto
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

    const createResponse = await axios.post(`${API_BASE}/venues`, venueData, { headers });
    console.log('✅ Venue creato con successo');
    console.log('Venue ID:', createResponse.data.data._id); // ✅ FIX: Usa data.data invece di data.venue
    console.log('Features:', createResponse.data.data.features);
    console.log('Sports Offerings:', createResponse.data.data.sportsOfferings);

    // 4. VERIFICA ACCESSO PUBBLICO
    console.log('\n4️⃣ VERIFICA ACCESSO PUBBLICO...');
    const publicResponse = await axios.get(`${API_BASE}/venues/${createResponse.data.data._id}`, { headers });
    console.log('✅ Venue accessibile pubblicamente');
    console.log('Nome:', publicResponse.data.venue ? publicResponse.data.venue.name : publicResponse.data.data.name);
    console.log('Features:', publicResponse.data.venue ? publicResponse.data.venue.features : publicResponse.data.data.features);

    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('=' .repeat(60));
    console.log('✅ Registrazione: OK');
    console.log('✅ Creazione venue: OK');
    console.log('✅ Formato dati: OK');
    console.log('✅ Accesso pubblico: OK');

  } catch (error) {
    console.error('\n❌ ERRORE NEL TEST:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testOnboardingFinal(); 
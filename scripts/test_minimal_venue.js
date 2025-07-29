#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testMinimalVenue() {
  console.log('🧪 TEST: Venue Minimo - Solo Campi Richiesti');
  console.log('=' .repeat(60));

  try {
    // 1. REGISTRAZIONE
    const timestamp = Date.now();
    const registrationData = {
      name: 'Minimal User',
      email: `minimal.${timestamp}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Minimal Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Minimal 123',
        businessCity: 'Milano',
        businessType: 'bar',
        businessPostalCode: '20100'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
    const userId = registerResponse.data.user.id;
    const token = registerResponse.data.token;
    
    console.log('✅ Registrazione completata');
    console.log('User ID:', userId);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': userId,
      'Content-Type': 'application/json'
    };

    // 2. TEST CON DATI MINIMI
    console.log('\n2️⃣ CREAZIONE VENUE CON DATI MINIMI...');
    
    const minimalVenueData = {
      name: 'Minimal Test Venue',
      contact: {
        email: registrationData.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Minimal Test 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      }
      // ✅ NO features, NO sportsOfferings - solo campi richiesti
    };

    console.log('\n📋 DATI MINIMI INVIATI:');
    console.log(JSON.stringify(minimalVenueData, null, 2));

    const createResponse = await axios.post(`${API_BASE}/venues`, minimalVenueData, { headers });
    console.log('\n✅ VENUE MINIMO CREATO CON SUCCESSO!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    console.log('Venue ID:', createResponse.data.data._id); // ✅ FIX: Usa data.data invece di data.venue
    console.log('Nome:', createResponse.data.data.name);

    console.log('\n🎉 TEST MINIMO SUPERATO!');
    
  } catch (error) {
    console.error('\n❌ ERRORE NEL TEST MINIMO:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testMinimalVenue(); 
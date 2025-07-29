#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testVenueWithFeatures() {
  console.log('🧪 TEST: Venue Con Features - Debug Specifico');
  console.log('=' .repeat(60));

  try {
    // 1. REGISTRAZIONE
    const timestamp = Date.now();
    const registrationData = {
      name: 'Features User',
      email: `features.${timestamp}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Features Venue',
        businessPhone: '3123456789',
        businessAddress: 'Via Features 123',
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

    // 2. TEST SOLO FEATURES
    console.log('\n2️⃣ TEST SOLO FEATURES...');
    
    const featuresOnlyData = {
      name: 'Features Only Venue',
      contact: {
        email: registrationData.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Features Only 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      features: ['wifi', 'multiple_screens'] // ✅ FIX: Usa multiple_screens invece di tv_screens
    };

    console.log('\n📋 DATI CON SOLO FEATURES:');
    console.log('Features:', JSON.stringify(featuresOnlyData.features, null, 2));

    try {
      const featuresResponse = await axios.post(`${API_BASE}/venues`, featuresOnlyData, { headers });
      console.log('✅ VENUE CON FEATURES CREATO!');
      console.log('Features salvate:', featuresResponse.data.data.features);
    } catch (featuresError) {
      console.error('❌ ERRORE CON FEATURES:');
      if (featuresError.response) {
        console.error('Status:', featuresError.response.status);
        console.error('Data:', JSON.stringify(featuresError.response.data, null, 2));
      }
    }

    // 3. TEST SOLO SPORTS OFFERINGS
    console.log('\n3️⃣ TEST SOLO SPORTS OFFERINGS...');
    
    const sportsOnlyData = {
      name: 'Sports Only Venue',
      contact: {
        email: registrationData.email,
        phone: '3123456789'
      },
      location: {
        address: {
          street: 'Via Sports Only 123',
          city: 'Milano',
          postalCode: '20100',
          country: 'Italy'
        }
      },
      capacity: {
        total: 50
      },
      sportsOfferings: [{
        sport: 'football',
        leagues: ['Serie A'],
        isPrimary: true
      }]
    };

    console.log('\n📋 DATI CON SOLO SPORTS:');
    console.log('SportsOfferings:', JSON.stringify(sportsOnlyData.sportsOfferings, null, 2));

    try {
      const sportsResponse = await axios.post(`${API_BASE}/venues`, sportsOnlyData, { headers });
      console.log('✅ VENUE CON SPORTS CREATO!');
      console.log('Sports salvati:', sportsResponse.data.data.sportsOfferings);
    } catch (sportsError) {
      console.error('❌ ERRORE CON SPORTS:');
      if (sportsError.response) {
        console.error('Status:', sportsError.response.status);
        console.error('Data:', JSON.stringify(sportsError.response.data, null, 2));
      }
    }

    console.log('\n🎉 TEST FEATURES COMPLETATO!');
    
  } catch (error) {
    console.error('\n❌ ERRORE GENERALE:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testVenueWithFeatures(); 
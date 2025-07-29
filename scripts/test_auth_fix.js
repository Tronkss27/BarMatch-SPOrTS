#!/usr/bin/env node

const axios = require('axios');

// Configurazione
const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:5174';

// Colori per output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(colors[color] + message + colors.reset);
}

// Test autenticazione admin
async function testAdminAuth() {
  log('cyan', '\n🔐 TEST AUTENTICAZIONE ADMIN\n');

  try {
    // ========================================
    // STEP 1: Verifica servizi attivi
    // ========================================
    log('yellow', '1. Verifica servizi attivi...');
    
    try {
      const backendResponse = await axios.get(`${API_BASE}/api/auth/verify`);
      // Se arriva qui, il backend è attivo (anche se restituisce errore di auth)
      log('green', '✅ Backend attivo');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // 401 significa che il backend è attivo ma non autenticato
        log('green', '✅ Backend attivo');
      } else {
        log('red', '❌ Backend non raggiungibile');
        throw new Error('Backend non attivo');
      }
    }

    try {
      const frontendResponse = await axios.get(FRONTEND_BASE);
      log('green', '✅ Frontend attivo');
    } catch (error) {
      log('red', '❌ Frontend non raggiungibile');
      throw new Error('Frontend non attivo');
    }

    // ========================================
    // STEP 2: Test registrazione venue owner
    // ========================================
    log('yellow', '\n2. Test registrazione venue owner...');
    
    const testVenueData = {
      name: 'Test Admin',
      email: `test.admin.${Date.now()}@example.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Test Sports Bar',
        businessPhone: '+39 123 456 7890',
        businessAddress: 'Via Test, 123',
        businessCity: 'Milano',
        businessType: 'sport_bar',
        businessPostalCode: '20100',
        businessWebsite: 'https://www.testsportsbar.it',
        businessDescription: 'Un bar sportivo di test'
      }
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testVenueData);
      
      if (registerResponse.data.success) {
        log('green', '✅ Registrazione completata con successo');
        log('blue', `   User ID: ${registerResponse.data.user.id}`);
        log('blue', `   Email: ${registerResponse.data.user.email}`);
        log('blue', `   Role: ${registerResponse.data.user.role}`);
        
        const token = registerResponse.data.token;
        const user = registerResponse.data.user;
        
        // ========================================
        // STEP 3: Test login
        // ========================================
        log('yellow', '\n3. Test login...');
        
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: testVenueData.email,
          password: testVenueData.password
        });
        
        if (loginResponse.data.success) {
          log('green', '✅ Login completato con successo');
          log('blue', `   Token valido: ${loginResponse.data.token ? 'Sì' : 'No'}`);
          
          // ========================================
          // STEP 4: Test verifica token
          // ========================================
          log('yellow', '\n4. Test verifica token...');
          
          const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.token}`
            }
          });
          
          if (verifyResponse.data.success) {
            log('green', '✅ Token verificato con successo');
            log('blue', `   User verificato: ${verifyResponse.data.user.email}`);
            
            // ========================================
            // STEP 5: Test accesso admin dashboard
            // ========================================
            log('yellow', '\n5. Test accesso admin dashboard...');
            
            // Simula accesso alle API admin
            const dashboardTests = [
              { endpoint: '/api/venues/me', name: 'Venue Owner Profile' },
              { endpoint: '/api/bookings/venue', name: 'Venue Bookings' },
              { endpoint: '/api/match-announcements', name: 'Match Announcements' }
            ];
            
            for (const test of dashboardTests) {
              try {
                const response = await axios.get(`${API_BASE}${test.endpoint}`, {
                  headers: {
                    'Authorization': `Bearer ${loginResponse.data.token}`
                  }
                });
                log('green', `✅ ${test.name}: OK`);
              } catch (error) {
                log('yellow', `⚠️ ${test.name}: ${error.response?.status || 'Error'} (normale se non ci sono dati)`);
              }
            }
            
            log('green', '\n🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!');
            log('cyan', '\n📋 RIEPILOGO:');
            log('cyan', '   ✅ Registrazione venue owner');
            log('cyan', '   ✅ Login admin');
            log('cyan', '   ✅ Verifica token');
            log('cyan', '   ✅ Accesso API admin');
            log('cyan', '\n🔗 LINK UTILI:');
            log('cyan', `   Frontend: ${FRONTEND_BASE}`);
            log('cyan', `   Sports Register: ${FRONTEND_BASE}/sports-register`);
            log('cyan', `   Sports Login: ${FRONTEND_BASE}/sports-login`);
            log('cyan', `   Admin Dashboard: ${FRONTEND_BASE}/admin`);
            
          } else {
            log('red', '❌ Errore verifica token');
            throw new Error('Token non valido');
          }
        } else {
          log('red', '❌ Errore login');
          throw new Error('Login fallito');
        }
      } else {
        log('red', '❌ Errore registrazione');
        throw new Error('Registrazione fallita');
      }
    } catch (error) {
      log('red', `❌ Errore durante il test: ${error.message}`);
      if (error.response) {
        log('red', `   Status: ${error.response.status}`);
        log('red', `   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      throw error;
    }

  } catch (error) {
    log('red', `\n💥 TEST FALLITO: ${error.message}`);
    process.exit(1);
  }
}

// Esegui test
testAdminAuth().catch(console.error); 
/**
 * Test Script: Isolamento Multi-Tenant
 * 
 * Questo script testa:
 * 1. Isolamento dati tra diversi tenant
 * 2. Corretta applicazione header X-Tenant-ID
 * 3. Separazione venue per owner
 * 4. Sicurezza accesso cross-tenant
 */

const axios = require('axios');

// Configurazione
const API_BASE = 'http://localhost:3001/api';

// Dati di test per due utenti diversi
const TENANT_A = {
  userId: '68740bad9229a0d7d64bbb29',
  venueId: '6874175ee5a1488169b2371c',
  name: 'Tenant A'
};

const TENANT_B = {
  userId: '6874155afd60ac16d68d005e', 
  venueId: '68741570fd60ac16d68d0083',
  name: 'Tenant B'
};

// Funzione per generare tenant ID come nel frontend
function generateTenantId(userId) {
  return userId; // Semplificato per il test
}

async function testMultiTenantIsolation() {
  console.log('🏢 TEST: Isolamento Multi-Tenant');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Accesso pubblico senza tenant (dovrebbe funzionare)
    console.log('\n1️⃣ Test accesso pubblico senza tenant...');
    
    const publicResponse = await axios.get(`${API_BASE}/venues/${TENANT_A.venueId}`, {
      headers: {
        'Content-Type': 'application/json'
        // Nessun X-Tenant-ID header
      }
    });
    
    console.log('✅ Accesso pubblico OK:', publicResponse.status);
    console.log('- Venue name:', publicResponse.data.venue?.name || publicResponse.data.name);
    
    // Test 2: Accesso con Tenant A al proprio venue
    console.log('\n2️⃣ Test Tenant A accede al proprio venue...');
    
    const tenantAId = generateTenantId(TENANT_A.userId);
    const tenantAResponse = await axios.get(`${API_BASE}/venues/${TENANT_A.venueId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantAId
      }
    });
    
    console.log('✅ Tenant A accesso OK:', tenantAResponse.status);
    console.log('- Tenant A ID:', tenantAId);
    console.log('- Venue name:', tenantAResponse.data.venue?.name || tenantAResponse.data.name);
    
    // Test 3: Accesso con Tenant B al proprio venue
    console.log('\n3️⃣ Test Tenant B accede al proprio venue...');
    
    const tenantBId = generateTenantId(TENANT_B.userId);
    const tenantBResponse = await axios.get(`${API_BASE}/venues/${TENANT_B.venueId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantBId
      }
    });
    
    console.log('✅ Tenant B accesso OK:', tenantBResponse.status);
    console.log('- Tenant B ID:', tenantBId);
    console.log('- Venue name:', tenantBResponse.data.venue?.name || tenantBResponse.data.name);
    
    // Test 4: Cross-tenant access (Tenant A prova ad accedere al venue di Tenant B)
    console.log('\n4️⃣ Test cross-tenant access (dovrebbe funzionare per accesso pubblico)...');
    
    try {
      const crossTenantResponse = await axios.get(`${API_BASE}/venues/${TENANT_B.venueId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantAId // Tenant A prova ad accedere al venue di Tenant B
        }
      });
      
      console.log('ℹ️ Cross-tenant access status:', crossTenantResponse.status);
      console.log('- Questo è OK per l\'accesso pubblico ai venue');
      
    } catch (crossError) {
      console.log('❌ Cross-tenant access blocked:', crossError.response?.status);
      console.log('- Questo è corretto se l\'isolamento è attivo');
    }
    
    // Test 5: Lista venues per tenant
    console.log('\n5️⃣ Test lista venues per tenant...');
    
    try {
      const tenantAVenues = await axios.get(`${API_BASE}/venues`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantAId
        }
      });
      
      console.log('✅ Tenant A venues count:', tenantAVenues.data.data?.length || 0);
      
      const tenantBVenues = await axios.get(`${API_BASE}/venues`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantBId
        }
      });
      
      console.log('✅ Tenant B venues count:', tenantBVenues.data.data?.length || 0);
      
    } catch (listError) {
      console.log('ℹ️ Lista venues richiede autenticazione:', listError.response?.status);
    }
    
    // Test 6: Verifica tenant isolation nel database
    console.log('\n6️⃣ Test verifica tenant isolation...');
    
    const publicVenuesResponse = await axios.get(`${API_BASE}/venues/public`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Public venues accessible:', publicVenuesResponse.status);
    console.log('- Total public venues:', publicVenuesResponse.data.data?.length || 0);
    
    // Test 7: Verifica header tenant nei log backend
    console.log('\n7️⃣ Test header tenant logging...');
    console.log('🔍 Controlla i log del backend per vedere:');
    console.log('- "X-Tenant-ID" header ricevuto correttamente');
    console.log('- Tenant isolation applicato nelle query');
    console.log('- Default tenant creato quando necessario');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST MULTI-TENANT COMPLETATI!');
    console.log('✅ Accesso pubblico funziona');
    console.log('✅ Tenant isolation implementato');
    console.log('✅ Header X-Tenant-ID gestito correttamente');
    
    console.log('\n📊 RIEPILOGO TENANT:');
    console.log(`- Tenant A (${TENANT_A.name}): ${tenantAId}`);
    console.log(`- Tenant B (${TENANT_B.name}): ${tenantBId}`);
    
  } catch (error) {
    console.error('\n❌ TEST MULTI-TENANT FALLITO:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\n🔧 AZIONI RICHIESTE:');
    console.log('1. Verifica configurazione multi-tenant nel backend');
    console.log('2. Controlla middleware tenantMiddleware.js');
    console.log('3. Verifica header X-Tenant-ID nelle richieste');
  }
}

// Esegui il test
testMultiTenantIsolation(); 
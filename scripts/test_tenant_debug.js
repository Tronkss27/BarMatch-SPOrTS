const axios = require('axios');

async function debugTenantIssue() {
  try {
    console.log('🔍 Debug Tenant Issue - SPOrTS Platform');
    console.log('========================================');

    // 1. Registrazione
    const timestamp = Date.now();
    const registerData = {
      name: 'Debug Tenant',
      email: `debugtenant${timestamp}@test.com`,
      password: 'password123',
      isVenueOwner: true,
      businessInfo: {
        businessName: 'Debug Tenant Bar',
        businessAddress: 'Via Debug 123',
        businessCity: 'Milano',
        businessPhone: '1234567890'
      }
    };

    console.log('\n1. 📝 Registrazione...');
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', registerData);
    const { token, user, venue } = registerResponse.data;
    
    console.log('✅ Registrazione completata');
    console.log('👤 User data:');
    console.log('   - ID:', user.id);
    console.log('   - _id:', user._id);
    console.log('   - venueId:', user.venueId);
    console.log('🏟️ Venue data:');
    console.log('   - ID:', venue?.id);
    console.log('   - _id:', venue?._id);
    console.log('   - owner:', venue?.owner);

    // 2. Verifica venue diretto
    console.log('\n2. 🔍 Verifica venue nel database...');
    try {
      const venueResponse = await axios.get(`http://localhost:3001/api/venues/${user.venueId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.id
        }
      });

      const venueData = venueResponse.data.data;
      console.log('✅ Venue trovato nel database:');
      console.log('   - _id:', venueData._id);
      console.log('   - name:', venueData.name);
      console.log('   - owner:', venueData.owner);
      console.log('   - tenantId:', venueData.tenantId);
      
      console.log('\n🔍 Confronto tenant ID:');
      console.log('   - Request X-Tenant-ID:', user.id);
      console.log('   - Venue tenantId:', venueData.tenantId);
      console.log('   - Match:', user.id === venueData.tenantId ? 'SÌ' : 'NO');
      
      if (user.id !== venueData.tenantId) {
        console.log('❌ PROBLEMA: I tenant ID non corrispondono!');
        console.log('   - Tipo user.id:', typeof user.id);
        console.log('   - Tipo venue.tenantId:', typeof venueData.tenantId);
      }

    } catch (venueError) {
      console.error('❌ Errore nel recupero venue:', venueError.response?.data || venueError.message);
    }

  } catch (error) {
    console.error('❌ Errore generale:', error.response?.data || error.message);
  }
}

debugTenantIssue(); 
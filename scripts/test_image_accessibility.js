#!/usr/bin/env node

/**
 * Test Image Accessibility - Verifica che le immagini siano accessibili
 */

const axios = require('axios');

async function testImageAccessibility() {
  console.log('🔍 Testing Image Accessibility...\n');

  // Test URLs from logs
  const testImages = [
    'http://localhost:3001/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511058802-373369126.jpg',
    'http://localhost:3001/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511059172-871430761.png',
    'http://localhost:3001/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511063887-196061814.jpg',
    'http://localhost:3001/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511130008-700083300.png',
    'http://localhost:3001/uploads/venues/venue-6875322f83e5032d1c8ed90e-1752511130326-557044633.jpg'
  ];

  const results = [];

  for (const imageUrl of testImages) {
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      console.log(`✅ ${imageUrl} - Status: ${response.status}`);
      results.push({ url: imageUrl, status: 'SUCCESS', code: response.status });
    } catch (error) {
      const status = error.response?.status || 'NETWORK_ERROR';
      console.log(`❌ ${imageUrl} - Status: ${status}`);
      results.push({ url: imageUrl, status: 'ERROR', code: status });
    }
  }

  console.log('\n📊 Summary:');
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Successful: ${successCount}/${testImages.length}`);
  console.log(`❌ Failed: ${errorCount}/${testImages.length}`);

  if (errorCount > 0) {
    console.log('\n🔧 Errors found:');
    results.filter(r => r.status === 'ERROR').forEach(r => {
      console.log(`  - ${r.url} (${r.code})`);
    });
  }

  return errorCount === 0;
}

// Test CORS headers
async function testCORSHeaders() {
  console.log('\n🌐 Testing CORS Headers...\n');
  
  const testUrl = 'http://localhost:3001/uploads/placeholder.svg';
  
  try {
    const response = await axios.get(testUrl);
    console.log('📋 Response Headers:');
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cross-origin')) {
        console.log(`  ${key}: ${value}`);
      }
    });
    return true;
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const imageTest = await testImageAccessibility();
  const corsTest = await testCORSHeaders();
  
  if (imageTest && corsTest) {
    console.log('\n🎉 All tests passed! Images should be accessible from frontend.');
  } else {
    console.log('\n⚠️ Some tests failed. Check backend configuration.');
  }
}

runTests(); 
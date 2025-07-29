const axios = require('axios');

async function testFrontendConversion() {
  console.log('🧪 Testing frontend image conversion...\n');

  try {
    // 1. Test API diretta
    console.log('1️⃣ Testing direct API call...');
    const venueId = '68741b72e80c6b63cab1fd15';
    
    const response = await axios.get(`http://localhost:3001/api/venues/${venueId}`);
    
    console.log('✅ API Response structure:', {
      success: response.data.success,
      hasVenue: !!response.data.venue,
      hasData: !!response.data.data,
      venueImagesCount: response.data.venue?.images?.length || 0,
      dataImagesCount: response.data.data?.images?.length || 0
    });

    // 2. Test conversione frontend simulata
    console.log('\n2️⃣ Testing frontend conversion...');
    
    const venueData = response.data.venue;
    if (venueData && venueData.images) {
      console.log('📸 Raw backend images (first 2):');
      venueData.images.slice(0, 2).forEach((img, i) => {
        console.log(`  ${i + 1}. Type: ${typeof img}, Value:`, img);
      });
      
      // Simula la conversione che fa convertBackendVenueToLegacy
      const convertedImages = venueData.images
        .map(img => {
          if (typeof img === 'object' && img.url) {
            return img.url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
          } else if (typeof img === 'string') {
            return img.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
          }
          return '';
        })
        .filter(url => url && url !== 'undefined');
      
      console.log('\n🔄 Frontend converted images:');
      convertedImages.slice(0, 2).forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
      
      // 3. Test accessibilità immagini
      console.log('\n3️⃣ Testing image accessibility...');
      for (const imageUrl of convertedImages.slice(0, 2)) {
        try {
          const imageResponse = await axios.head(`http://localhost:3001${imageUrl}`);
          console.log(`✅ Image accessible: ${imageUrl} (${imageResponse.status})`);
        } catch (error) {
          console.log(`❌ Image not accessible: ${imageUrl} (${error.response?.status || error.message})`);
        }
      }
    } else {
      console.log('❌ No images found in venue data');
    }

    console.log('\n🎉 Frontend conversion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testFrontendConversion(); 
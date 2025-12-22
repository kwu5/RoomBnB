/**
 * Property Service Tests
 *
 * This file contains manual tests for the property service.
 * Run these in the browser console or as a standalone script.
 *
 * To run in browser console:
 * 1. Open http://localhost:5173
 * 2. Open DevTools (F12) → Console
 * 3. Copy and paste functions below
 * 4. Call runPropertyTests()
 */

// Test configuration
const API_URL = 'http://localhost:5000/api';
let testToken = null;
let testPropertyId = null;

/**
 * Helper: Make HTTP request
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (testToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${testToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

/**
 * Helper: Log test result
 */
function logTest(name, passed, message = '') {
  const emoji = passed ? '✅' : '❌';
  console.log(`${emoji} ${name}${message ? ': ' + message : ''}`);
  return passed;
}

/**
 * Test 1: Get all properties
 */
async function testGetAllProperties() {
  console.log('\n📋 Test 1: Get All Properties');
  try {
    const result = await makeRequest('/properties');

    const passed = result.ok && Array.isArray(result.data);
    logTest('Get all properties', passed, `Found ${result.data?.length || 0} properties`);

    if (result.data && result.data.length > 0) {
      testPropertyId = result.data[0].id;
      console.log('  Sample property:', result.data[0].title);
    }

    return passed;
  } catch (error) {
    logTest('Get all properties', false, error.message);
    return false;
  }
}

/**
 * Test 2: Get properties with filters
 */
async function testGetPropertiesWithFilters() {
  console.log('\n🔍 Test 2: Get Properties with Filters');
  let allPassed = true;

  // Test city filter
  try {
    const result = await makeRequest('/properties?city=New York');
    const passed = result.ok && Array.isArray(result.data);
    logTest('Filter by city', passed, `Found ${result.data?.length || 0} properties in New York`);
    allPassed = allPassed && passed;
  } catch (error) {
    logTest('Filter by city', false, error.message);
    allPassed = false;
  }

  // Test price range filter
  try {
    const result = await makeRequest('/properties?minPrice=100&maxPrice=500');
    const passed = result.ok && Array.isArray(result.data);
    logTest('Filter by price range', passed, `Found ${result.data?.length || 0} properties $100-$500`);
    allPassed = allPassed && passed;
  } catch (error) {
    logTest('Filter by price range', false, error.message);
    allPassed = false;
  }

  // Test search
  try {
    const result = await makeRequest('/properties?search=apartment');
    const passed = result.ok && Array.isArray(result.data);
    logTest('Search properties', passed, `Found ${result.data?.length || 0} properties matching "apartment"`);
    allPassed = allPassed && passed;
  } catch (error) {
    logTest('Search properties', false, error.message);
    allPassed = false;
  }

  return allPassed;
}

/**
 * Test 3: Get property by ID
 */
async function testGetPropertyById() {
  console.log('\n🏠 Test 3: Get Property by ID');

  if (!testPropertyId) {
    logTest('Get property by ID', false, 'No property ID available (run test 1 first)');
    return false;
  }

  try {
    const result = await makeRequest(`/properties/${testPropertyId}`);

    const passed = result.ok && result.data && result.data.id === testPropertyId;
    logTest('Get property by ID', passed, result.data?.title);

    if (passed) {
      console.log('  Property details:', {
        id: result.data.id,
        title: result.data.title,
        city: result.data.city,
        price: result.data.pricePerNight,
        bedrooms: result.data.bedrooms,
        bathrooms: result.data.bathrooms,
      });
    }

    return passed;
  } catch (error) {
    logTest('Get property by ID', false, error.message);
    return false;
  }
}

/**
 * Test 4: Register and login as host
 */
async function testHostAuth() {
  console.log('\n🔐 Test 4: Host Authentication');
  let allPassed = true;

  const timestamp = Date.now();
  const hostEmail = `test-host-${timestamp}@example.com`;
  const hostPassword = 'HostPass123';

  // Register host
  try {
    const result = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: hostEmail,
        password: hostPassword,
        firstName: 'Test',
        lastName: 'Host',
        isHost: true,
      }),
    });

    const passed = result.ok && result.data?.token;
    logTest('Register as host', passed);

    if (passed) {
      testToken = result.data.token;
      console.log('  Host email:', hostEmail);
      console.log('  Token:', testToken.substring(0, 20) + '...');
    }

    allPassed = allPassed && passed;
  } catch (error) {
    logTest('Register as host', false, error.message);
    allPassed = false;
  }

  return allPassed;
}

/**
 * Test 5: Create property (requires host authentication)
 */
async function testCreateProperty() {
  console.log('\n➕ Test 5: Create Property');

  if (!testToken) {
    logTest('Create property', false, 'Not authenticated (run test 4 first)');
    return false;
  }

  try {
    const result = await makeRequest('/properties', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Property from Frontend',
        description: 'This is a test property created via frontend tests',
        pricePerNight: 250,
        cleaningFee: 50,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        address: '789 Test Ave',
        city: 'Test City',
        country: 'Test Country',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: ['WiFi', 'Kitchen', 'Parking'],
        propertyType: 'Apartment',
        images: ['https://via.placeholder.com/800'],
      }),
    });

    const passed = result.ok && result.data?.id;
    logTest('Create property', passed, result.data?.title);

    if (passed) {
      const createdPropertyId = result.data.id;
      console.log('  Created property ID:', createdPropertyId);
      console.log('  Property details:', {
        title: result.data.title,
        city: result.data.city,
        price: result.data.pricePerNight,
      });

      // Store for cleanup
      window.testCreatedPropertyId = createdPropertyId;
    }

    return passed;
  } catch (error) {
    logTest('Create property', false, error.message);
    return false;
  }
}

/**
 * Test 6: Get host listings
 */
async function testGetMyListings() {
  console.log('\n📝 Test 6: Get My Listings');

  if (!testToken) {
    logTest('Get my listings', false, 'Not authenticated (run test 4 first)');
    return false;
  }

  try {
    const result = await makeRequest('/properties/my-listings');

    const passed = result.ok && Array.isArray(result.data);
    logTest('Get my listings', passed, `Found ${result.data?.length || 0} listings`);

    if (passed && result.data.length > 0) {
      console.log('  Listings:', result.data.map(p => ({ id: p.id, title: p.title })));
    }

    return passed;
  } catch (error) {
    logTest('Get my listings', false, error.message);
    return false;
  }
}

/**
 * Test 7: Update property
 */
async function testUpdateProperty() {
  console.log('\n✏️ Test 7: Update Property');

  if (!testToken) {
    logTest('Update property', false, 'Not authenticated (run test 4 first)');
    return false;
  }

  if (!window.testCreatedPropertyId) {
    logTest('Update property', false, 'No property to update (run test 5 first)');
    return false;
  }

  try {
    const result = await makeRequest(`/properties/${window.testCreatedPropertyId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Test Property',
        pricePerNight: 300,
      }),
    });

    const passed = result.ok && result.data?.title === 'Updated Test Property';
    logTest('Update property', passed, result.data?.title);

    return passed;
  } catch (error) {
    logTest('Update property', false, error.message);
    return false;
  }
}

/**
 * Test 8: Delete property
 */
async function testDeleteProperty() {
  console.log('\n🗑️ Test 8: Delete Property');

  if (!testToken) {
    logTest('Delete property', false, 'Not authenticated (run test 4 first)');
    return false;
  }

  if (!window.testCreatedPropertyId) {
    logTest('Delete property', false, 'No property to delete (run test 5 first)');
    return false;
  }

  try {
    const result = await makeRequest(`/properties/${window.testCreatedPropertyId}`, {
      method: 'DELETE',
    });

    const passed = result.ok;
    logTest('Delete property', passed);

    if (passed) {
      console.log('  Property deleted successfully');
      delete window.testCreatedPropertyId;
    }

    return passed;
  } catch (error) {
    logTest('Delete property', false, error.message);
    return false;
  }
}

/**
 * Run all property tests
 */
async function runPropertyTests() {
  console.clear();
  console.log('🧪 Running Property Service Tests...');
  console.log('=====================================\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    testGetAllProperties,
    testGetPropertiesWithFilters,
    testGetPropertyById,
    testHostAuth,
    testCreateProperty,
    testGetMyListings,
    testUpdateProperty,
    testDeleteProperty,
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n=====================================');
  console.log('📊 Test Results:');
  console.log(`   Total: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  console.log('=====================================\n');

  return results;
}

/**
 * Run quick smoke test (just read operations)
 */
async function runQuickTest() {
  console.clear();
  console.log('⚡ Running Quick Smoke Test...\n');

  await testGetAllProperties();
  await testGetPropertyById();

  console.log('\n✅ Quick test complete!\n');
}

// Export for use in console
if (typeof window !== 'undefined') {
  window.runPropertyTests = runPropertyTests;
  window.runQuickTest = runQuickTest;

  console.log('💡 Property tests loaded!');
  console.log('   Run: runPropertyTests() - Full test suite');
  console.log('   Run: runQuickTest() - Quick smoke test');
}

// Export for Node.js (if using as module)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPropertyTests,
    runQuickTest,
  };
}

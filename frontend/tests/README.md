# Frontend Tests

This directory contains tests for the RoomBnB frontend application.

## Test Files

### 1. `property.http`
HTTP requests for manual API testing using REST Client extension in VSCode.

**How to use:**
1. Install "REST Client" extension in VSCode
2. Open `property.http`
3. Replace `@token` and `@propertyId` with actual values
4. Click "Send Request" above each endpoint

**Quick start:**
```
1. Run "Register as Host" request → Copy token from response
2. Update @token variable with copied token
3. Run "Get All Properties" → Copy a property ID
4. Update @propertyId variable
5. Now you can test all endpoints!
```

---

### 2. `property-service.test.js`
JavaScript tests that can be run in the browser console.

**How to use:**

#### Option A: Browser Console (Recommended)
1. Open http://localhost:5173 in browser
2. Open DevTools (F12) → Console tab
3. Copy the entire content of `property-service.test.js`
4. Paste into console and press Enter
5. Run tests:
   ```javascript
   // Full test suite (all 8 tests)
   await runPropertyTests()

   // Quick smoke test (2 basic tests)
   await runQuickTest()
   ```

#### Option B: Load via script tag
1. Add to `index.html` (for testing only):
   ```html
   <script src="/tests/property-service.test.js"></script>
   ```
2. Open browser console
3. Run: `await runPropertyTests()`

**Test coverage:**
- ✅ Get all properties
- ✅ Get properties with filters (city, price, search)
- ✅ Get property by ID
- ✅ Host authentication (register/login)
- ✅ Create property
- ✅ Get my listings
- ✅ Update property
- ✅ Delete property

**Example output:**
```
🧪 Running Property Service Tests...
=====================================

📋 Test 1: Get All Properties
✅ Get all properties: Found 3 properties

🔍 Test 2: Get Properties with Filters
✅ Filter by city: Found 1 properties in New York
✅ Filter by price range: Found 2 properties $100-$500
✅ Search properties: Found 1 properties matching "apartment"

... (more tests)

=====================================
📊 Test Results:
   Total: 8
   ✅ Passed: 8
   ❌ Failed: 0
   Success Rate: 100%
=====================================
```

---

### 3. `property.test.md`
Comprehensive manual testing guide with step-by-step instructions.

**How to use:**
1. Open `property.test.md` in any markdown viewer
2. Follow the test scenarios step by step
3. Check expected results vs actual results
4. Use the troubleshooting section if issues occur

**Covers:**
- View properties on home page
- View property details
- Filter properties by category
- Property booking flow
- Create property (when implemented)
- View my bookings
- Edit/delete property (when implemented)
- API integration tests
- Browser DevTools testing
- Common issues & solutions
- Performance testing
- Accessibility testing

---

## Quick Start

### For Developers

**1. Run backend tests first:**
```bash
cd backend
npm test
# or
bash scripts/test-property.sh
```

**2. Manual frontend testing:**
```bash
# Open browser to http://localhost:5173
# Follow property.test.md guide
```

**3. Browser console tests:**
```bash
# Open browser console (F12)
# Copy/paste property-service.test.js
# Run: await runPropertyTests()
```

---

## Test Data Setup

Before testing, ensure you have test data:

**Option 1: Using backend scripts**
```bash
cd backend
bash scripts/test-property.sh  # Creates host + property
bash scripts/test-booking.sh   # Creates guest + booking
```

**Option 2: Using Prisma Studio**
```
Open http://localhost:5555
Manually create users and properties
```

**Option 3: Using frontend registration**
```
1. Go to http://localhost:5173/register
2. Register as host (isHost: true via API)
3. Create properties via frontend (when implemented)
```

---

## Test Credentials

After running test scripts, you'll have these users:

**Host (from test-property.sh):**
- Email: `host-{timestamp}@example.com`
- Password: `HostPass123!`
- Can create/edit/delete properties

**Guest (from test-booking.sh):**
- Email: `guest-{timestamp}@example.com`
- Password: `GuestPass123!`
- Can view and book properties

**Note:** `{timestamp}` is replaced with actual Unix timestamp when created.

---

## Testing Checklist

### Core Features
- [ ] Home page loads properties
- [ ] Property detail page displays correctly
- [ ] Property filtering (UI only for now)
- [ ] User registration works
- [ ] User login works
- [ ] Booking creation works
- [ ] Booking cancellation works
- [ ] My Bookings page displays correctly
- [ ] Navigation between pages works
- [ ] Logout clears auth state

### API Integration
- [ ] GET /properties returns data
- [ ] GET /properties/:id returns property
- [ ] POST /auth/register creates user
- [ ] POST /auth/login returns token
- [ ] POST /bookings creates booking
- [ ] GET /bookings/guest returns user bookings
- [ ] PUT /bookings/:id/cancel cancels booking

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Form validation works
- [ ] 401 errors redirect to login
- [ ] 404 errors show not found page
- [ ] Loading states display correctly

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading spinners show during async operations
- [ ] Success messages appear after actions
- [ ] Error messages are clear and helpful
- [ ] Buttons disable during loading
- [ ] Forms clear after successful submission

---

## Common Issues

### Issue: Tests fail with "Network Error"

**Cause:** Frontend can't reach backend

**Fix:**
1. Check backend is running: `docker ps`
2. Check `.env` file exists with `VITE_API_URL=http://localhost:5000/api`
3. Restart frontend: `docker-compose -f docker-compose.dev.yml restart frontend`

### Issue: "No properties found"

**Cause:** Database is empty

**Fix:**
```bash
cd backend
bash scripts/test-property.sh
```

### Issue: "Authentication required"

**Cause:** Not logged in or token expired

**Fix:**
1. Register new user or login
2. Check token in localStorage: `localStorage.getItem('roombnb_token')`
3. If expired, logout and login again

### Issue: CORS errors

**Cause:** Backend not configured for frontend origin

**Fix:**
1. Check backend CORS settings in `backend/src/index.ts`
2. Ensure `http://localhost:5173` is allowed
3. Restart backend

---

## Adding New Tests

### 1. HTTP Tests
Add new requests to `property.http`:
```http
### Test Name
METHOD {{baseUrl}}/endpoint
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "field": "value"
}
```

### 2. JavaScript Tests
Add new test function to `property-service.test.js`:
```javascript
async function testNewFeature() {
  console.log('\n📋 Test X: New Feature');
  try {
    const result = await makeRequest('/endpoint');
    const passed = result.ok && result.data;
    logTest('New feature test', passed);
    return passed;
  } catch (error) {
    logTest('New feature test', false, error.message);
    return false;
  }
}

// Add to tests array in runPropertyTests()
```

### 3. Manual Tests
Add new section to `property.test.md`:
```markdown
### X. New Feature Test

**Steps:**
1. Step one
2. Step two

**Expected Result:**
- What should happen

**Error Cases:**
- Possible errors
```

---

## Future Improvements

### Automated Testing
- [ ] Set up Vitest
- [ ] Add React Testing Library
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Set up CI/CD with tests

### E2E Testing
- [ ] Set up Playwright or Cypress
- [ ] Write E2E test scenarios
- [ ] Add visual regression testing

### Performance Testing
- [ ] Add Lighthouse CI
- [ ] Monitor bundle size
- [ ] Track API response times
- [ ] Set performance budgets

---

## Resources

- [Backend Tests](../../backend/tests/README.md)
- [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

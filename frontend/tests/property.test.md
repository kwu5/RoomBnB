# Frontend Property Testing Guide

This guide helps you manually test the property functionality in the frontend.

## Prerequisites

1. Backend should be running on `http://localhost:5000`
2. Frontend should be running on `http://localhost:5173`
3. Database should have at least one property (run `backend/scripts/test-property.sh`)

## Test Scenarios

### 1. View Properties on Home Page

**Steps:**
1. Navigate to `http://localhost:5173`
2. Wait for properties to load

**Expected Result:**
- Loading spinner appears briefly
- Property cards display with:
  - Property image
  - Title
  - Location (City, Country)
  - Price per night
  - Rating (if available)
- No error messages

**Error Cases:**
- "Error loading properties" → Check backend connection
- Empty state → No properties in database

---

### 2. View Property Details

**Steps:**
1. From home page, click on any property card
2. Wait for property details to load

**Expected Result:**
- Property detail page displays:
  - Image gallery (main + 4 secondary images)
  - Property title and location
  - Host information
  - Property details (bedrooms, bathrooms, guests)
  - Description
  - Amenities list
  - Booking widget with:
    - Price per night
    - Date pickers (check-in/check-out)
    - Guest selector
    - Price breakdown
    - Reserve button

**Error Cases:**
- "Error loading property" → Property not found or backend issue
- Redirects to home → Invalid property ID

---

### 3. Filter Properties by Category

**Steps:**
1. On home page, click a category filter (Beach, Mountains, City, etc.)
2. Observe the selected state

**Expected Result:**
- Selected category has pink/red background
- Other categories have white background

**Known Limitation:**
- Category filtering is not yet implemented (UI only)
- Properties list doesn't change when clicking categories

---

### 4. Property Booking Flow (Requires Authentication)

#### 4.1. Book as Guest (Not Logged In)

**Steps:**
1. Go to any property detail page
2. Select check-in and check-out dates
3. Select number of guests
4. Click "Log in to book" button

**Expected Result:**
- Redirects to login page
- After login, returns to home (booking state lost)

**Improvement Needed:**
- Should redirect back to property page after login

#### 4.2. Book as Logged-In User

**Setup:**
1. Register/Login as a user (not host)
2. Navigate to property detail page

**Steps:**
1. Select check-in date (must be future date)
2. Select check-out date (must be after check-in)
3. Select number of guests (1 to maxGuests)
4. Click "Reserve" button
5. Wait for confirmation

**Expected Result:**
- Button shows "Processing..." during booking
- On success:
  - Green success message: "Booking confirmed!"
  - "Redirecting to home page..." message
  - Redirects to home after 2 seconds
- On error:
  - Red error message displays
  - Specific error reason shown

**Error Cases:**
- "Check-in date must be in the future" → Selected past date
- "Check-out must be after check-in" → Invalid date range
- "Property not available for selected dates" → Booking conflict
- "Number of guests exceeds maximum allowed" → Too many guests

---

### 5. Create Property (Host Only)

**Status:** 🚧 Not Yet Implemented

**Planned Flow:**
1. Login as host (isHost: true)
2. Click "RoomBnB your home" button
3. Fill out property creation form
4. Submit form
5. Property appears in "My Listings"

**Current State:**
- "RoomBnB your home" button exists but does nothing
- No create property page yet

---

### 6. View My Bookings

**Setup:**
1. Login as user who has made bookings
2. Click user menu → "My Trips"

**Expected Result:**
- Redirects to `/my-bookings`
- Shows list of bookings with:
  - Property image and details
  - Booking dates and nights
  - Number of guests
  - Total price
  - Status badge (pending, confirmed, cancelled, completed)
  - Action buttons (Cancel, View Property)

**Filter Tabs:**
- All Bookings → Shows all
- Upcoming → Future bookings only
- Past → Completed bookings
- Cancelled → Cancelled bookings

**Actions:**
- Click property image/title → Go to property detail
- Click "Cancel Booking" → Confirms cancellation (only for upcoming)
- Click "View Property" → Go to property detail

**Empty State:**
- Shows "No bookings found" message
- "Explore Properties" button redirects to home

---

### 7. Edit/Delete Property (Owner Only)

**Status:** 🚧 Not Yet Implemented

**Planned Flow:**
1. Login as host
2. Navigate to "My Listings"
3. Click "Edit" on a property
4. Update property details
5. Save changes

**Current State:**
- No My Listings page yet
- No edit/delete functionality

---

## API Integration Tests

### Test Property Service Functions

Open browser console (F12) and run:

```javascript
// Test 1: Get all properties
const props = await propertyService.getProperties();
console.log('Properties:', props);

// Test 2: Get properties with filters
const filtered = await propertyService.getProperties({
  city: 'New York',
  minPrice: 100,
  maxPrice: 500
});
console.log('Filtered:', filtered);

// Test 3: Get property by ID
const property = await propertyService.getPropertyById('YOUR_PROPERTY_ID');
console.log('Property:', property);

// Test 4: Search properties
const results = await propertyService.getProperties({ search: 'luxury' });
console.log('Search results:', results);
```

---

## Browser DevTools Testing

### Check Network Requests

1. Open DevTools (F12) → Network tab
2. Perform action (e.g., load home page)
3. Check for:
   - Request to `/api/properties`
   - Status: 200 OK
   - Response: JSON with property data

### Check Console Errors

1. Open DevTools (F12) → Console tab
2. Look for:
   - Red errors → Fix immediately
   - Yellow warnings → Check if important
   - Network errors → Backend connection issue

### Check Application State

1. Open DevTools (F12) → Application tab
2. Check Local Storage:
   - `roombnb_token` → JWT token (if logged in)
   - `roombnb_user` → User data (if logged in)

---

## Common Issues & Solutions

### Issue: "Error loading properties"

**Causes:**
- Backend not running
- Frontend can't connect to backend
- Missing `.env` file in frontend

**Solutions:**
1. Check backend is running: `docker ps`
2. Verify `.env` file exists: `frontend/.env`
3. Check `VITE_API_URL=http://localhost:5000/api`
4. Restart frontend: `docker-compose -f docker-compose.dev.yml restart frontend`

### Issue: Properties not showing

**Causes:**
- Database has no properties
- API returns empty array

**Solutions:**
1. Run property test script: `bash backend/scripts/test-property.sh`
2. Check database: Open Prisma Studio at `http://localhost:5555`

### Issue: Login/Register not working

**Causes:**
- Backend auth service issue
- Invalid credentials
- Network error

**Solutions:**
1. Check browser console for errors
2. Check backend logs: `docker logs roombnb-backend-dev`
3. Verify email format is valid
4. Verify password meets requirements (6+ chars for backend, 8+ with complexity for frontend)

### Issue: Booking fails

**Causes:**
- Invalid dates
- Property not available
- Not authenticated
- Too many guests

**Solutions:**
1. Check error message for specific reason
2. Verify dates are valid
3. Check if logged in
4. Verify guest count ≤ maxGuests

---

## Performance Testing

### Load Time
- Home page should load in < 2 seconds
- Property detail should load in < 1 second
- Booking creation should complete in < 1 second

### Measure in DevTools:
1. F12 → Network tab
2. Disable cache
3. Reload page
4. Check "Load" time at bottom

---

## Accessibility Testing

### Keyboard Navigation
- Tab through elements
- Enter to click buttons
- Escape to close modals

### Screen Reader
- Use NVDA/JAWS to test
- All images should have alt text
- Form inputs should have labels

---

## Checklist

- [ ] Properties load on home page
- [ ] Property detail page displays correctly
- [ ] Category selection changes visual state
- [ ] Booking widget calculates price correctly
- [ ] Date validation works (future dates, check-out after check-in)
- [ ] Guest count limited by maxGuests
- [ ] Login required for booking
- [ ] Booking success shows confirmation
- [ ] Booking errors show specific messages
- [ ] My Bookings page displays user's bookings
- [ ] Booking filters work (All/Upcoming/Past/Cancelled)
- [ ] Cancel booking works for upcoming bookings
- [ ] Navigation works (Home, Login, Register, Property Detail, My Bookings)

---

## Next Features to Test (When Implemented)

- [ ] Create Property page
- [ ] My Listings page
- [ ] Edit Property page
- [ ] Delete Property functionality
- [ ] Category filtering (backend integration)
- [ ] Search functionality
- [ ] Favorites/Wishlist
- [ ] User profile page
- [ ] Reviews system

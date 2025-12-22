import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import routes from '../src/routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { hashPassword } from '../src/utils/password';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

const prisma = new PrismaClient();

describe('Booking API', () => {
  let hostToken: string;
  let guestToken: string;
  let hostId: string;
  let guestId: string;
  let propertyId: string;
  let bookingId: string;

  const testHost = {
    email: 'bookinghost-' + Date.now() + '@example.com',
    password: 'HostPass123!',
    firstName: 'Booking',
    lastName: 'Host',
  };

  const testGuest = {
    email: 'bookingguest-' + Date.now() + '@example.com',
    password: 'GuestPass123!',
    firstName: 'Booking',
    lastName: 'Guest',
  };

  const testProperty = {
    title: 'Booking Test Property',
    description: 'A property for testing bookings',
    pricePerNight: 200,
    cleaningFee: 40,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    address: '789 Booking St',
    city: 'Test City',
    country: 'Test Country',
    propertyType: 'Apartment',
    images: ['https://example.com/booking-test.jpg'],
  };

  // Setup
  beforeAll(async () => {
    // Create host
    const hashedHostPassword = await hashPassword(testHost.password);
    const host = await prisma.user.create({
      data: {
        ...testHost,
        password: hashedHostPassword,
        isHost: true,
      },
    });
    hostId = host.id;

    const hostLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testHost.email, password: testHost.password });
    hostToken = hostLoginResponse.body.data.token;

    // Create guest
    const hashedGuestPassword = await hashPassword(testGuest.password);
    const guest = await prisma.user.create({
      data: {
        ...testGuest,
        password: hashedGuestPassword,
        isHost: false,
      },
    });
    guestId = guest.id;

    const guestLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testGuest.email, password: testGuest.password });
    guestToken = guestLoginResponse.body.data.token;

    // Create property
    const property = await prisma.property.create({
      data: {
        ...testProperty,
        hostId,
      },
    });
    propertyId = property.id;
  });

  // Cleanup
  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { guestId } });
    await prisma.property.deleteMany({ where: { hostId } });
    await prisma.user.deleteMany({
      where: { id: { in: [hostId, guestId] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);

      const bookingData = {
        propertyId,
        checkIn: tomorrow.toISOString(),
        checkOut: dayAfter.toISOString(),
        numberOfGuests: 2,
        specialRequests: 'Late check-in',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Booking created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.numberOfGuests).toBe(2);
      expect(response.body.data.guestId).toBe(guestId);
      expect(response.body.data.propertyId).toBe(propertyId);

      bookingId = response.body.data.id;
    });

    it('should reject booking without authentication', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 10);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 12);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          propertyId,
          checkIn: tomorrow.toISOString(),
          checkOut: dayAfter.toISOString(),
          numberOfGuests: 2,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should reject booking with invalid dates (checkout before checkin)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 20);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() + 18);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId,
          checkIn: tomorrow.toISOString(),
          checkOut: yesterday.toISOString(),
          numberOfGuests: 2,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Check-out must be after check-in');
    });

    it('should reject booking with too many guests', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 32);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId,
          checkIn: tomorrow.toISOString(),
          checkOut: dayAfter.toISOString(),
          numberOfGuests: 100,
        })
        .expect(400);

      expect(response.body.message).toContain('guests allowed');
    });

    it('should reject booking for non-existent property', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 40);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 42);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: 'non-existent-property-id',
          checkIn: tomorrow.toISOString(),
          checkOut: dayAfter.toISOString(),
          numberOfGuests: 2,
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Property not found');
    });

    it('should reject conflicting bookings', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId,
          checkIn: tomorrow.toISOString(),
          checkOut: dayAfter.toISOString(),
          numberOfGuests: 2,
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        'message',
        'Property not available for selected dates'
      );
    });
  });

  describe('GET /api/bookings/guest', () => {
    it('should get guest bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/guest')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('property');
      expect(response.body.data[0].guestId).toBe(guestId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/guest')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/bookings/host', () => {
    it('should get host bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/host')
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('property');
      expect(response.body.data[0]).toHaveProperty('guest');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/host')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get booking by id', async () => {
      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', bookingId);
      expect(response.body.data).toHaveProperty('property');
      expect(response.body.data).toHaveProperty('guest');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should reject request from unauthorized user', async () => {
      // Create another guest
      const anotherGuest = await prisma.user.create({
        data: {
          email: 'another-' + Date.now() + '@example.com',
          password: await hashPassword('password123'),
          firstName: 'Another',
          lastName: 'Guest',
        },
      });

      const anotherGuestLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: anotherGuest.email, password: 'password123' });

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${anotherGuestLogin.body.data.token}`)
        .expect(403);

      expect(response.body).toHaveProperty(
        'message',
        'Not authorized to view this booking'
      );

      await prisma.user.delete({ where: { id: anotherGuest.id } });
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/non-existent-id')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Booking not found');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should reject cancel without authentication', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should cancel booking as guest', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Booking cancelled successfully');
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should reject cancelling already cancelled booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Booking already cancelled');
    });

    it('should return 404 when cancelling non-existent booking', async () => {
      const response = await request(app)
        .put('/api/bookings/non-existent-id/cancel')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Booking not found');
    });
  });
});

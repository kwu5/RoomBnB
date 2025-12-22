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

describe('Property API', () => {
  let hostToken: string;
  let guestToken: string;
  let hostId: string;
  let guestId: string;
  let propertyId: string;

  const testHost = {
    email: 'host-' + Date.now() + '@example.com',
    password: 'HostPass123!',
    firstName: 'Property',
    lastName: 'Host',
  };

  const testGuest = {
    email: 'guest-' + Date.now() + '@example.com',
    password: 'GuestPass123!',
    firstName: 'Regular',
    lastName: 'Guest',
  };

  const testProperty = {
    title: 'Test Apartment',
    description: 'A test property for automated testing',
    pricePerNight: 150,
    cleaningFee: 50,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    address: '123 Test Street',
    city: 'Test City',
    country: 'Test Country',
    latitude: 40.7128,
    longitude: -74.0060,
    amenities: ['WiFi', 'Kitchen'],
    propertyType: 'Apartment',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  };

  // Setup: Create host and guest users
  beforeAll(async () => {
    // Create host user
    const hashedPassword = await hashPassword(testHost.password);
    const host = await prisma.user.create({
      data: {
        ...testHost,
        password: hashedPassword,
        isHost: true,
      },
    });
    hostId = host.id;

    // Get host token
    const hostLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testHost.email, password: testHost.password });
    hostToken = hostLoginResponse.body.data.token;

    // Create guest user
    const guestHashedPassword = await hashPassword(testGuest.password);
    const guest = await prisma.user.create({
      data: {
        ...testGuest,
        password: guestHashedPassword,
        isHost: false,
      },
    });
    guestId = guest.id;

    // Get guest token
    const guestLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: testGuest.email, password: testGuest.password });
    guestToken = guestLoginResponse.body.data.token;
  });

  // Cleanup
  afterAll(async () => {
    await prisma.property.deleteMany({ where: { hostId } });
    await prisma.user.deleteMany({
      where: { id: { in: [hostId, guestId] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/properties', () => {
    it('should create a new property as host', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(testProperty)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Property created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(testProperty.title);
      expect(response.body.data.pricePerNight).toBe(testProperty.pricePerNight);
      expect(response.body.data.hostId).toBe(hostId);

      propertyId = response.body.data.id;
    });

    it('should reject property creation without host privileges', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(testProperty)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Host privileges required');
    });

    it('should reject property creation without authentication', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send(testProperty)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should reject property with missing required fields', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'Incomplete Property',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should reject property with negative price', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          ...testProperty,
          pricePerNight: -100,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should reject property with no images', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          ...testProperty,
          images: [],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('GET /api/properties', () => {
    it('should get all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('averageRating');
    });

    it('should filter properties by city', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ city: testProperty.city })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((property: any) => {
        expect(property.city.toLowerCase()).toContain(
          testProperty.city.toLowerCase()
        );
      });
    });

    it('should filter properties by price range', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ minPrice: 100, maxPrice: 200 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((property: any) => {
        expect(property.pricePerNight).toBeGreaterThanOrEqual(100);
        expect(property.pricePerNight).toBeLessThanOrEqual(200);
      });
    });

    it('should filter properties by bedrooms', async () => {
      const response = await request(app)
        .get('/api/properties')
        .query({ bedrooms: 2 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((property: any) => {
        expect(property.bedrooms).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get property by id', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', propertyId);
      expect(response.body.data).toHaveProperty('title', testProperty.title);
      expect(response.body.data).toHaveProperty('host');
      expect(response.body.data.host.id).toBe(hostId);
      expect(response.body.data).toHaveProperty('reviews');
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/non-existent-id-12345')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Property not found');
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update property as owner', async () => {
      const updates = {
        title: 'Updated Test Apartment',
        pricePerNight: 200,
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Property updated successfully');
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.pricePerNight).toBe(updates.pricePerNight);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .send({ title: 'Should Fail' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should reject update by non-owner', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ title: 'Should Fail' })
        .expect(403);

      expect(response.body).toHaveProperty(
        'message',
        'Not authorized to update this property'
      );
    });

    it('should return 404 when updating non-existent property', async () => {
      const response = await request(app)
        .put('/api/properties/non-existent-id')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ title: 'Should Fail' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Property not found');
    });
  });

  describe('GET /api/properties/host/properties', () => {
    it('should get host properties', async () => {
      const response = await request(app)
        .get('/api/properties/host/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((property: any) => {
        expect(property.hostId).toBe(hostId);
      });
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/properties/host/properties')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should reject delete by non-owner', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body).toHaveProperty(
        'message',
        'Not authorized to delete this property'
      );
    });

    it('should delete property as owner', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Property deleted successfully');

      // Verify property is marked as inactive
      const deletedProperty = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      expect(deletedProperty?.isActive).toBe(false);
    });

    it('should return 404 when deleting non-existent property', async () => {
      const response = await request(app)
        .delete('/api/properties/non-existent-id')
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Property not found');
    });
  });
});

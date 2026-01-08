import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order to respect foreign keys)
  console.log('🗑️  Clearing existing data...');
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.host@roombnb.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        isHost: true,
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.host@roombnb.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Smith',
        phone: '+1-555-0102',
        isHost: true,
        avatar: 'https://i.pravatar.cc/150?img=47',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.guest@roombnb.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1-555-0201',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.guest@roombnb.com',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1-555-0202',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=44',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Properties
  console.log('🏠 Creating properties...');
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Luxury Beachfront Villa',
        description: 'Stunning oceanfront villa with panoramic views, private pool, and direct beach access. Perfect for families or groups looking for a luxurious getaway.',
        pricePerNight: 450,
        cleaningFee: 100,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        address: '123 Ocean Drive',
        city: 'Miami',
        country: 'USA',
        latitude: 25.7617,
        longitude: -80.1918,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Kitchen', 'Parking', 'Air Conditioning'],
        propertyType: 'Villa',
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        ],
        hostId: users[0].id, // John
      },
    }),
    prisma.property.create({
      data: {
        title: 'Cozy Mountain Cabin',
        description: 'Rustic cabin nestled in the mountains with breathtaking views. Features a fireplace, hot tub, and hiking trails nearby.',
        pricePerNight: 180,
        cleaningFee: 50,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        address: '456 Pine Trail',
        city: 'Aspen',
        country: 'USA',
        latitude: 39.1911,
        longitude: -106.8175,
        amenities: ['WiFi', 'Fireplace', 'Hot Tub', 'Kitchen', 'Parking', 'Heating'],
        propertyType: 'Cabin',
        images: [
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
        ],
        hostId: users[0].id, // John
      },
    }),
    prisma.property.create({
      data: {
        title: 'Modern Downtown Loft',
        description: 'Stylish loft in the heart of the city. Walking distance to restaurants, shops, and entertainment. Perfect for business or leisure travelers.',
        pricePerNight: 220,
        cleaningFee: 75,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        address: '789 Main Street',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: ['WiFi', 'Gym', 'Elevator', 'Kitchen', 'Workspace', 'Air Conditioning'],
        propertyType: 'Apartment',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        ],
        hostId: users[1].id, // Sarah
      },
    }),
    prisma.property.create({
      data: {
        title: 'Charming Countryside Cottage',
        description: 'Peaceful cottage surrounded by nature. Ideal for a quiet retreat with beautiful garden and countryside views.',
        pricePerNight: 150,
        cleaningFee: 40,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        address: '321 Country Lane',
        city: 'Portland',
        country: 'USA',
        latitude: 45.5152,
        longitude: -122.6784,
        amenities: ['WiFi', 'Garden', 'Fireplace', 'Kitchen', 'Parking', 'Pet Friendly'],
        propertyType: 'House',
        images: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
        ],
        hostId: users[1].id, // Sarah
      },
    }),
    prisma.property.create({
      data: {
        title: 'Beachside Cottage',
        description: 'Cozy beachside cottage with stunning sunset views. Steps from the beach with outdoor patio and BBQ.',
        pricePerNight: 280,
        cleaningFee: 60,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        address: '567 Sunset Boulevard',
        city: 'San Diego',
        country: 'USA',
        latitude: 32.7157,
        longitude: -117.1611,
        amenities: ['WiFi', 'Beach Access', 'BBQ', 'Kitchen', 'Parking', 'Outdoor Seating'],
        propertyType: 'Cottage',
        images: [
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        ],
        hostId: users[1].id, // Sarah
      },
    }),
    prisma.property.create({
      data: {
        title: 'Industrial Artist Loft',
        description: 'Spacious industrial loft with exposed brick, high ceilings, and artistic vibes. Perfect for creatives and urban explorers.',
        pricePerNight: 195,
        cleaningFee: 55,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        address: '890 Arts District Way',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0407,
        longitude: -118.2351,
        amenities: ['WiFi', 'Workspace', 'Kitchen', 'Air Conditioning', 'Elevator', 'Gym'],
        propertyType: 'Loft',
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
        ],
        hostId: users[0].id, // John
      },
    }),
    prisma.property.create({
      data: {
        title: 'Historic Brownstone Townhouse',
        description: 'Elegant 3-story townhouse in a historic neighborhood. Features original hardwood floors, modern amenities, and a private garden.',
        pricePerNight: 320,
        cleaningFee: 85,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        address: '234 Heritage Row',
        city: 'Boston',
        country: 'USA',
        latitude: 42.3601,
        longitude: -71.0589,
        amenities: ['WiFi', 'Garden', 'Kitchen', 'Heating', 'Washer', 'Parking'],
        propertyType: 'Townhouse',
        images: [
          'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
          'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800',
        ],
        hostId: users[1].id, // Sarah
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // Create Bookings
  console.log('📅 Creating bookings...');
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        checkIn: new Date('2025-01-15'),
        checkOut: new Date('2025-01-20'),
        totalPrice: 2350, // 5 nights * 450 + 100 cleaning
        numberOfGuests: 6,
        specialRequests: 'Early check-in if possible',
        status: 'confirmed',
        propertyId: properties[0].id, // Luxury Villa
        guestId: users[2].id, // Mike
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date('2025-02-01'),
        checkOut: new Date('2025-02-05'),
        totalPrice: 770, // 4 nights * 180 + 50 cleaning
        numberOfGuests: 2,
        status: 'confirmed',
        propertyId: properties[1].id, // Mountain Cabin
        guestId: users[3].id, // Emma
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date('2024-12-10'),
        checkOut: new Date('2024-12-13'),
        totalPrice: 735, // 3 nights * 220 + 75 cleaning
        numberOfGuests: 3,
        status: 'completed',
        propertyId: properties[2].id, // Downtown Loft
        guestId: users[2].id, // Mike
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create Reviews
  console.log('⭐ Creating reviews...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Amazing experience! The loft was even better than the photos. Sarah was a wonderful host and very responsive. Would definitely stay here again!',
        propertyId: properties[2].id, // Downtown Loft
        userId: users[2].id, // Mike
        bookingId: bookings[2].id, // Completed booking
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create Favorites
  console.log('❤️  Creating favorites...');
  const favorites = await Promise.all([
    prisma.favorite.create({
      data: {
        userId: users[2].id, // Mike
        propertyId: properties[0].id, // Luxury Villa
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[2].id, // Mike
        propertyId: properties[3].id, // Countryside Cottage
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[3].id, // Emma
        propertyId: properties[0].id, // Luxury Villa
      },
    }),
  ]);

  console.log(`✅ Created ${favorites.length} favorites`);

  // Create Messages
  console.log('💬 Creating messages...');
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hi! I\'m interested in booking your villa for next month. Is it available?',
        conversationId: `${users[2].id}-${users[0].id}`,
        senderId: users[2].id, // Mike
        receiverId: users[0].id, // John
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hello! Yes, the villa is available. I\'d be happy to host you. When are you planning to visit?',
        conversationId: `${users[2].id}-${users[0].id}`,
        senderId: users[0].id, // John
        receiverId: users[2].id, // Mike
        isRead: true,
      },
    }),
  ]);

  console.log(`✅ Created ${messages.length} messages`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏠 Properties: ${properties.length}`);
  console.log(`   📅 Bookings: ${bookings.length}`);
  console.log(`   ⭐ Reviews: ${reviews.length}`);
  console.log(`   ❤️  Favorites: ${favorites.length}`);
  console.log(`   💬 Messages: ${messages.length}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Host: john.host@roombnb.com / password123');
  console.log('   Host: sarah.host@roombnb.com / password123');
  console.log('   Guest: mike.guest@roombnb.com / password123');
  console.log('   Guest: emma.guest@roombnb.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

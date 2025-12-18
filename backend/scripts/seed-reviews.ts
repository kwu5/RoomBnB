import prisma from '../src/config/database';
import bcrypt from 'bcryptjs';

/**
 * Seed script for Reviews System
 *
 * This script:
 * 1. Creates test users (guests and hosts)
 * 2. Creates test properties
 * 3. Creates completed bookings
 * 4. Creates reviews for those bookings
 *
 * Usage:
 *   ./tests/seed-reviews.sh
 *   or
 *   ./tests/seed-reviews.sh --clean
 */

const SAMPLE_REVIEWS = [
  {
    rating: 5,
    comment: "Amazing property! The place was exactly as described and even better in person. The host was very responsive and helpful. Would definitely book again!",
  },
  {
    rating: 4,
    comment: "Great location and beautiful property. Everything was clean and well-maintained. Only minor issue was the wifi was a bit slow, but overall a wonderful stay.",
  },
  {
    rating: 5,
    comment: "Absolutely perfect! The amenities were top-notch, the bed was incredibly comfortable, and the view was breathtaking. This exceeded all our expectations.",
  },
  {
    rating: 3,
    comment: "The property was nice but had a few issues. The AC wasn't working properly and it took a day to fix. Location was good though and the host tried their best to resolve issues quickly.",
  },
  {
    rating: 5,
    comment: "Best vacation rental we've ever had! Spacious, modern, and in a perfect location. The host left a welcome basket which was a nice touch. Highly recommend!",
  },
  {
    rating: 4,
    comment: "Very good experience overall. The property was clean and comfortable. Check-in process was smooth. Would stay here again when visiting the area.",
  },
  {
    rating: 5,
    comment: "Incredible stay! The photos don't do this place justice. Everything was perfect - from the design to the amenities to the location. Our family loved it!",
  },
  {
    rating: 4,
    comment: "Lovely property in a great neighborhood. The kitchen was well-equipped which made cooking easy. Bed was comfortable. Only wish there was a parking spot included.",
  },
];

async function seedReviews() {
  console.log('🌱 Starting Reviews System Seed...\n');

  try {
    // Step 1: Create or find test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create host user
    const host = await prisma.user.upsert({
      where: { email: 'host@test.com' },
      update: {},
      create: {
        email: 'host@test.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        isHost: true,
        phone: '+1234567890',
      },
    });
    console.log(`✅ Host created: ${host.firstName} ${host.lastName} (${host.email})`);

    // Create guest users
    const guestData = [
      { email: 'guest1@test.com', firstName: 'John', lastName: 'Smith' },
      { email: 'guest2@test.com', firstName: 'Emily', lastName: 'Davis' },
      { email: 'guest3@test.com', firstName: 'Michael', lastName: 'Brown' },
      { email: 'guest4@test.com', firstName: 'Jessica', lastName: 'Wilson' },
    ];

    const guests = [];
    for (const data of guestData) {
      const guest = await prisma.user.upsert({
        where: { email: data.email },
        update: {},
        create: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          isHost: false,
        },
      });
      guests.push(guest);
      console.log(`✅ Guest created: ${guest.firstName} ${guest.lastName} (${guest.email})`);
    }

    console.log(`\n📦 Total users: ${guests.length + 1} (1 host, ${guests.length} guests)\n`);

    // Step 2: Create test properties
    console.log('🏠 Creating test properties...');

    const propertyData = [
      {
        title: 'Luxury Downtown Apartment',
        description: 'Beautiful modern apartment in the heart of downtown. Walking distance to restaurants, shops, and entertainment.',
        pricePerNight: 150,
        cleaningFee: 50,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        address: '123 Main St',
        city: 'San Francisco',
        country: 'USA',
        propertyType: 'Apartment',
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Heating', 'TV', 'Washer'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        ],
      },
      {
        title: 'Cozy Beach House',
        description: 'Charming beach house with stunning ocean views. Perfect for a relaxing getaway.',
        pricePerNight: 200,
        cleaningFee: 75,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        address: '456 Ocean Dr',
        city: 'Malibu',
        country: 'USA',
        propertyType: 'House',
        amenities: ['WiFi', 'Kitchen', 'Beach Access', 'Parking', 'Deck', 'BBQ Grill'],
        images: [
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        ],
      },
    ];

    const properties = [];
    for (const data of propertyData) {
      const property = await prisma.property.create({
        data: {
          ...data,
          hostId: host.id,
        },
      });
      properties.push(property);
      console.log(`✅ Property created: ${property.title} ($${property.pricePerNight}/night)`);
    }

    console.log(`\n📦 Total properties: ${properties.length}\n`);

    // Step 3: Create completed bookings
    console.log('📅 Creating completed bookings...');

    const bookings = [];
    let bookingIndex = 0;

    for (const property of properties) {
      // Create 4 bookings per property (one for each guest)
      for (let i = 0; i < Math.min(guests.length, 4); i++) {
        const guest = guests[i];
        const daysAgo = 30 + (bookingIndex * 10); // Stagger past dates
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() - daysAgo);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3); // 3 night stay

        const nights = 3;
        const totalPrice = nights * property.pricePerNight + property.cleaningFee;

        const booking = await prisma.booking.create({
          data: {
            propertyId: property.id,
            guestId: guest.id,
            checkIn,
            checkOut,
            numberOfGuests: 2,
            totalPrice,
            status: 'completed', // Important: Must be completed for reviews
          },
        });

        bookings.push({ booking, guest, property });
        console.log(
          `✅ Booking created: ${guest.firstName} ${guest.lastName} → ${property.title} (${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()})`
        );
        bookingIndex++;
      }
    }

    console.log(`\n📦 Total bookings: ${bookings.length}\n`);

    // Step 4: Create reviews
    console.log('⭐ Creating reviews...');

    const reviews = [];
    for (let i = 0; i < bookings.length; i++) {
      const { booking, guest, property } = bookings[i];
      const reviewTemplate = SAMPLE_REVIEWS[i % SAMPLE_REVIEWS.length];

      const review = await prisma.review.create({
        data: {
          userId: guest.id,
          propertyId: property.id,
          bookingId: booking.id,
          rating: reviewTemplate.rating,
          comment: reviewTemplate.comment,
          createdAt: new Date(booking.checkOut.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after checkout
        },
      });

      reviews.push(review);
      console.log(
        `✅ Review created: ${guest.firstName} ${guest.lastName} gave ${review.rating}⭐ to "${property.title}"`
      );
    }

    console.log(`\n📦 Total reviews: ${reviews.length}\n`);

    // Step 5: Display summary statistics
    console.log('📊 Summary Statistics:\n');

    for (const property of properties) {
      const propertyReviews = await prisma.review.findMany({
        where: { propertyId: property.id },
        select: { rating: true },
      });

      const avgRating = propertyReviews.length > 0
        ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length
        : 0;

      console.log(`🏠 ${property.title}`);
      console.log(`   - Reviews: ${propertyReviews.length}`);
      console.log(`   - Average Rating: ${avgRating.toFixed(1)}⭐`);
      console.log(`   - Bookings: ${bookings.filter(b => b.property.id === property.id).length}`);
      console.log('');
    }

    console.log('✨ Seed completed successfully!\n');
    console.log('🔑 Test User Credentials:');
    console.log('   Host: host@test.com / Password123!');
    console.log('   Guests: guest1@test.com, guest2@test.com, etc. / Password123!\n');
    console.log('🧪 You can now test:');
    console.log('   1. View reviews on property detail pages');
    console.log('   2. Filter and sort reviews');
    console.log('   3. Create new reviews as authenticated users');
    console.log('   4. Update/delete reviews');
    console.log('   5. Check review permissions\n');

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Clean existing review data
async function cleanReviews() {
  console.log('🧹 Cleaning existing review data...\n');

  try {
    const deleted = await prisma.review.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} existing reviews\n`);
  } catch (error) {
    console.error('❌ Error cleaning reviews:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  if (shouldClean) {
    await cleanReviews();
  }

  await seedReviews();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

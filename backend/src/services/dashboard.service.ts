import prisma from '../config/database';

export interface GuestDashboard {
  upcomingTrips: any[];
  pastTrips: any[];
  pendingReviews: any[];
  favoriteCount: number;
  totalTrips: number;
}

export interface HostDashboard {
  totalListings: number;
  activeListings: number;
  pendingBookings: any[];
  upcomingBookings: any[];
  recentBookings: any[];
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingGuestReviews: any[];
  averageRating: number | null;
  totalReviews: number;
}

export class DashboardService {
  async getGuestDashboard(userId: string): Promise<GuestDashboard> {
    const now = new Date();

    // Get upcoming trips
    const upcomingTrips = await prisma.booking.findMany({
      where: {
        guestId: userId,
        status: { in: ['confirmed', 'pending'] },
        checkIn: { gte: now },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
      },
      orderBy: { checkIn: 'asc' },
      take: 5,
    });

    // Get past trips
    const pastTrips = await prisma.booking.findMany({
      where: {
        guestId: userId,
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
        review: true,
      },
      orderBy: { checkOut: 'desc' },
      take: 5,
    });

    // Get trips that need reviews
    const pendingReviews = await prisma.booking.findMany({
      where: {
        guestId: userId,
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
        review: null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { checkOut: 'desc' },
      take: 5,
    });

    // Get favorite count
    const favoriteCount = await prisma.favorite.count({
      where: { userId },
    });

    // Get total trips
    const totalTrips = await prisma.booking.count({
      where: {
        guestId: userId,
        status: { in: ['confirmed', 'completed'] },
      },
    });

    return {
      upcomingTrips,
      pastTrips,
      pendingReviews,
      favoriteCount,
      totalTrips,
    };
  }

  async getHostDashboard(hostId: string): Promise<HostDashboard> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get properties
    const properties = await prisma.property.findMany({
      where: { hostId },
      select: { id: true, isActive: true },
    });

    const propertyIds = properties.map((p) => p.id);
    const totalListings = properties.length;
    const activeListings = properties.filter((p) => p.isActive).length;

    // Get pending bookings
    const pendingBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: 'pending',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get upcoming confirmed bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        status: 'confirmed',
        checkIn: { gte: now },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkIn: 'asc' },
      take: 5,
    });

    // Get recent completed bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkOut: 'desc' },
      take: 5,
    });

    // Total earnings
    const totalEarningsResult = await prisma.booking.aggregate({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
      },
      _sum: { totalPrice: true },
    });

    // This month's earnings
    const thisMonthEarningsResult = await prisma.booking.aggregate({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
        checkIn: { gte: thisMonthStart },
      },
      _sum: { totalPrice: true },
    });

    // Completed bookings without guest review
    const pendingGuestReviews = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
        guestReview: null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkOut: 'desc' },
      take: 5,
    });

    // Get average rating and total reviews
    const reviews = await prisma.review.findMany({
      where: {
        propertyId: { in: propertyIds },
      },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : null;

    return {
      totalListings,
      activeListings,
      pendingBookings,
      upcomingBookings,
      recentBookings,
      totalEarnings: totalEarningsResult._sum.totalPrice || 0,
      thisMonthEarnings: thisMonthEarningsResult._sum.totalPrice || 0,
      pendingGuestReviews,
      averageRating,
      totalReviews,
    };
  }
}

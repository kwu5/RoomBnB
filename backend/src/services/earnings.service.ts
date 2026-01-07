import prisma from '../config/database';

export interface EarningsSummary {
  totalEarnings: number;
  totalBookings: number;
  completedBookings: number;
  averageBookingValue: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  percentageChange: number;
}

export interface MonthlyEarnings {
  month: number;
  year: number;
  earnings: number;
  bookings: number;
}

export interface PropertyEarnings {
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  totalEarnings: number;
  bookingCount: number;
  averageRating: number | null;
}

export interface OccupancyData {
  propertyId: string;
  propertyTitle: string;
  occupancyRate: number;
  totalDaysBooked: number;
  periodDays: number;
}

export class EarningsService {
  async getSummary(hostId: string): Promise<EarningsSummary> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all completed bookings for host's properties
    const properties = await prisma.property.findMany({
      where: { hostId },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);

    // Total earnings (completed bookings)
    const totalStats = await prisma.booking.aggregate({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
      },
      _sum: { totalPrice: true },
      _count: true,
    });

    // This month's earnings
    const thisMonthStats = await prisma.booking.aggregate({
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

    // Last month's earnings
    const lastMonthStats = await prisma.booking.aggregate({
      where: {
        propertyId: { in: propertyIds },
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
        checkIn: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalPrice: true },
    });

    const totalEarnings = totalStats._sum.totalPrice || 0;
    const totalBookings = totalStats._count || 0;
    const thisMonthEarnings = thisMonthStats._sum.totalPrice || 0;
    const lastMonthEarnings = lastMonthStats._sum.totalPrice || 0;

    const percentageChange =
      lastMonthEarnings > 0
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
        : thisMonthEarnings > 0
        ? 100
        : 0;

    return {
      totalEarnings,
      totalBookings,
      completedBookings: totalBookings,
      averageBookingValue: totalBookings > 0 ? totalEarnings / totalBookings : 0,
      thisMonthEarnings,
      lastMonthEarnings,
      percentageChange: Math.round(percentageChange * 10) / 10,
    };
  }

  async getMonthlyEarnings(hostId: string, year: number): Promise<MonthlyEarnings[]> {
    const properties = await prisma.property.findMany({
      where: { hostId },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);
    const now = new Date();

    const monthlyData: MonthlyEarnings[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      // Skip future months
      if (monthStart > now) continue;

      const stats = await prisma.booking.aggregate({
        where: {
          propertyId: { in: propertyIds },
          OR: [
            { status: 'completed' },
            { status: 'confirmed', checkOut: { lt: now } },
          ],
          checkIn: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalPrice: true },
        _count: true,
      });

      monthlyData.push({
        month: month + 1,
        year,
        earnings: stats._sum.totalPrice || 0,
        bookings: stats._count || 0,
      });
    }

    return monthlyData;
  }

  async getEarningsByProperty(hostId: string): Promise<PropertyEarnings[]> {
    const now = new Date();

    const properties = await prisma.property.findMany({
      where: { hostId },
      include: {
        bookings: {
          where: {
            OR: [
              { status: 'completed' },
              { status: 'confirmed', checkOut: { lt: now } },
            ],
          },
          select: { totalPrice: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    return properties.map((property) => {
      const totalEarnings = property.bookings.reduce(
        (sum, b) => sum + b.totalPrice,
        0
      );
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum, r) => sum + r.rating, 0) /
            property.reviews.length
          : null;

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images[0] || '',
        totalEarnings,
        bookingCount: property.bookings.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      };
    }).sort((a, b) => b.totalEarnings - a.totalEarnings);
  }

  async getOccupancyRates(hostId: string, days: number = 90): Promise<OccupancyData[]> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const properties = await prisma.property.findMany({
      where: { hostId },
      include: {
        bookings: {
          where: {
            status: { in: ['confirmed', 'completed'] },
            checkOut: { gte: startDate },
            checkIn: { lte: now },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    return properties.map((property) => {
      let totalDaysBooked = 0;

      property.bookings.forEach((booking) => {
        const checkIn = new Date(
          Math.max(booking.checkIn.getTime(), startDate.getTime())
        );
        const checkOut = new Date(
          Math.min(booking.checkOut.getTime(), now.getTime())
        );

        if (checkOut > checkIn) {
          const bookedDays = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)
          );
          totalDaysBooked += bookedDays;
        }
      });

      const occupancyRate = Math.round((totalDaysBooked / days) * 100 * 10) / 10;

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        occupancyRate: Math.min(occupancyRate, 100),
        totalDaysBooked,
        periodDays: days,
      };
    });
  }
}

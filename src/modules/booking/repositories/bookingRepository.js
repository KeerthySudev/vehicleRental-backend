const prisma = require("../../../configs/prisma/prismaConfig");

class BookingRepository {

  static async getBookingById(id) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        customer: true, 
      },
    });
  }

  static async getAllBookings() {
    return await prisma.booking.findMany({
      include: {
        vehicle: true, 
        customer: true, 
      },
    });
  }
}

module.exports = BookingRepository;

const ExcelJS = require('exceljs');

  const generateAllBookingsExcel = async (bookings) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Booking Details');
  
    // Define columns for the all bookings
    worksheet.columns = [
      { header: 'Booking ID', key: 'id', width: 20 },
      { header: 'Booking Date', key: 'date', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Customer ID', key: 'userId', width: 20 },
      { header: 'Customer Name', key: 'userName', width: 30 },
      { header: 'Vehicle Id', key: 'vehicleId', width: 20 },
      { header: 'Vehicle Name', key: 'vehicleName', width: 30 },
      { header: 'Pickup Location', key: 'pickupLocation', width: 30 },
      { header: 'Pickup Date', key: 'pickupDate', width: 20 },
      { header: 'Pickup Time', key: 'pickupTime', width: 20 },
      { header: 'Dropoff Location', key: 'dropoffLocation', width: 30 },
      { header: 'Dropoff Date', key: 'dropoffDate', width: 20 },
      { header: 'Dropoff Time', key: 'dropoffTime', width: 20 },
      { header: 'Total Amount', key: 'totalPrice', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 20 },
    ];

    // Loop through each booking and add data to the worksheet
    bookings.forEach((booking) => {
      worksheet.addRow({
        id: booking.id,
        date: booking.createdAt,
        status: booking.status,
        userId: booking.customerId,
        userName: booking.customer.name,
        vehicleId: booking.vehicleId,
        vehicleName: booking.vehicle.name,
        pickupLocation: booking.pickupLocation,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        dropoffLocation: booking.dropoffLocation,
        dropoffDate: booking.dropoffDate,
        dropoffTime: booking.dropoffTime,
        totalPrice: booking.amount,
        paymentStatus: booking.paymentStatus,
      });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();

    // Convert the buffer to a base64 string
    const base64Data = buffer.toString('base64');
    return base64Data;
};

  module.exports = generateAllBookingsExcel;
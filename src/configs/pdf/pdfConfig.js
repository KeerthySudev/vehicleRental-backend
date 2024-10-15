const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const moment = require('moment');

const generateBookingPDF = async (booking) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const { width, height } = page.getSize();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Set the title and format it
  page.drawText('Booking Details', {
    x: 50,
    y: height - 30,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  const startX = 50;
  let startY = height - 80;
  const rowHeight = 20;
  const columnWidth = 150;

  // Define headers for the table
//   const headers = [
//     'Field',
//     'Details'
//   ];

  const fields = [
    ['Booking ID', String(booking.id)],
    ['Booking Date', moment(booking.createdAt).format('DD-MM-YYYY')],
    ['Status', booking.status],
    ['Customer Name', booking.customer.name],
    ['Vehicle', booking.vehicle.name],
    ['Pickup Location', booking.pickupLocation],
    ['Pickup Date', moment(booking.pickupDate).format('DD-MM-YYYY')],
    ['Pickup Time', booking.pickupTime],
    ['Dropoff Location', booking.dropoffLocation],
    ['Dropoff Date', moment(booking.dropoffDate).format('DD-MM-YYYY')],
    ['Dropoff Time', booking.dropoffTime],
    ['Total Price', `Rs ${String(booking.amount)}`],
    ['Payment Status', booking.paymentStatus],
  ];

// Draw table headers
//   headers.forEach((header, index) => {
//     page.drawText(header, {
//       x: startX + index * columnWidth,
//       y: startY,
//       size: 12,
//       font: timesRomanFont,
//       color: rgb(0, 0, 0),
//     });
//   });

  // Draw a horizontal line for the header row
  page.drawLine({
    start: { x: startX, y: startY - 5 },
    end: { x: startX + 2 * columnWidth, y: startY - 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Draw table rows
  fields.forEach((field, rowIndex) => {
    const yPosition = startY - (rowIndex + 1) * rowHeight;

    // Draw field name (left column)
    page.drawText(field[0], {
      x: startX,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Draw field value (right column)
    page.drawText(field[1], {
      x: startX + columnWidth,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Draw a line separating the rows
    page.drawLine({
      start: { x: startX, y: yPosition - 5 },
      end: { x: startX + 2 * columnWidth, y: yPosition - 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
  });


  // Save the document and convert it to bytes
  const pdfBytes = await pdfDoc.save();

  // Convert the PDF bytes to a base64 string
  const base64PDF = Buffer.from(pdfBytes).toString('base64');

  return base64PDF;
};

module.exports = generateBookingPDF;

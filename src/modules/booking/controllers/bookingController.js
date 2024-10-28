/**
 * Booking Controller
 *
 * Handles booking-related operations, including fetching and exporting bookings.
 *
 * @module BookingController
 */

const BookingRepository = require("../repositories/bookingRepository");
const generateAllBookingsExcel = require("../../../configs/excel/excelConfig");
const generateBookingPDF = require("../../../configs/pdf/pdfConfig");

class BookingController {


  /**
   * Get Booking by its ID.
   *
   * @async
   * @param {number} id - Booking ID
   * @returns {object} Booking data
   * @throws {Error} If booking not found or fetch error occurs
   */
  static async getBookingById(id) {
    try {
      const booking = await BookingRepository.getBookingById(id);
      if (!booking) {
        throw new Error("Booking not found");
      }
      return booking;
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw new Error("Error fetching booking");
    }
  }


  /**
   * Export a PDF for a single booking.
   *
   * @async
   * @param {number} id - Booking ID
   * @returns {string} Base64-encoded PDF
   * @throws {Error} If booking not found or PDF generation fails
   */
  static async exportBooking(id) {
    try {
      const booking = await BookingRepository.getBookingById(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Generate the PDF for the single booking
      const pdfBase64 = await generateBookingPDF(booking);

      return pdfBase64; // Return the base64-encoded PDF
    } catch (error) {
      console.error("Error exporting booking as PDF:", error);
      throw new Error("Failed to export booking as PDF.");
    }
  }


  /**
   * Export an Excel file for all bookings.
   *
   * @async
   * @returns {string} Base64-encoded Excel file
   * @throws {Error} If booking data not found or Excel generation fails
   */
  static async exportAllBookings() {
    try {
      // Fetch the booking data for the given id
      const booking = await BookingRepository.getAllBookings();
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Generate the Excel file for the single booking
      const filePath = await generateAllBookingsExcel(booking);

      const base64File = filePath.toString("base64");

      return base64File; // Return the base64 string
    } catch (error) {
      console.error("Error exporting booking:", error);
      throw new Error("Failed to export booking.");
    }
  }
}

module.exports = BookingController;



const vehicleService = require('../../repositories/bookingRepository');
const bucket = process.env.MINIO_BUCKET;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const  minioClient  = require('../../../../configs/minio/minioConfig');
const manufacturerValidationSchema = require('../../requests/manufactureRequests');
const crypto = require("crypto");
const  typesenseClient  = require('../../../../configs/typesense/typesenseConfig');
const fs = require('fs');
const generateAllBookingsExcel  = require('../../../../configs/excel/excelConfig');
const generateBookingPDF = require('../../../../configs/pdf/pdfConfig');
const vehicle = require('../../../vehicle/graphQL/typedefs/models/vehicle');
const razorpay = require('../../../../configs/razorpay/razorpayConfig')

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

const bookingResolvers = {
  Query: {
    // Get all bookings
    getAllBookings: async () => {
      try {
        const bookings = await prisma.booking.findMany({
          include: {
            vehicle: true, 
            customer: true, 
          },
        });
        console.log("bookings.customer", bookings);
        return bookings;
      } catch (error) {
        console.error("Error fetching all bookings:", error);
        throw new Error("Error fetching bookings");
      }
    },

    // Get booking by its ID
    getBookingById: async (_, { id }) => {
      try {
        const booking = await prisma.booking.findUnique({
          where: { id },
          include: {
            vehicle: true,
            customer: true, 
          },
        });
        if (!booking) {
          throw new Error("Booking not found");
        }
        return booking;
      } catch (error) {
        console.error(`Error fetching booking with ID ${id}:`, error);
        throw new Error("Error fetching booking");
      }
    },

    // Get all bookings by user (customer) ID
    getBookingsByUser: async (_, { customerId }) => {
      try {
        const bookings = await prisma.booking.findMany({
          where: {
            customerId: customerId,
            paymentStatus: 'paid',
          },
          include: {
            vehicle: true, 
            customer: true,
          },
        });

        if (bookings.length === 0) {
          throw new Error("No bookings found for this user");
        }
        return bookings;
        
      } catch (error) {
        console.error(`Error fetching bookings for user with ID ${id}:`, error);
        throw new Error("Error fetching bookings");
      }
    },
   

exportBooking: async (_, { id }) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true, // Include customer details
        vehicle: true,  // Include vehicle details
      },
    });
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Generate the PDF for the single booking
    const pdfBase64 = await generateBookingPDF(booking);

    return pdfBase64; // Return the base64-encoded PDF
  } catch (error) {
    console.error('Error exporting booking as PDF:', error);
    throw new Error('Failed to export booking as PDF.');
  }
},

    exportAllBookings: async () => {
      try {
        // Fetch the booking data for the given id
        const booking = await prisma.booking.findMany({
          include: {
            vehicle: true, 
            customer: true, 
          },
        });

       

        if (!booking) {
          throw new Error('Booking not found');
        }

       
        // Generate the Excel file for the single booking
        const filePath = await generateAllBookingsExcel(booking);

        // Read the file and convert to base64 to send via GraphQL
        // const fileBuffer = fs.readFileSync(filePath);
        const base64File = filePath.toString('base64');

        // Optionally delete the file after reading
        // fs.unlinkSync(filePath);

        return base64File; // Return the base64 string
      } catch (error) {
        console.error('Error exporting booking:', error);
        throw new Error('Failed to export booking.');
      }
    },
  },
  Mutation: {
    createBooking: async (_, { input }) => {
      const {
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        pickupLocation,
        dropoffLocation,
        amount,
        vehicleId,
        customerId,
      } = input;

     

      try {

        let dropOffLocation;

        if(dropoffLocation){
          dropOffLocation = dropoffLocation;
        }
        else{
          dropOffLocation = pickupLocation;
        }

        const booking = await prisma.booking.create({
          data: {
            pickupDate: new Date(pickupDate),  
            pickupTime,
            dropoffDate: new Date(dropoffDate), 
            dropoffTime,
            pickupLocation,
            dropoffLocation : dropOffLocation,
            amount,
            vehicleId,
            customerId,
            status:'pending',
          },
        });

        const options = {
          amount: booking.amount * 100, 
          currency: 'INR',
          receipt: `receipt_order_${booking.id}`,
        };
      
        const razorpayOrder = await razorpay.orders.create(options);
      
        return {
          id: booking.id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount / 100, 
          currency: razorpayOrder.currency,
        };

      } catch (error) {
        throw new Error('Error creating booking: ' + error.message);
      }
    },
    updateBookingPayment: async (_, { id, razorpayPaymentId, razorpaySignature }) => {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "Booked",        
          paymentStatus: "paid", 
          razorpayPaymentId,        
          razorpaySignature,         
        },
      });
  
      // Fetch the vehicle associated with the booking
      const booking = await prisma.booking.findUnique({
        where: { id },
        select: { vehicle: { select: { id: true, availableQty: true, name: true, description: true, price: true, manufacturer: true, model: true, primaryImage: true, secondaryImage: true, isRentable: true } } },
      });

      if (!booking.vehicle) {
        throw new Error('Vehicle associated with the booking not found.');
      }

      const vehicle = booking.vehicle;

      const foundManufacturer = await prisma.manufacturer.findUnique({
        where: { id: vehicle.manufacturer.id },
      });
    
      if (!foundManufacturer) {
        throw new Error('Manufacturer not found');
      }
    
      const foundModel = await prisma.model.findUnique({
        where: { id: vehicle.model.id },
      });
    
      if (!foundModel) {
        throw new Error('Model not found');
      }


      // Reduce the quantity of the vehicle by 1
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          availableQty: {
            decrement: 1, // Reduce availableQty by 1
          },
        },
      });
  
      const updatedTypesenseDocument = {
        id: String(vehicle.id), 
        name: vehicle.name,
        description: vehicle.description,
        price: vehicle.price,
        availableQty: updatedVehicle.availableQty, 
        isRentable: vehicle.isRentable,
        primaryImage: vehicle.primaryImage,
        secondaryImage: vehicle.secondaryImage,
        manufacturerName: foundManufacturer.name, 
        modelName: foundModel.name ,              
      };
  
      await typesenseClient.collections('vehicles').documents().upsert(updatedTypesenseDocument);

      return updatedBooking;
    },
    rentOutVehicle :  async (_, { id }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: id },
        include: {
          customer: true, // Include customer details
          vehicle: true,  // Include vehicle details
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }
console.log("booking", booking);
      if(booking.status == 'Booked'){
        const updatedBooking = await prisma.booking.update({
          where: { id: id },
          include: {
            customer: true,
            vehicle: true,  
          },
          data: {
            status: 'Rented', 
          },
        });
        
        return updatedBooking;
      }

      else if(booking.status == 'Rented'){
        const updatedBooking = await prisma.booking.update({
          where: { id: id },
          data: {
            status: 'Returned', 
          },
        });
        console.log("booking updated", updatedBooking);
        const vehicle = booking.vehicle;
        console.log("vehicle", vehicle);
        const foundManufacturer = await prisma.manufacturer.findUnique({
          where: { id: vehicle.manufacturerId },
        });
        console.log("manufacturer", foundManufacturer);
        if (!foundManufacturer) {
          throw new Error('Manufacturer not found');
        }
        
        const foundModel = await prisma.model.findUnique({
          where: { id: vehicle.modelId },
        });
        console.log("model", foundModel);
        if (!foundModel) {
          throw new Error('Model not found');
        }

        
        const updatedVehicle = await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: {
            availableQty: {
              increment: 1, 
            },
          },
        });
        console.log("vehicle update", updatedVehicle);
        const updatedTypesenseDocument = {
          id: String(vehicle.id), 
          name: vehicle.name,
          description: vehicle.description,
          price: vehicle.price,
          availableQty: updatedVehicle.availableQty, 
          isRentable: vehicle.isRentable,
          primaryImage: vehicle.primaryImage,
          secondaryImage: vehicle.secondaryImage,
          manufacturerName: foundManufacturer.name, 
          modelName: foundModel.name ,              
        };
        console.log("typesense update", updatedTypesenseDocument);
        await typesenseClient.collections('vehicles').documents().upsert(updatedTypesenseDocument);

        return updatedBooking;
      }

// return booking;
      
    },
    deleteBooking: async (_, { id }) => {
      try {
        const deletedBooking = await prisma.booking.delete({
          where: { id },
        });
        return deletedBooking;
      } catch (error) {
        throw new Error('Error deleting booking: ' + error.message);
      }
    },
  },
};
  
  module.exports = bookingResolvers;




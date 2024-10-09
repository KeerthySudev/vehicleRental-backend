

const vehicleService = require('../../repositories/bookingRepository');
const bucket = process.env.MINIO_BUCKET;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mime = require('mime-types');
const  minioClient  = require('../../../../configs/minioConfig');
const manufacturerValidationSchema = require('../../requests/manufactureRequests');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const  typesenseClient  = require('../../../../configs/typesenseConfig');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
        const booking = await prisma.booking.create({
          data: {
            pickupDate: new Date(pickupDate),  
            pickupTime,
            dropoffDate: new Date(dropoffDate), 
            dropoffTime,
            pickupLocation,
            dropoffLocation,
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
  
      if (!booking || !booking.vehicle) {
        throw new Error('Vehicle associated with the booking not found.');
      }

      const vehicle = booking.vehicle;

      const foundManufacturer = await prisma.manufacturer.findUnique({
        where: { id: vehicle.manufacturerId },
      });
    
      if (!foundManufacturer) {
        throw new Error('Manufacturer not found');
      }
    
      const foundModel = await prisma.model.findUnique({
        where: { id: vehicle.modelId },
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
  },
};
  
  module.exports = bookingResolvers;




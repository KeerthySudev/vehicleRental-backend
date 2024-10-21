
const BookingController = require("../../controllers/bookingController");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const  typesenseClient  = require('../../../../configs/typesense/typesenseConfig');
const razorpay = require('../../../../configs/razorpay/razorpayConfig')


const bookingResolvers = {
  Query: {
    
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
        return await BookingController.getBookingById(id);
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
  return await BookingController.exportBooking(id);
},

    exportAllBookings: async () => {
      return await BookingController.exportAllBookings();
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
        select: { vehicle: { select: { id: true, availableQty: true, name: true, description: true, price: true, manufacturer: true, model: true, primaryImage: true,  isRentable: true } } },
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




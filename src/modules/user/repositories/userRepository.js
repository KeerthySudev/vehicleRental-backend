const prisma = require("../../../configs/prisma/prismaConfig");

class UserRepository {
  static async getCustomer(email) {
    const customer = await prisma.customer.findUnique({
      where: {
        email: email,
      },
    });
    return customer;
  }

  static async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });
    return customer;
  }

  static async getCustomerByPhone(phone) {
    const customer = await prisma.customer.findUnique({
      where: {
        phone: phone,
      },
    });
    return customer;
  }

  static async getCustomerByEmail(email) {
    const customer = await prisma.customer.findUnique({
      where: {
        email: email,
      },
    });
    return customer;
  }

  static async updatePassword({ id, hashedPassword }) {
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return updatedCustomer;
  }

  static async updateCustomer({ id, data, image }) {
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        ...(image && { image }),
      },
    });

    return updatedCustomer;
  }

  static async registerCustomer(customerInput, hashedPassword) {
    const customer = await prisma.customer.create({
      data: {
        name: customerInput.name,
        email: customerInput.email,
        phone: customerInput.phone,
        city: customerInput.city,
        state: customerInput.state,
        country: customerInput.country,
        pincode: customerInput.pincode,
        password: hashedPassword,
        role: "user",
      },
    });

    return customer;
  }
}

module.exports = UserRepository;

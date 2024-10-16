
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getCustomer = async (email) => {
  const customer = await prisma.customer.findUnique({
    where: {
      email: email,
    },
  })
  return customer
};

const registerCustomer = async (customerInput,hashedPassword) => {
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
  })

  return customer
};

module.exports = {
  getCustomer,
  registerCustomer,
};

# Use an official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /src

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of your application code
COPY . .

# Run prisma generate to create the client
RUN npx prisma generate

# Expose the port your app runs on
EXPOSE 5000

# Start the app
CMD ["npm", "start"]

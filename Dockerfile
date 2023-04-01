# Use the official Node.js v18.14.2 image as the base image
FROM node:18.14.2

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies from package.json
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port your application will run on (use the port number your app is configured to listen on)
EXPOSE 3000

# Define the command to start the application
CMD ["node", "app.js"]

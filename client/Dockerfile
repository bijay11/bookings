# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose the port Next.js runs on by default
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]

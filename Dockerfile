# Dockerfile for Railway deployment with native module support
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci && npm rebuild sodium-native || true

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Start the application
CMD ["npm", "start"]


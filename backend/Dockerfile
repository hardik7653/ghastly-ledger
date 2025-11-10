FROM node:18-alpine

# Install dependencies for Sharp (image processing)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Initialize database and start server
CMD ["sh", "-c", "node database/init.js && node server.js"]

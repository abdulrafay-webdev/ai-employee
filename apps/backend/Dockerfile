# Base image
FROM node:20-slim

# Install Chromium and required libs
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer variables for Railway
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

# Copy and install dependencies
COPY apps/backend/package*.json ./
RUN npm install --production && npm install typescript tsc-alias

# Copy source
COPY apps/backend/ .

# Build
RUN npx tsc

# Expose
EXPOSE 3001

# Start
CMD ["node", "dist/index.js"]

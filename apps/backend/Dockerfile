# Base image
FROM node:20-slim

# Install Chromium and required libs for WhatsApp
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

# Copy ALL package files from root for workspace support
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN npx tsc

# Expose port
EXPOSE 3001

# Start using the workspace command (Railway standard)
CMD ["npm", "run", "start"]

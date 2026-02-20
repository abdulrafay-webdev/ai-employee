# Base image with Node.js
FROM node:20-slim

# Install necessary dependencies for Chrome (whatsapp-web.js)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy ALL package files first for better caching
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Shared Package
RUN npm run build -w @personal-ai/shared

# Build Backend
RUN npm run build -w backend

# Verify if index.js exists (for debugging in logs if it fails)
RUN ls -R apps/backend/dist

# Expose backend port
EXPOSE 3001

# Start the application
# We use the explicit path to avoid any workspace resolution issues
CMD ["node", "apps/backend/dist/index.js"]

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

# Copy ALL package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install dependencies (ignoring scripts to avoid prisma issues during install)
RUN npm install

# Copy source code
COPY . .

# Explicitly build shared package
WORKDIR /app/shared
RUN npx tsc

# Build backend with shared reference
WORKDIR /app/apps/backend
RUN npx tsc

# Final verification
RUN ls -R dist

WORKDIR /app

# Expose backend port
EXPOSE 3001

# Start the application
CMD ["node", "apps/backend/dist/apps/backend/src/index.js"]
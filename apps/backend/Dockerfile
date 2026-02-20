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

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build backend (The tsconfig will now pull shared files automatically into dist)
WORKDIR /app/apps/backend
RUN npx tsc

# Verify directory structure
RUN ls -R dist

# Expose backend port
EXPOSE 3001

# Start the application pointing to the exact compiled index
CMD ["node", "dist/apps/backend/src/index.js"]

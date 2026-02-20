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

# Copy the entire monorepo package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install ALL dependencies first (required for workspaces)
RUN npm install

# Copy everything
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN npx tsc

# Final Expose and Command
EXPOSE 3001
CMD ["node", "dist/index.js"]
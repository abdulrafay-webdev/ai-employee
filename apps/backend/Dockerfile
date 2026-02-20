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

# Install dependencies (from root to handle workspaces)
RUN npm install

# Copy source code
COPY . .

# Build shared package (Backend depends on this)
RUN npm run build -w @personal-ai/shared

# Build backend
WORKDIR /app/apps/backend
RUN npx tsc

# Back to root
WORKDIR /app

# Expose backend port
EXPOSE 3001

# Start the application using the workspace command
CMD ["npm", "run", "start", "-w", "backend"]
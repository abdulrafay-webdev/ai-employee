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

# Copy backend package files
COPY apps/backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source (which now includes local shared/ folder)
COPY apps/backend/ .

# Build backend
RUN npx tsc

# Expose port
EXPOSE 3001

# Start the application pointing to the exact compiled index
CMD ["node", "dist/index.js"]
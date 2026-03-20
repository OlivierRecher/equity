# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package info
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client & Build TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package info
COPY package.json package-lock.json* ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Generate Prisma Client explicitly for the runner
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose API port
EXPOSE 3000

# Set entrypoint to run migrations then start server
CMD ["./start.sh"]

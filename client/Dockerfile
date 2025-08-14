# Stage 1: Build the Angular application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application with development configuration (no budget checks)
RUN npx ng build --configuration=development

# Stage 2: Serve the application
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy package files for production dependencies
COPY package*.json ./

# Copy environment replacement script
COPY replace-env.sh ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Make script executable
RUN chmod +x replace-env.sh

# Set default API URL environment variable
ENV API_URL=http://localhost:5000/api

# Expose port
EXPOSE 4000

# Use script as entrypoint
ENTRYPOINT ["./replace-env.sh"]

# Start the application
CMD ["npm", "run", "serve:ssr:client"]
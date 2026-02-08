# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copiar eng.traineddata para o container
COPY data/eng.traineddata /app/data/eng.traineddata

# Make port 3000 available
EXPOSE 3000

# Define the command to run the app
CMD ["node", "dist/index.js"]

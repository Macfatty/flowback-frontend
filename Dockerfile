# --- Stage 1: Build Stage ---
FROM node:24-alpine3.21 AS sk-build

# Set the working directory inside the container
WORKDIR /app

# Define Build Arguments
# SvelteKit needs PUBLIC_ variables available at build time
ARG PUBLIC_API_URL=/api
ARG TZ=Europe/Stockholm

# Set Environment Variables
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV TZ=$TZ

# Copy package files and install dependencies
# We do this before copying the rest of the code to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the SvelteKit application
RUN npm run build


# --- Stage 2: Runtime Stage ---
FROM node:24-alpine3.21

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=sk-build /app/package.json ./
COPY --from=sk-build /app/package-lock.json ./
COPY --from=sk-build /app/build ./build

# Install only production dependencies to keep the image small
RUN npm ci --omit=dev --ignore-script

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for runtime
ENV NODE_ENV=production

# Start the application using Node.js
# Using '0.0.0.0' is crucial to allow traffic from outside the container
CMD ["node", "build/index.js"]

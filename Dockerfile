FROM node:22-slim

WORKDIR /app

# Install curl and clean up in the same layer
RUN apt-get update -y && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies and clean npm cache
RUN npm install && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Build the TypeScript application and keep only production dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["npm", "start"]

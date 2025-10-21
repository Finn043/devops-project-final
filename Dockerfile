# Dockerfile for TechStore Ecommerce Application
# Group Melvin Final - SWE40006 DevOps Project
#
# This Dockerfile creates a production-ready container for our Node.js application
# Multi-stage build optimized for size and security

# Use Docker BuildKit syntax for improved performance and features
# syntax=docker/dockerfile:1.7

# Base image: Node.js 20 on Alpine Linux (lightweight, secure)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (Docker layer caching optimization)
# This step is cached unless package.json or package-lock.json changes
COPY package*.json ./

# Install only production dependencies
# --omit=dev excludes devDependencies for smaller image size
RUN npm ci --omit=dev

# Copy all application source code
# This happens after npm install for better layer caching
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose port 3000 for the Express server
# This is the port our application listens on
EXPOSE 3000

# Start the application
# Using exec form (JSON array) for better signal handling
CMD ["node","server.js"]
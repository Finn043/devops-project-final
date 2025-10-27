# TechStore - E-commerce DevOps Project

A production-ready e-commerce web application for technology devices with complete CI/CD pipeline implementation.

**Group Melvin Final - SWE40006 DevOps Project**

## Project Overview

TechStore is a full-featured e-commerce platform demonstrating modern DevOps practices including:

- Complete CI/CD pipeline with automated testing and deployment
- Multi-stage deployment (Staging → Production with manual approval)
- Containerization with Docker and multi-platform support
- Production monitoring with Prometheus metrics
- Automated deployment to AWS EC2 instances

## Application Features

### E-commerce Functionality

- **Product Catalog**: Browse smartphones, laptops, tablets, and accessories
- **Product Categories**: Filtered views by category
- **Product Details**: Detailed specifications and pricing
- **Shopping Cart**: Add/remove items with real-time updates
- **Help Center**: Comprehensive FAQ and customer support system

### Technical Features

- **Health Monitoring** (`/health`): Application health status
- **Prometheus Metrics** (`/metrics`): Request duration, build info, and Node.js metrics
- **API Endpoints**: RESTful API for products and cart management
- **Responsive Design**: Mobile-friendly user interface

## Tech Stack

- **Runtime**: Node.js 20 (ES Modules)
- **Framework**: Express.js
- **Monitoring**: Prometheus (prom-client)
- **Testing**: Jest with Supertest
- **Containerization**: Docker (multi-platform: AMD64/ARM64)
- **CI/CD**: GitHub Actions (3-stage pipeline)
- **Infrastructure**: AWS EC2
- **Registry**: Docker Hub

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```
2. **Start development server**:

   ```bash
   npm run dev
   ```
3. **Run tests**:

   ```bash
   npm test
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Build and Run Locally

```bash
# Build Docker image
docker build -t techstore .

# Run container
docker run -p 3000:3000 techstore
```

### Using Docker Compose

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

The application runs on port 3001 when using docker-compose (mapped from container port 3000).

## CI/CD Pipeline

The GitHub Actions workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) implements a complete 3-stage deployment pipeline:

### Pipeline Stages

#### Stage 1: Build & Test

1. Checkout code from repository
2. Set up Node.js 20 environment
3. Install dependencies with `npm ci`
4. Run Jest test suite
5. Build multi-platform Docker images (linux/amd64, linux/arm64)
6. Push to Docker Hub with tags:
   - `tinluong043/devops-demo:staging`
   - `tinluong043/devops-demo:<commit-sha>`

#### Stage 2: Deploy to Staging (Automatic)

1. SSH into staging EC2 instance
2. Pull Docker image by commit SHA
3. Stop and remove old container
4. Deploy new container on port 80
5. Clean up old images

#### Stage 3: Deploy to Production (Manual Approval Required)

1. Wait for manual approval via GitHub Environments
2. SSH into production EC2 instance
3. Deploy the same tested image from staging
4. Update production container
5. Clean up old images

### Required GitHub Secrets

Configure in Settings → Secrets and variables → Actions:

**Docker Hub:**

- `DOCKERHUB_USER`: Docker Hub username
- `DOCKERHUB_PASS`: Docker Hub password or access token

**Staging EC2:**

- `STAGING_EC2_HOST`: Staging server hostname/IP
- `STAGING_EC2_USER`: SSH username (e.g., ubuntu)
- `STAGING_EC2_SSH_KEY`: Private SSH key for staging server

**Production EC2:**

- `EC2_HOST`: Production server hostname/IP
- `EC2_USER`: SSH username (e.g., ubuntu)
- `EC2_SSH_KEY`: Private SSH key for production server

### Production URL

Live Production: http://52.62.52.80

## API Documentation

### Product Endpoints

| Endpoint              | Method | Description       | Query Parameters         |
| --------------------- | ------ | ----------------- | ------------------------ |
| `/api/products`     | GET    | Get all products  | `category`, `search` |
| `/api/products/:id` | GET    | Get product by ID | -                        |

### Cart Endpoints

| Endpoint                 | Method | Description           | Headers                     |
| ------------------------ | ------ | --------------------- | --------------------------- |
| `/api/cart`            | GET    | Get cart items        | `x-session-id` (optional) |
| `/api/cart`            | POST   | Add item to cart      | `x-session-id` (optional) |
| `/api/cart/:productId` | DELETE | Remove item from cart | `x-session-id` (optional) |

### System Endpoints

| Endpoint      | Method | Description             |
| ------------- | ------ | ----------------------- |
| `/health`   | GET    | Health check status     |
| `/api/ping` | GET    | API ping with timestamp |
| `/metrics`  | GET    | Prometheus metrics      |

## Pages

| Route                   | Description                      |
| ----------------------- | -------------------------------- |
| `/`                   | Home page with featured products |
| `/products/:category` | Category-filtered products       |
| `/product/:id`        | Product detail page              |
| `/cart`               | Shopping cart page               |
| `/help`               | Help center with FAQ             |

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline configuration
├── public/
│   ├── images/                 # Product images
│   └── styles.css              # Application styles
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Docker container configuration
├── docker-compose.yml          # Docker Compose configuration
├── index.js                    # Application entry point
├── server.js                   # Express app with routes and logic
├── server.test.js              # Jest test suite
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
└── README.md                   # This file
```

## npm Scripts

| Script           | Command                                         | Description                               |
| ---------------- | ----------------------------------------------- | ----------------------------------------- |
| `start`        | `node index.js`                               | Start production server                   |
| `dev`          | `node --watch index.js`                       | Start development server with auto-reload |
| `test`         | `NODE_OPTIONS=--experimental-vm-modules jest` | Run Jest tests                            |
| `docker:build` | `docker build -t techstore .`                 | Build Docker image                        |
| `docker:run`   | `docker run -p 3000:3000 techstore`           | Run Docker container                      |

## Monitoring

The application exposes Prometheus metrics at `/metrics` including:

### Custom Metrics

- `http_request_duration_seconds`: HTTP request duration histogram
  - Labels: `route`, `method`, `status`
  - Buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
- `app_build_info`: Build metadata gauge
  - Labels: `version`, `git_sha`

### Default Metrics

- Process CPU usage
- Process memory usage
- Node.js event loop metrics
- Garbage collection metrics

## Product Catalog

Current products in the catalog:

1. **iPhone 15 Pro** - $2,000
2. **MacBook Pro 14"** - $1,999
3. **Samsung Galaxy S24 Ultra** - $1,199
4. **Dell XPS 13** - $1,299
5. **iPad Pro 12.9"** - $1,099
6. **AirPods Pro (2nd gen)** - $249

## Deployment Guide

### AWS EC2 Deployment

1. **Launch EC2 Instance**:

   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Open port 80 in security group
2. **Install Docker**:

   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io
   sudo usermod -aG docker ubuntu
   newgrp docker
   ```
3. **Deploy Application**:

   ```bash
   docker pull tinluong043/devops-demo:staging
   docker run -d --name app -p 80:3000 --restart=always \
     -e APP_VERSION=1.0.0 \
     -e GIT_SHA=production \
     tinluong043/devops-demo:staging
   ```
4. **Verify Deployment**:

   ```bash
   curl http://localhost/health
   ```

## Security Best Practices

- ✅ Never commit secrets or API keys
- ✅ Use GitHub Secrets for sensitive configuration
- ✅ Docker images use official Node.js Alpine base
- ✅ Production dependencies only in Docker image
- ✅ Restart policy configured for high availability
- ⚠️ Production deployments should use HTTPS/TLS
- ⚠️ Consider implementing authentication for production

## Testing

The project includes comprehensive Jest tests covering:

- Home page rendering
- Health check endpoint
- API ping endpoint
- Prometheus metrics endpoint

Run tests with:

```bash
npm test
```

## Environment Variables

| Variable        | Description         | Default    |
| --------------- | ------------------- | ---------- |
| `PORT`        | Server port         | 3000       |
| `NODE_ENV`    | Environment mode    | production |
| `APP_VERSION` | Application version | dev        |
| `GIT_SHA`     | Git commit SHA      | dev        |

## Contributing

This is an educational project for demonstrating DevOps practices.

## License

MIT License - Educational purposes for SWE40006 course.

## Authors

**Group:** **Wed-16.30-MD-G1**

- Course: SWE40006
- Project: DevOps Final Project
- Repository: https://github.com/Finn043/devops-project-final
